const DB_NAME = 'InstagramPlannerDB';
const DB_VERSION = 1;

let dbInstance = null;

function getDB() {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject('IndexedDB error: ' + event.target.errorCode);
    };
  });
}

const db = {
  // Post Operations
  getAllPosts: async () => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('posts', 'readonly');
      const store = transaction.objectStore('posts');
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort posts by their orderIndex
        const posts = request.result || [];
        posts.sort((a, b) => a.orderIndex - b.orderIndex);
        resolve(posts);
      };

      request.onerror = () => {
        reject('Error getting posts');
      };
    });
  },

  savePost: async (post) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('posts', 'readwrite');
      const store = transaction.objectStore('posts');
      const request = store.put(post);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error saving post');
    });
  },

  deletePost: async (id) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('posts', 'readwrite');
      const store = transaction.objectStore('posts');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Error deleting post');
    });
  },

  saveAllPosts: async (posts) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('posts', 'readwrite');
      const store = transaction.objectStore('posts');

      // Clear the store first or overwrite
      posts.forEach((post) => {
        store.put(post);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject('Error saving multiple posts');
    });
  },

  // Profile Operations
  getProfile: async () => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('profile', 'readonly');
      const store = transaction.objectStore('profile');
      const request = store.get('profileData');

      request.onsuccess = () => {
        const defaultProfile = {
          key: 'profileData',
          username: 'feed_previewer',
          fullName: 'Instagram Planner',
          bio: 'Grid Planner App 📱\nDrag & drop to rearrange your posts.\nSwipe post to view details! ✨',
          website: 'github.com/google-deepmind',
          avatar: null, // Blob
          followersCount: 1250,
          followingCount: 380,
          theme: 'light'
        };
        resolve(request.result || defaultProfile);
      };

      request.onerror = () => {
        reject('Error getting profile');
      };
    });
  },

  saveProfile: async (profileData) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('profile', 'readwrite');
      const store = transaction.objectStore('profile');
      profileData.key = 'profileData';
      const request = store.put(profileData);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error saving profile');
    });
  }
};

window.db = db;
