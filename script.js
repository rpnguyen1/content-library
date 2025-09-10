let videos = [];
let filtered = [];
let currentIndex = 0;
const PAGE_SIZE = window.innerWidth < 700 ? 4 : 20;

fetch('videos.json')
  .then(res => res.json())
  .then(data => {
    videos = data;
    filtered = videos; // start with everything
    updateResultsCount();
    renderCategoryOptions(); // <-- Add this line
    renderNextPage();
  });

function renderNextPage() {
  const container = document.getElementById('video-container');
  const slice = filtered.slice(currentIndex, currentIndex + PAGE_SIZE);

  slice.forEach((video, idx) => {
    const div = document.createElement('div');
    div.className = 'video-card';

    // Placeholder for lazy loading
    const placeholder = document.createElement('div');
    placeholder.className = 'video-placeholder';
    placeholder.style.width = '100%';
    placeholder.style.height = '240px';
    placeholder.style.background = '#eaeaea';
    placeholder.dataset.index = currentIndex + idx;
    placeholder.dataset.host = video.host || '';
    placeholder.dataset.preview = video.preview;
    placeholder.dataset.title = video.title;
    placeholder.dataset.tags = video.tags.join(', ');
    placeholder.dataset.source = video.source;
    placeholder.dataset.download = video.download;

    div.appendChild(placeholder);

    // Add info below (title, tags, etc.)
    const info = document.createElement('div');
    info.innerHTML = `
      <h3>${video.title}</h3>
      <p>Tags: ${video.tags.join(', ')}</p>
      <p>Source: ${video.source}</p>
      <a href="${video.download}" target="_blank">Download</a>
    `;
    div.appendChild(info);

    container.appendChild(div);

    // Observe the placeholder for lazy loading
    observer.observe(placeholder);
  });

  currentIndex += PAGE_SIZE;
}

// Intersection Observer for lazy loading videos
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const placeholder = entry.target;
      // Only load once
      if (!placeholder.dataset.loaded) {
        let videoHTML = '';
        if (placeholder.dataset.host === "Drive") {
          videoHTML = `<iframe src="${placeholder.dataset.preview}" width="100%" height="240" allow="autoplay"></iframe>`;
        } else {
          videoHTML = `<video controls src="${placeholder.dataset.preview}" width="100%" height="240"></video>`;
        }
        // Replace placeholder with actual video/iframe
        const temp = document.createElement('div');
        temp.innerHTML = videoHTML;
        placeholder.replaceWith(temp.firstChild);
        placeholder.dataset.loaded = "true";
        obs.unobserve(placeholder);
      }
    }
  });
}, {
  rootMargin: '200px 0px', // start loading a bit before entering viewport
  threshold: 0.01
});

function resetAndRender() {
  const container = document.getElementById('video-container');
  container.innerHTML = ''; // clear old content
  currentIndex = 0;
  renderNextPage();
}

function updateResultsCount() {
  document.getElementById('resultsCount').innerText = `${filtered.length} results`;
}

// Combined filter function
function applyFilters() {
  // Multi-term search (space-separated)
  const searchTerms = document.getElementById('search').value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  // Multi-category (comma-separated)
  const categoryTerms = document.getElementById('categoryFilter').value
    .toLowerCase()
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const typeFilter = document.getElementById('typeFilter').value;

  filtered = videos.filter(v => {
    // All search terms must match title or tags
    const matchesSearch = searchTerms.every(term =>
      v.title.toLowerCase().includes(term) ||
      v.tags.some(tag => tag.toLowerCase().includes(term))
    );

    // All category terms must be present in tags (if any entered)
    const matchesCategory = categoryTerms.length === 0 ||
      categoryTerms.every(cat =>
        v.tags.map(tag => tag.toLowerCase()).includes(cat)
      );

    const matchesType =
      !typeFilter ||
      (typeFilter === "video" && v.mime.startsWith("video/")) ||
      (typeFilter === "photo" && v.mime.startsWith("image/"));

    return matchesSearch && matchesCategory && matchesType;
  });

  updateResultsCount();
  resetAndRender();
}

let selectedCategories = [];

// Render category buttons
function renderCategoryOptions() {
  const container = document.getElementById('categoryOptions');
  container.innerHTML = '';
  CATEGORY_LIST.forEach(tag => {
    const btn = document.createElement('button');
    btn.textContent = tag;
    btn.className = 'category-btn';
    btn.disabled = selectedCategories.includes(tag);
    btn.onclick = () => addCategoryToSelected(tag);
    container.appendChild(btn);
  });
  renderSelectedCategories();
}

// Render selected categories as chips
function renderSelectedCategories() {
  const container = document.getElementById('selectedCategories');
  container.innerHTML = '';
  selectedCategories.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'category-chip';
    chip.textContent = tag;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'remove-chip-btn';
    removeBtn.onclick = () => removeCategoryFromSelected(tag);
    chip.appendChild(removeBtn);
    container.appendChild(chip);
  });
  // Update the hidden input for compatibility with applyFilters
  document.getElementById('categoryFilter').value = selectedCategories.join(', ');
  applyFilters();
}

function addCategoryToSelected(tag) {
  if (!selectedCategories.includes(tag)) {
    selectedCategories.push(tag);
    renderCategoryOptions();
  }
}

function removeCategoryFromSelected(tag) {
  selectedCategories = selectedCategories.filter(cat => cat !== tag);
  renderCategoryOptions();
}

// Helper to get query params
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// On page load, check for ?task=...
document.addEventListener('DOMContentLoaded', () => {
  const taskParam = getQueryParam('task');
  if (taskParam) {
    // If you use a category/tag input:
    // document.getElementById('categoryFilter').value = taskParam;
    // If you use chips/buttons:
    if (!selectedCategories.includes(taskParam)) {
      selectedCategories.push(taskParam);
      renderCategoryOptions();
    }
    // Optionally, show the task brief (see below)
    showTaskBrief(taskParam);
    applyFilters();
  }

});

// Event listeners
document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('typeFilter').addEventListener('change', applyFilters);
document.getElementById('categoryFilter').addEventListener('change', function() {
  selectedCategories = this.value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  renderCategoryOptions();
});

// Load more on scroll
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    renderNextPage();
  }
});

const CATEGORY_LIST = [
    "Daily Life (Cityscapes)",
    "Nature",
    "Vehicles",
    "Gym",
    "Food",
    "Pets",
    "Fashion",
    "Summer",
    "Birthday",
    "Friendship",
    "Relationships (Couples)",
    "School",
    "Selfies",
    "Travel",
    "Wedding",
];
