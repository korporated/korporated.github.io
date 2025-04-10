let currentData = [];

async function loadFile(fileName) {
  try {
    const response = await fetch(`/gamedata/${fileName}`);
    const json = await response.json();
    currentData = Array.isArray(json) ? json : Object.values(json);
    search(document.getElementById('searchBox').value); // trigger search after load
  } catch (err) {
    console.error(`Error loading ${fileName}`, err);
    currentData = [];
    document.getElementById('results').innerHTML = `<li>Failed to load data.</li>`;
  }
}

function search(query) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  if (!query) return;

  const lowerQuery = query.toLowerCase();
  const matches = currentData.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(lowerQuery)
    )
  );

  if (matches.length === 0) {
    resultsContainer.innerHTML = '<li>No results found.</li>';
    return;
  }

  for (const match of matches) {
    const li = document.createElement('li');
    li.textContent = JSON.stringify(match, null, 2);
    resultsContainer.appendChild(li);
  }
}

// Event Listeners
document.getElementById('searchBox').addEventListener('input', (e) => {
  search(e.target.value);
});

document.getElementById('categorySelect').addEventListener('change', (e) => {
  loadFile(e.target.value);
});

// Load initial category
window.addEventListener('DOMContentLoaded', () => {
  const initialFile = document.getElementById('categorySelect').value;
  loadFile(initialFile);
});
