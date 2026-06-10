// State Management
let state = {
  posts: [],
  profile: {},
  highlights: [], // Array of highlights
  activePost: null,
  activeMediaIndex: 0,
  uploadedMedia: [], // Array of { file, url, type }
  uploadedHighlightCover: null, // Blob/File
  createActiveIndex: 0,
  isMuted: true
};

// DOM References
const elements = {
  // Theme
  body: document.body,
  btnThemeToggle: document.getElementById('btn-theme-toggle'),
  themeIconLight: document.querySelector('.theme-icon-light'),
  themeIconDark: document.querySelector('.theme-icon-dark'),

  // Header & Profile Info
  headerUsername: document.getElementById('header-username'),
  btnEditAvatar: document.getElementById('btn-edit-avatar'),
  profileAvatarImg: document.getElementById('profile-avatar-img'),
  navProfileAvatarImg: document.getElementById('nav-profile-avatar-img'),
  profileFullname: document.getElementById('profile-fullname'),
  profileBioText: document.getElementById('profile-bio-text'),
  profileWebsiteLink: document.getElementById('profile-website-link'),
  statPostsCount: document.getElementById('stat-posts-count'),
  statFollowersCount: document.getElementById('stat-followers-count'),
  statFollowingCount: document.getElementById('stat-following-count'),
  btnEditProfile: document.getElementById('btn-edit-profile'),
  btnShareProfile: document.getElementById('btn-share-profile'),

  // Highlights
  highlightsList: document.getElementById('highlights-list'),
  btnNewHighlight: document.getElementById('btn-new-highlight'),

  // Grid
  postsGrid: document.getElementById('posts-grid-element'),
  emptyState: document.getElementById('posts-empty-state'),
  btnEmptyCreate: document.getElementById('btn-empty-create'),

  // Navigation Bottom
  navBtnCreate: document.getElementById('nav-btn-create'),
  btnCreatePostHeader: document.getElementById('btn-create-post-header'),

  // Modal: Create Post
  modalCreatePost: document.getElementById('modal-create-post'),
  createModalCancel: document.getElementById('create-modal-cancel'),
  createModalShare: document.getElementById('create-modal-share'),
  fileDropZone: document.getElementById('file-drop-zone'),
  btnSelectFiles: document.getElementById('btn-select-files'),
  inputFiles: document.getElementById('input-files'),
  postPreviewContainer: document.getElementById('post-preview-container'),
  createPreviewTrack: document.getElementById('create-preview-track'),
  createPreviewDots: document.getElementById('create-preview-dots'),
  createModalUsername: document.getElementById('create-modal-username'),
  fieldCaption: document.getElementById('field-caption'),
  btnClearMedia: document.getElementById('btn-clear-media'),

  // Modal: Create Highlight
  modalCreateHighlight: document.getElementById('modal-create-highlight'),
  createHighlightCancel: document.getElementById('create-highlight-cancel'),
  createHighlightSave: document.getElementById('create-highlight-save'),
  highlightCoverPreview: document.getElementById('highlight-cover-preview'),
  btnChangeHighlightCoverTrigger: document.getElementById('btn-change-highlight-cover-trigger'),
  inputHighlightCover: document.getElementById('input-highlight-cover'),
  fieldHighlightName: document.getElementById('field-highlight-name'),

  // Modal: Post Detail
  modalPostDetail: document.getElementById('modal-post-detail'),
  detailModalBack: document.getElementById('detail-modal-back'),
  detailModalDelete: document.getElementById('detail-modal-delete'),
  detailUsername: document.getElementById('detail-username'),
  detailMediaStage: document.getElementById('detail-media-stage'),
  detailMediaTrack: document.getElementById('detail-media-track'),
  detailNavPrev: document.getElementById('detail-nav-prev'),
  detailNavNext: document.getElementById('detail-nav-next'),
  detailSoundBtn: document.getElementById('detail-sound-btn'),
  soundOnIcon: document.querySelector('.sound-on-icon'),
  soundOffIcon: document.querySelector('.sound-off-icon'),
  detailDoubleTapHeart: document.getElementById('detail-double-tap-heart'),
  detailMediaDots: document.getElementById('detail-media-dots'),
  detailBtnLike: document.getElementById('detail-btn-like'),
  likeIconOutline: document.querySelector('.like-icon-outline'),
  likeIconFilled: document.querySelector('.like-icon-filled'),
  detailLikesText: document.getElementById('detail-likes-text'),
  detailCaptionUsername: document.getElementById('detail-caption-username'),
  detailCaptionText: document.getElementById('detail-caption-text'),
  detailTimeStamp: document.getElementById('detail-time-stamp'),

  // Modal: Edit Profile
  modalEditProfile: document.getElementById('modal-edit-profile'),
  editProfileCancel: document.getElementById('edit-profile-cancel'),
  editProfileSave: document.getElementById('edit-profile-save'),
  editProfileAvatarPreview: document.getElementById('edit-profile-avatar-preview'),
  btnChangePhotoTrigger: document.getElementById('btn-change-photo-trigger'),
  inputAvatar: document.getElementById('input-avatar'),
  editUsername: document.getElementById('edit-username'),
  editFullname: document.getElementById('edit-fullname'),
  editWebsite: document.getElementById('edit-website'),
  editBio: document.getElementById('edit-bio'),
  editFollowers: document.getElementById('edit-followers'),
  editFollowing: document.getElementById('edit-following')
};

// Temporary object URL cache to clean up memory
let avatarObjectURL = null;
let postObjectURLs = [];
let highlightObjectURLs = [];

// Initialize App
async function init() {
  try {
    // Load Profile
    state.profile = await window.db.getProfile();
    applyTheme(state.profile.theme || 'light');
    renderProfileInfo();

    // Load Highlights
    state.highlights = await window.db.getAllHighlights();
    renderHighlights();

    // Load Posts
    state.posts = await window.db.getAllPosts();
    renderGrid();

    // Attach Event Listeners
    attachEventListeners();
  } catch (error) {
    console.error('Initialization failed:', error);
  }
}

// ----------------------------------------------------
// THEME MANAGEMENT
// ----------------------------------------------------
function applyTheme(theme) {
  state.profile.theme = theme;
  if (theme === 'dark') {
    elements.body.classList.remove('light-mode');
    elements.body.classList.add('dark-mode');
    elements.themeIconLight.style.display = 'none';
    elements.themeIconDark.style.display = 'block';
  } else {
    elements.body.classList.remove('dark-mode');
    elements.body.classList.add('light-mode');
    elements.themeIconLight.style.display = 'block';
    elements.themeIconDark.style.display = 'none';
  }
}

function toggleTheme() {
  const newTheme = state.profile.theme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  window.db.saveProfile(state.profile);
}

// ----------------------------------------------------
// PROFILE RENDER & ACTION
// ----------------------------------------------------
function renderProfileInfo() {
  // Username updates
  elements.headerUsername.textContent = state.profile.username;
  elements.createModalUsername.textContent = state.profile.username;
  elements.detailUsername.textContent = state.profile.username;
  elements.detailCaptionUsername.textContent = state.profile.username;

  // Name & Bio updates
  elements.profileFullname.textContent = state.profile.fullName;
  elements.profileBioText.innerHTML = state.profile.bio.replace(/\n/g, '<br>');
  
  if (state.profile.website) {
    elements.profileWebsiteLink.textContent = state.profile.website;
    elements.profileWebsiteLink.href = state.profile.website.startsWith('http') 
      ? state.profile.website 
      : 'https://' + state.profile.website;
    elements.profileWebsiteLink.style.display = 'inline-block';
  } else {
    elements.profileWebsiteLink.style.display = 'none';
  }

  // Stats
  elements.statFollowersCount.textContent = formatNumber(state.profile.followersCount);
  elements.statFollowingCount.textContent = formatNumber(state.profile.followingCount);

  // Avatar blobs
  if (avatarObjectURL) {
    URL.revokeObjectURL(avatarObjectURL);
  }
  if (state.profile.avatar) {
    avatarObjectURL = URL.createObjectURL(state.profile.avatar);
    elements.profileAvatarImg.src = avatarObjectURL;
    elements.navProfileAvatarImg.src = avatarObjectURL;
    
    // Update reference classes in dialog headers
    document.querySelectorAll('.current-avatar-ref').forEach(img => {
      img.src = avatarObjectURL;
    });
  } else {
    const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23efefef'/><path d='M50 50c11 0 20-9 20-20s-9-20-20-20-20 9-20 20 9 20 20 20zm0 8c-15 0-45 8-45 23v5h90v-5c0-15-30-23-45-23z' fill='%238e8e8e'/></svg>";
    elements.profileAvatarImg.src = defaultAvatar;
    elements.navProfileAvatarImg.src = defaultAvatar;
    document.querySelectorAll('.current-avatar-ref').forEach(img => {
      img.src = defaultAvatar;
    });
  }
}

function openEditProfile() {
  elements.editUsername.value = state.profile.username;
  elements.editFullname.value = state.profile.fullName;
  elements.editWebsite.value = state.profile.website || '';
  elements.editBio.value = state.profile.bio || '';
  elements.editFollowers.value = state.profile.followersCount;
  elements.editFollowing.value = state.profile.followingCount;

  if (state.profile.avatar) {
    elements.editProfileAvatarPreview.src = URL.createObjectURL(state.profile.avatar);
  } else {
    elements.editProfileAvatarPreview.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23efefef'/><path d='M50 50c11 0 20-9 20-20s-9-20-20-20-20 9-20 20 9 20 20 20zm0 8c-15 0-45 8-45 23v5h90v-5c0-15-30-23-45-23z' fill='%238e8e8e'/></svg>";
  }

  elements.modalEditProfile.classList.add('active');
}

async function saveEditProfile() {
  const username = elements.editUsername.value.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
  if (!username) {
    alert('ユーザー名は必須です。');
    return;
  }

  state.profile.username = username;
  state.profile.fullName = elements.editFullname.value.trim() || 'No Name';
  state.profile.website = elements.editWebsite.value.trim();
  state.profile.bio = elements.editBio.value;
  state.profile.followersCount = parseInt(elements.editFollowers.value, 10) || 0;
  state.profile.followingCount = parseInt(elements.editFollowing.value, 10) || 0;

  // If avatar was chosen in file input
  if (elements.inputAvatar.files && elements.inputAvatar.files[0]) {
    state.profile.avatar = elements.inputAvatar.files[0];
  }

  await window.db.saveProfile(state.profile);
  renderProfileInfo();
  elements.modalEditProfile.classList.remove('active');
  elements.inputAvatar.value = '';
}

// ----------------------------------------------------
// GRID FEED RENDER
// ----------------------------------------------------
function renderGrid() {
  // Clear old Object URLs to prevent memory bloat
  postObjectURLs.forEach(url => URL.revokeObjectURL(url));
  postObjectURLs = [];

  elements.statPostsCount.textContent = state.posts.length;

  if (state.posts.length === 0) {
    elements.emptyState.style.display = 'flex';
    elements.postsGrid.style.display = 'none';
    return;
  }

  elements.emptyState.style.display = 'none';
  elements.postsGrid.style.display = 'grid';
  elements.postsGrid.innerHTML = '';

  state.posts.forEach((post, index) => {
    const gridItem = document.createElement('div');
    gridItem.className = 'grid-post';
    gridItem.setAttribute('data-id', post.id);
    gridItem.setAttribute('data-index', index);

    // Get URL of first media
    const mediaBlob = post.media[0];
    const mediaUrl = URL.createObjectURL(mediaBlob);
    postObjectURLs.push(mediaUrl);

    // Media element (video preview or img)
    if (post.mediaTypes[0].startsWith('video')) {
      const video = document.createElement('video');
      video.src = mediaUrl;
      video.muted = true;
      video.playsInline = true;
      // Seek a bit to show a frame instead of black screen
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = 0.5;
      });
      gridItem.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = mediaUrl;
      img.alt = `Post grid index ${index}`;
      gridItem.appendChild(img);
    }

    // Badge Overlay for multiple slides or videos
    if (post.media.length > 1) {
      const badge = document.createElement('div');
      badge.className = 'post-badge';
      badge.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M19 2H8a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM4 6H2v14a2 2 0 0 0 2 2h14v-2H4V6z"/>
        </svg>
      `;
      gridItem.appendChild(badge);
    } else if (post.mediaTypes[0].startsWith('video')) {
      const badge = document.createElement('div');
      badge.className = 'post-badge';
      badge.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <polygon points="8 5 19 12 8 19 8 5"></polygon>
        </svg>
      `;
      gridItem.appendChild(badge);
    }

    // Connect Drag & Drop Handlers
    setupDragAndDrop(gridItem);

    // Click handler to view details
    gridItem.addEventListener('click', (e) => {
      // Don't open if they were dragging
      if (gridItem.classList.contains('dragged-cancelled')) {
        gridItem.classList.remove('dragged-cancelled');
        return;
      }
      openPostDetail(post);
    });

    elements.postsGrid.appendChild(gridItem);
  });
}

// ----------------------------------------------------
// DRAG & DROP SYSTEM (POINTER EVENTS)
// ----------------------------------------------------
let dragInfo = {
  isDragging: false,
  draggedEl: null,
  draggedIndex: -1,
  currentIndex: -1,
  startX: 0,
  startY: 0,
  rects: [],
  didMove: false
};

function setupDragAndDrop(el) {
  el.addEventListener('pointerdown', (e) => {
    // Only left click for mouse; touch can bypass e.button checks
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    dragInfo.isDragging = false;
    dragInfo.draggedEl = el;
    dragInfo.draggedIndex = parseInt(el.getAttribute('data-index'), 10);
    dragInfo.currentIndex = dragInfo.draggedIndex;
    dragInfo.startX = e.clientX;
    dragInfo.startY = e.clientY;
    dragInfo.didMove = false;

    // Cache layouts of all grid posts
    const items = Array.from(elements.postsGrid.children);
    dragInfo.rects = items.map(item => item.getBoundingClientRect());

    // Bind document-level listeners to track pointers anywhere, including outside elements
    document.addEventListener('pointermove', onPointerMove, { passive: false });
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerCancel);
  });

  function onPointerMove(e) {
    if (!dragInfo.draggedEl || dragInfo.draggedEl !== el) return;

    const dx = e.clientX - dragInfo.startX;
    const dy = e.clientY - dragInfo.startY;

    // Move threshold to confirm dragging starts (prevents immediate drag on click)
    if (!dragInfo.isDragging && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      dragInfo.isDragging = true;
      dragInfo.didMove = true;
      el.classList.add('is-dragging');
      // Add transitions to sibling grid items
      Array.from(elements.postsGrid.children).forEach(child => {
        if (child !== el) child.classList.add('drag-transition');
      });
    }

    if (dragInfo.isDragging) {
      // Prevent screen scrolling on mobile while actively dragging
      if (e.cancelable) {
        e.preventDefault();
      }

      // Apply offset transform
      el.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;

      // Identify which element we are hovering over
      const clientX = e.clientX;
      const clientY = e.clientY;
      let closestIndex = dragInfo.currentIndex;
      let minDistance = Infinity;

      dragInfo.rects.forEach((rect, i) => {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(clientX - centerX, clientY - centerY);
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = i;
        }
      });

      // Threshold: pointer must be within reasonable distance of center
      if (closestIndex !== dragInfo.currentIndex) {
        dragInfo.currentIndex = closestIndex;
        updateVisualGridShifts();
      }
    }
  }

  function onPointerUp(e) {
    cleanupListeners();

    if (!dragInfo.draggedEl || dragInfo.draggedEl !== el) return;
    
    // Clean up classes & styles
    el.classList.remove('is-dragging');
    el.style.transform = '';

    Array.from(elements.postsGrid.children).forEach(child => {
      child.classList.remove('drag-transition');
      child.style.transform = '';
    });

    if (dragInfo.isDragging) {
      // Prevent detail modal triggering from clicking on release
      el.classList.add('dragged-cancelled');
      setTimeout(() => el.classList.remove('dragged-cancelled'), 100);

      // Perform state array manipulation
      if (dragInfo.currentIndex !== dragInfo.draggedIndex) {
        const targetPosts = [...state.posts];
        const [movedPost] = targetPosts.splice(dragInfo.draggedIndex, 1);
        targetPosts.splice(dragInfo.currentIndex, 0, movedPost);
        
        // Re-assign index
        targetPosts.forEach((post, i) => {
          post.orderIndex = i;
        });

        state.posts = targetPosts;
        window.db.saveAllPosts(targetPosts).then(() => {
          renderGrid();
        });
      }
    }

    dragInfo.draggedEl = null;
    dragInfo.isDragging = false;
  }

  function onPointerCancel(e) {
    cleanupListeners();

    if (!dragInfo.draggedEl) return;
    el.classList.remove('is-dragging');
    el.style.transform = '';
    Array.from(elements.postsGrid.children).forEach(child => {
      child.classList.remove('drag-transition');
      child.style.transform = '';
    });
    dragInfo.draggedEl = null;
    dragInfo.isDragging = false;
  }

  function cleanupListeners() {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerCancel);
  }
}

function updateVisualGridShifts() {
  const items = Array.from(elements.postsGrid.children);
  const fromIdx = dragInfo.draggedIndex;
  const toIdx = dragInfo.currentIndex;

  items.forEach((item, i) => {
    if (item === dragInfo.draggedEl) return;

    let targetIdx = i;
    if (fromIdx < toIdx) {
      if (i > fromIdx && i <= toIdx) {
        targetIdx = i - 1;
      }
    } else if (fromIdx > toIdx) {
      if (i >= toIdx && i < fromIdx) {
        targetIdx = i + 1;
      }
    }

    if (targetIdx !== i) {
      const originalRect = dragInfo.rects[i];
      const targetRect = dragInfo.rects[targetIdx];
      const tx = targetRect.left - originalRect.left;
      const ty = targetRect.top - originalRect.top;
      item.style.transform = `translate(${tx}px, ${ty}px)`;
    } else {
      item.style.transform = 'none';
    }
  });
}

// ----------------------------------------------------
// CREATE POST SYSTEM
// ----------------------------------------------------
function openCreateModal() {
  state.uploadedMedia = [];
  state.createActiveIndex = 0;
  elements.fieldCaption.value = '';
  
  elements.fileDropZone.style.display = 'flex';
  elements.postPreviewContainer.style.display = 'none';
  elements.createModalShare.disabled = true;

  elements.modalCreatePost.classList.add('active');
}

function closeCreateModal() {
  // Clear any temporary URLs in uploaded list
  state.uploadedMedia.forEach(item => URL.revokeObjectURL(item.url));
  state.uploadedMedia = [];
  elements.inputFiles.value = '';
  elements.modalCreatePost.classList.remove('active');
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  files.forEach(file => {
    state.uploadedMedia.push({
      file: file,
      url: URL.createObjectURL(file),
      type: file.type
    });
  });

  if (state.uploadedMedia.length > 0) {
    elements.fileDropZone.style.display = 'none';
    elements.postPreviewContainer.style.display = 'block';
    elements.createModalShare.disabled = false;
    
    state.createActiveIndex = 0;
    renderCreatePreviewCarousel();
  }
}

function renderCreatePreviewCarousel() {
  elements.createPreviewTrack.innerHTML = '';
  elements.createPreviewDots.innerHTML = '';

  if (state.uploadedMedia.length === 0) {
    openCreateModal();
    return;
  }

  state.uploadedMedia.forEach((item, index) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide-preview';

    if (item.type.startsWith('video')) {
      const video = document.createElement('video');
      video.src = item.url;
      video.controls = true;
      video.muted = true;
      slide.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = `Preview image ${index}`;
      slide.appendChild(img);
    }

    // Delete item button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-media-badge';
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeMediaFromUpload(index);
    });
    slide.appendChild(removeBtn);

    elements.createPreviewTrack.appendChild(slide);

    // Indicator Dot
    if (state.uploadedMedia.length > 1) {
      const dot = document.createElement('div');
      dot.className = `dot ${index === state.createActiveIndex ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        state.createActiveIndex = index;
        slideCreateCarousel();
      });
      elements.createPreviewDots.appendChild(dot);
    }
  });

  slideCreateCarousel();
}

function slideCreateCarousel() {
  const offset = -state.createActiveIndex * 100;
  elements.createPreviewTrack.style.transform = `translateX(${offset}%)`;

  // Update dots classes
  const dots = Array.from(elements.createPreviewDots.children);
  dots.forEach((dot, idx) => {
    if (idx === state.createActiveIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function removeMediaFromUpload(index) {
  // Revoke object URL
  URL.revokeObjectURL(state.uploadedMedia[index].url);
  state.uploadedMedia.splice(index, 1);

  if (state.createActiveIndex >= state.uploadedMedia.length) {
    state.createActiveIndex = Math.max(0, state.uploadedMedia.length - 1);
  }

  renderCreatePreviewCarousel();
}

async function sharePost() {
  if (state.uploadedMedia.length === 0) return;

  const mediaBlobs = state.uploadedMedia.map(item => item.file);
  const mediaTypes = state.uploadedMedia.map(item => item.type);
  const caption = elements.fieldCaption.value.trim();

  // Create new post
  const newPost = {
    id: Date.now(),
    media: mediaBlobs,
    mediaTypes: mediaTypes,
    caption: caption,
    likes: Math.floor(Math.random() * 250) + 12,
    commentsCount: 0,
    likedByUser: false,
    orderIndex: -1, // We will place at the top of the grid
    createdAt: new Date().toISOString()
  };

  // Adjust order index of existing posts
  const updatedPosts = [newPost, ...state.posts];
  updatedPosts.forEach((post, i) => {
    post.orderIndex = i;
  });

  // Save all to database
  await window.db.saveAllPosts(updatedPosts);
  state.posts = updatedPosts;
  
  // Rerender & close
  renderGrid();
  closeCreateModal();
}

// ----------------------------------------------------
// POST DETAIL VIEW & CAROUSEL SYSTEM
// ----------------------------------------------------
let detailSwipeStartX = 0;
let detailSwipeDist = 0;

function openPostDetail(post) {
  state.activePost = post;
  state.activeMediaIndex = 0;

  // Header Username & caption username
  elements.detailUsername.textContent = state.profile.username;
  elements.detailCaptionUsername.textContent = state.profile.username;

  // Caption content
  elements.detailCaptionText.textContent = post.caption || '';
  
  // Format Date Timestamp
  elements.detailTimeStamp.textContent = formatRelativeTime(post.createdAt);

  // Render Likes count and Like Button State
  updateLikeUI();

  // Render slides in carousel
  renderDetailSlides();

  // Show Modal
  elements.modalPostDetail.classList.add('active');
}

function closePostDetail() {
  // Pause any active playing video inside detail track
  const videos = Array.from(elements.detailMediaTrack.querySelectorAll('video'));
  videos.forEach(video => video.pause());

  elements.modalPostDetail.classList.remove('active');
  state.activePost = null;
}

function renderDetailSlides() {
  elements.detailMediaTrack.innerHTML = '';
  elements.detailMediaDots.innerHTML = '';
  elements.detailSoundBtn.style.display = 'none';

  if (!state.activePost) return;

  const post = state.activePost;

  post.media.forEach((blob, idx) => {
    const slide = document.createElement('div');
    slide.className = 'media-slide';

    const objectUrl = URL.createObjectURL(blob);

    if (post.mediaTypes[idx].startsWith('video')) {
      const video = document.createElement('video');
      video.src = objectUrl;
      video.autoplay = false;
      video.loop = true;
      video.muted = state.isMuted;
      video.playsInline = true;
      slide.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = objectUrl;
      img.alt = `Post slide ${idx}`;
      slide.appendChild(img);
    }

    elements.detailMediaTrack.appendChild(slide);

    // Dots setup
    if (post.media.length > 1) {
      const dot = document.createElement('div');
      dot.className = `dot ${idx === state.activeMediaIndex ? 'active' : ''}`;
      elements.detailMediaDots.appendChild(dot);
    }
  });

  // Attach Swipe Listeners to Track
  setupSwipeGestures();

  slideDetailCarousel();
}

function slideDetailCarousel() {
  const offset = -state.activeMediaIndex * 100;
  elements.detailMediaTrack.style.transform = `translateX(${offset}%)`;

  const totalSlides = state.activePost ? state.activePost.media.length : 0;

  // Manage Nav buttons visibility
  elements.detailNavPrev.style.display = (totalSlides > 1 && state.activeMediaIndex > 0) ? 'flex' : 'none';
  elements.detailNavNext.style.display = (totalSlides > 1 && state.activeMediaIndex < totalSlides - 1) ? 'flex' : 'none';

  // Manage Active Dot class
  const dots = Array.from(elements.detailMediaDots.children);
  dots.forEach((dot, idx) => {
    if (idx === state.activeMediaIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  // Play/Pause/Mute logic for current and previous videos
  const slides = Array.from(elements.detailMediaTrack.children);
  slides.forEach((slide, idx) => {
    const video = slide.querySelector('video');
    if (video) {
      if (idx === state.activeMediaIndex) {
        // Autoplay active slide video
        video.muted = state.isMuted;
        video.play().catch(() => {
          // Browsers require interaction before playing sound or autoplaying
          video.muted = true;
          video.play();
        });
        
        // Show sound button overlay
        elements.detailSoundBtn.style.display = 'flex';
        updateSoundButtonIcon();
      } else {
        video.pause();
      }
    }
  });
}

function updateSoundButtonIcon() {
  if (state.isMuted) {
    elements.soundOnIcon.style.display = 'none';
    elements.soundOffIcon.style.display = 'block';
  } else {
    elements.soundOnIcon.style.display = 'block';
    elements.soundOffIcon.style.display = 'none';
  }
}

function toggleMuteAllVideos() {
  state.isMuted = !state.isMuted;
  const videos = Array.from(elements.detailMediaTrack.querySelectorAll('video'));
  videos.forEach(video => {
    video.muted = state.isMuted;
  });
  updateSoundButtonIcon();
}

function setupSwipeGestures() {
  const stage = elements.detailMediaStage;
  
  // Clean listeners
  stage.ontouchstart = null;
  stage.ontouchmove = null;
  stage.ontouchend = null;

  stage.addEventListener('touchstart', (e) => {
    detailSwipeStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    // optional: track swipe animation during move
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    detailSwipeDist = e.changedTouches[0].screenX - detailSwipeStartX;
    if (Math.abs(detailSwipeDist) > 50) {
      if (detailSwipeDist > 0) {
        // Swipe Right -> Prev
        navigateCarousel(-1);
      } else {
        // Swipe Left -> Next
        navigateCarousel(1);
      }
    }
  }, { passive: true });

  // Double tap to like gesture
  let lastTap = 0;
  stage.addEventListener('click', (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      triggerDoubleTapLike();
    } else {
      // Single tap: toggle play/pause for video
      const activeSlide = elements.detailMediaTrack.children[state.activeMediaIndex];
      const video = activeSlide ? activeSlide.querySelector('video') : null;
      if (video) {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }
    }
    lastTap = now;
  });
}

function navigateCarousel(direction) {
  if (!state.activePost) return;
  const total = state.activePost.media.length;
  const newIndex = state.activeMediaIndex + direction;
  if (newIndex >= 0 && newIndex < total) {
    state.activeMediaIndex = newIndex;
    slideDetailCarousel();
  }
}

function updateLikeUI() {
  if (!state.activePost) return;

  elements.detailLikesText.textContent = `いいね！${formatNumber(state.activePost.likes)}件`;

  if (state.activePost.likedByUser) {
    elements.likeIconOutline.style.display = 'none';
    elements.likeIconFilled.style.display = 'block';
  } else {
    elements.likeIconOutline.style.display = 'block';
    elements.likeIconFilled.style.display = 'none';
  }
}

function toggleLike() {
  if (!state.activePost) return;

  const post = state.activePost;
  post.likedByUser = !post.likedByUser;
  post.likes = post.likedByUser ? post.likes + 1 : post.likes - 1;

  updateLikeUI();

  // Save to DB and update state array
  const idx = state.posts.findIndex(p => p.id === post.id);
  if (idx !== -1) {
    state.posts[idx] = post;
    window.db.savePost(post);
  }
}

function triggerDoubleTapLike() {
  if (!state.activePost) return;

  const post = state.activePost;
  if (!post.likedByUser) {
    post.likedByUser = true;
    post.likes += 1;
    updateLikeUI();
    
    const idx = state.posts.findIndex(p => p.id === post.id);
    if (idx !== -1) {
      state.posts[idx] = post;
      window.db.savePost(post);
    }
  }

  // Show heart pop animation
  const heart = elements.detailDoubleTapHeart;
  heart.classList.remove('animate');
  // force reflow
  void heart.offsetWidth;
  heart.classList.add('animate');
}

async function deleteActivePost() {
  if (!state.activePost) return;

  const confirmed = confirm('この投稿を削除しますか？');
  if (!confirmed) return;

  await window.db.deletePost(state.activePost.id);
  
  // Remove from state array
  state.posts = state.posts.filter(p => p.id !== state.activePost.id);
  
  // Re-order remaining posts
  state.posts.forEach((p, idx) => {
    p.orderIndex = idx;
  });
  await window.db.saveAllPosts(state.posts);

  // Close and render
  closePostDetail();
  renderGrid();
}

// ----------------------------------------------------
// EVENT LISTENERS BINDINGS
// ----------------------------------------------------
function attachEventListeners() {
  // Theme Toggle
  elements.btnThemeToggle.addEventListener('click', toggleTheme);

  // Profile Action: Edit
  elements.btnEditProfile.addEventListener('click', openEditProfile);
  elements.editProfileCancel.addEventListener('click', () => {
    elements.modalEditProfile.classList.remove('active');
    elements.inputAvatar.value = '';
  });
  elements.editProfileSave.addEventListener('click', saveEditProfile);

  // Profile Avatar select trigger
  elements.btnChangePhotoTrigger.addEventListener('click', () => {
    elements.inputAvatar.click();
  });
  elements.btnEditAvatar.addEventListener('click', openEditProfile);

  elements.inputAvatar.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      elements.editProfileAvatarPreview.src = URL.createObjectURL(e.target.files[0]);
    }
  });

  // Profile Action: Share
  elements.btnShareProfile.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('プロフィールのリンクをクリップボードにコピーしました！'))
      .catch(() => alert('リンクのコピーに失敗しました。'));
  });

  // Create Post triggers
  elements.btnCreatePostHeader.addEventListener('click', openCreateModal);
  elements.navBtnCreate.addEventListener('click', openCreateModal);
  elements.btnEmptyCreate.addEventListener('click', openCreateModal);
  elements.createModalCancel.addEventListener('click', closeCreateModal);
  elements.createModalShare.addEventListener('click', sharePost);
  elements.btnClearMedia.addEventListener('click', openCreateModal);

  // Drag and Drop files selection
  elements.btnSelectFiles.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.inputFiles.click();
  });
  elements.fileDropZone.addEventListener('click', () => {
    elements.inputFiles.click();
  });
  elements.inputFiles.addEventListener('change', handleFileSelect);

  // Drag & drop file area aesthetics
  elements.fileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.fileDropZone.style.borderColor = 'var(--accent-blue)';
    elements.fileDropZone.style.backgroundColor = 'var(--btn-secondary)';
  });
  elements.fileDropZone.addEventListener('dragleave', () => {
    elements.fileDropZone.style.borderColor = 'var(--border-primary)';
    elements.fileDropZone.style.backgroundColor = 'var(--bg-secondary)';
  });
  elements.fileDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.fileDropZone.style.borderColor = 'var(--border-primary)';
    elements.fileDropZone.style.backgroundColor = 'var(--bg-secondary)';
    
    if (e.dataTransfer.files.length > 0) {
      elements.inputFiles.files = e.dataTransfer.files;
      const event = new Event('change');
      elements.inputFiles.dispatchEvent(event);
    }
  });

  // Post Detail controls
  elements.detailModalBack.addEventListener('click', closePostDetail);
  elements.detailModalDelete.addEventListener('click', deleteActivePost);
  elements.detailNavPrev.addEventListener('click', () => navigateCarousel(-1));
  elements.detailNavNext.addEventListener('click', () => navigateCarousel(1));
  elements.detailSoundBtn.addEventListener('click', toggleMuteAllVideos);
  elements.detailBtnLike.addEventListener('click', toggleLike);

  // Close modals on overlay clicks
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        if (overlay === elements.modalCreatePost) {
          closeCreateModal();
        } else if (overlay === elements.modalPostDetail) {
          closePostDetail();
        } else if (overlay === elements.modalEditProfile) {
          elements.modalEditProfile.classList.remove('active');
          elements.inputAvatar.value = '';
        } else if (overlay === elements.modalCreateHighlight) {
          closeCreateHighlightModal();
        }
      }
    });
  });

  // Highlight stories triggers
  elements.btnNewHighlight.addEventListener('click', openCreateHighlightModal);
  elements.createHighlightCancel.addEventListener('click', closeCreateHighlightModal);
  elements.createHighlightSave.addEventListener('click', saveNewHighlight);

  elements.btnChangeHighlightCoverTrigger.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent bubbling if nested
    elements.inputHighlightCover.click();
  });
  elements.highlightCoverPreview.addEventListener('click', () => {
    elements.inputHighlightCover.click();
  });
  elements.inputHighlightCover.addEventListener('change', handleHighlightCoverSelect);
  elements.fieldHighlightName.addEventListener('input', checkHighlightFormValidity);
}

// ----------------------------------------------------
// STORIES HIGHLIGHTS SYSTEM
// ----------------------------------------------------
function renderHighlights() {
  // Clear old Object URLs
  highlightObjectURLs.forEach(url => URL.revokeObjectURL(url));
  highlightObjectURLs = [];

  // Remove existing highlight items except the "New" button
  const items = Array.from(elements.highlightsList.querySelectorAll('.highlight-item'));
  items.forEach(item => {
    if (item.id !== 'btn-new-highlight') {
      item.remove();
    }
  });

  // Render each highlight
  state.highlights.forEach(hl => {
    const highlightItem = document.createElement('div');
    highlightItem.className = 'highlight-item';
    highlightItem.setAttribute('data-id', hl.id);

    // Cover URL
    let coverUrl = '';
    if (hl.cover) {
      coverUrl = URL.createObjectURL(hl.cover);
      highlightObjectURLs.push(coverUrl);
    } else {
      // Default placeholder
      coverUrl = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23efefef'/><path d='M50 50c11 0 20-9 20-20s-9-20-20-20-20 9-20 20 9 20 20 20zm0 8c-15 0-45 8-45 23v5h90v-5c0-15-30-23-45-23z' fill='%238e8e8e'/></svg>";
    }

    highlightItem.innerHTML = `
      <button class="btn-delete-highlight" aria-label="削除">&times;</button>
      <div class="highlight-circle">
        <img src="${coverUrl}" alt="${hl.name}">
      </div>
      <span class="highlight-title">${hl.name}</span>
    `;

    // Click on delete button
    const deleteBtn = highlightItem.querySelector('.btn-delete-highlight');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent modal or other events
      deleteHighlightItem(hl.id);
    });

    // Tap highlight circle (shows alert for mock preview)
    highlightItem.addEventListener('click', () => {
      alert(`ハイライト: ${hl.name}`);
    });

    elements.highlightsList.appendChild(highlightItem);
  });
}

async function deleteHighlightItem(id) {
  const confirmed = confirm('このハイライトを削除しますか？');
  if (!confirmed) return;

  await window.db.deleteHighlight(id);
  state.highlights = state.highlights.filter(h => h.id !== id);
  renderHighlights();
}

function openCreateHighlightModal() {
  state.uploadedHighlightCover = null;
  elements.fieldHighlightName.value = '';
  elements.highlightCoverPreview.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23efefef'/><path d='M50 50c11 0 20-9 20-20s-9-20-20-20-20 9-20 20 9 20 20 20zm0 8c-15 0-45 8-45 23v5h90v-5c0-15-30-23-45-23z' fill='%238e8e8e'/></svg>";
  elements.createHighlightSave.disabled = true;
  elements.modalCreateHighlight.classList.add('active');
}

function closeCreateHighlightModal() {
  elements.modalCreateHighlight.classList.remove('active');
  elements.inputHighlightCover.value = '';
  state.uploadedHighlightCover = null;
}

function handleHighlightCoverSelect(e) {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    state.uploadedHighlightCover = file;
    elements.highlightCoverPreview.src = URL.createObjectURL(file);
  }
}

async function saveNewHighlight() {
  const name = elements.fieldHighlightName.value.trim();
  if (!name) return;

  const newHighlight = {
    id: Date.now(),
    name: name,
    cover: state.uploadedHighlightCover, // Blob or null
    orderIndex: state.highlights.length,
    createdAt: new Date().toISOString()
  };

  await window.db.saveHighlight(newHighlight);
  state.highlights.push(newHighlight);
  renderHighlights();
  closeCreateHighlightModal();
}

function checkHighlightFormValidity() {
  const name = elements.fieldHighlightName.value.trim();
  elements.createHighlightSave.disabled = !name;
}

// ----------------------------------------------------
// UTILITY FUNCTIONS
// ----------------------------------------------------
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString();
}

function formatRelativeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return '今';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  
  // Default format
  return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', init);
