let currentData = [];

async function loadFile(fileName) {
  try {
    const response = await fetch(`/gamedata/${fileName}`);
    const json = await response.json();

    // Try to extract array of items, even if wrapped inside a parent object
    if (Array.isArray(json)) {
      currentData = json;
    } else if (json.items && Array.isArray(json.items)) {
      currentData = json.items;
    } else if (Object.values(json).every(v => typeof v === 'object')) {
      currentData = Object.values(json); // fallback: flatten object into array
    } else {
      currentData = [];
    }

    search(document.getElementById('searchBox').value); // trigger search
  } catch (err) {
    console.error(`Error loading ${fileName}`, err);
    currentData = [];
    document.getElementById('results').innerHTML = `<li>Failed to load data.</li>`;
  }
}

function formatItem(item) {
  const div = document.createElement('div');
  div.className = 'result-item';

  for (const [key, value] of Object.entries(item)) {
    const row = document.createElement('div');
    row.innerHTML = `<strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}`;
    div.appendChild(row);
  }

  return div;
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
    li.appendChild(formatItem(match));
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

// Load initial
window.addEventListener('DOMContentLoaded', () => {
  loadFile(document.getElementById('categorySelect').value);
});
