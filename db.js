const DB_NAME = 'InstagramPlannerDB';
const DB_VERSION = 2;

let dbInstance = null;

function getDB() {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onblocked = () => {
      console.warn("Database upgrade is blocked by another open connection. Please close other tabs of this app.");
      alert("データベースの更新がブロックされました。他のタブでこのアプリを開いている場合は、それらを閉じて再読み込みしてください。");
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('highlights')) {
        db.createObjectStore('highlights', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      
      // Close database connection if a version upgrade is requested elsewhere
      dbInstance.onversionchange = () => {
        dbInstance.close();
        dbInstance = null;
        console.warn("Database version changed elsewhere. Connection closed.");
        alert("新しいバージョンのデータベースが利用可能です。ページを再読み込みしてください。");
      };

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
  },

  // Highlight Operations
  getAllHighlights: async () => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('highlights', 'readonly');
      const store = transaction.objectStore('highlights');
      const request = store.getAll();

      request.onsuccess = () => {
        const highlights = request.result || [];
        // Sort by order or creation time
        highlights.sort((a, b) => a.orderIndex - b.orderIndex);
        resolve(highlights);
      };
      request.onerror = () => reject('Error getting highlights');
    });
  },

  saveHighlight: async (highlight) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('highlights', 'readwrite');
      const store = transaction.objectStore('highlights');
      const request = store.put(highlight);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error saving highlight');
    });
  },

  deleteHighlight: async (id) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('highlights', 'readwrite');
      const store = transaction.objectStore('highlights');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Error deleting highlight');
    });
  },

  saveAllHighlights: async (highlights) => {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('highlights', 'readwrite');
      const store = transaction.objectStore('highlights');

      highlights.forEach((h) => {
        store.put(h);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject('Error saving multiple highlights');
    });
  }
};

window.db = db;
