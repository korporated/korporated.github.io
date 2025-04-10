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
    } else if (json.ores && Array.isArray(json.ores)) {
      currentData = json.ores;
    } else if (json.upgrades && Array.isArray(json.upgrades)) {
      currentData = json.upgrades;
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
  div.style.padding = '10px';
  div.style.border = '1px solid #ccc';
  div.style.marginBottom = '10px';
  div.style.borderRadius = '6px';
  div.style.backgroundColor = '#f9f9f9';

  for (const [key, value] of Object.entries(item)) {
    const row = document.createElement('div');
    row.style.marginBottom = '6px';

    let displayValue = '';

    if (Array.isArray(value)) {
      if (value.length === 0) {
        displayValue = '<em>None</em>';
      } else {
        displayValue = '<ul style="margin: 4px 0 0 20px; padding-left: 1em;">' +
          value.map(v => `<li>${escapeHTML(v)}</li>`).join('') +
          '</ul>';
      }
    } else if (typeof value === 'object' && value !== null) {
      displayValue = `<pre>${escapeHTML(JSON.stringify(value, null, 2))}</pre>`;
    } else {
      displayValue = escapeHTML(String(value));
    }

    row.innerHTML = `<strong>${toTitleCase(key)}:</strong> ${displayValue}`;
    div.appendChild(row);
  }

  return div;
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function (m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m];
  });
}

function toTitleCase(str) {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
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
