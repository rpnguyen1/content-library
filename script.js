let videos = [];
let filtered = [];
let currentIndex = 0;
const PAGE_SIZE = 20;

fetch('videos.json')
  .then(res => res.json())
  .then(data => {
    videos = data;
    filtered = videos; // start with everything
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

// Search by title or tag
document.getElementById('search').addEventListener('input', e => {
  const term = e.target.value.toLowerCase();
  filtered = videos.filter(v => 
    v.title.toLowerCase().includes(term) ||
    v.tags.some(tag => tag.toLowerCase().includes(term))
  );
  resetAndRender();
});

// Load more on scroll
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    renderNextPage();
  }
});
