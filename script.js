let videos = [];
let filtered = [];
let currentIndex = 0;
const PAGE_SIZE = window.innerWidth < 700 ? 6 : 20;

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

  slice.forEach(video => {
    const div = document.createElement('div');
    div.className = 'video-card';

    let videoHTML = '';
    if (video.host === "Drive") {
      videoHTML = `<iframe src="${video.preview}" width="100%" height="240" allow="autoplay"></iframe>`;
    } else {
      videoHTML = `<video controls src="${video.preview}" width="100%" height="240"></video>`;
    }

    div.innerHTML = `
      ${videoHTML}
      <h3>${video.title}</h3>
      <p>Tags: ${video.tags.join(', ')}</p>
      <p>Source: ${video.source}</p>
      <a href="${video.download}" target="_blank">Download</a>
    `;
    container.appendChild(div);
  });

  currentIndex += PAGE_SIZE;
}

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
