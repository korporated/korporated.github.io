const files = [
  'econ_products.json',
  'econ_avatar_items.json',
  'econ_mining_ores.json',
  'econ_gameplay_items.json',
  'econ_stash_upgrades.json',
  'econ_research_nodes.json'
];

let allData = [];

async function loadData() {
  const requests = files.map(file =>
    fetch(`/gamedata/${file}`)
      .then(response => response.json())
      .catch(err => {
        console.warn(`Failed to load ${file}`, err);
        return [];
      })
  );
  const results = await Promise.all(requests);
  allData = results.flat(); // Combine all arrays into one
}

function search(query) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  if (!query) return;

  const lowerQuery = query.toLowerCase();
  const matches = allData.filter(item => {
    return Object.values(item).some(value =>
      String(value).toLowerCase().includes(lowerQuery)
    );
  });

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

document.getElementById('searchBox').addEventListener('input', (e) => {
  search(e.target.value);
});

loadData();
