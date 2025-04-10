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
    row.style.marginBottom = '8px';

    let displayValue;

    if (Array.isArray(value)) {
      // Format arrays as bullet points
      if (value.length === 0) {
        displayValue = '<em>None</em>';
      } else {
        displayValue = '<ul style="margin: 4px 0 0 20px;">' +
          value.map(v => `<li>${v}</li>`).join('') +
          '</ul>';
      }
    } else if (typeof value === 'object' && value !== null) {
      // Format nested objects as JSON string with indentation
      displayValue = `<pre>${JSON.stringify(value, null, 2)}</pre>`;
    } else {
      // Plain text values
      displayValue = String(value);
    }

    row.innerHTML = `<strong>${toTitleCase(key)}:</strong> ${displayValue}`;
    div.appendChild(row);
  }

  return div;
}

function toTitleCase(str) {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
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
