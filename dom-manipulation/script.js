let quotes =JSON.parse(localStorage.getItem("quotes")) || [
  {id: 1, text: "The only limit to our realization of tomorrow is our doubts of today.",category:"motivation",},
  {id: 2, text: "The future belongs to those who believe in the beauty of their dreams.",category:"inspiration"},
  {id: 3, text: "Do not wait to strike till the iron is hot, but make it hot by striking.",category:"life"} 
];
let lastFilter = localStorage.getItem("selectedCategory") || "all";
let lastQuoutedid = quotes.reduce((max,q)=>Math.max(max,q.id),0);

function saveQuotes(){
  localStorage,setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  const filtered =lastFilter === "all"
  ?quotes
  :quotes.filter(q => q.category === lastFilter);
  if (filtered.length === 0) {
    display.innerText = "No quotes available in this category.";
    return;
  }
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  display.innerText = '"${quote.text}" - (${quote.category})';
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

function filterQuotes () {
  const category = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", category);
  lastFilter = selected;
  showRandomQuote();
}

function populateCategories(){
  const dropdown =document.getElementById("categoryFilter");
  const categories = Array.from(new Set(quotes.map(q => q.category))); 
  dropdown.innerHTML = '<option value="all">All</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    dropdown.appendChild(option);
  });
}
function addQuote(){
  const text = document.getElementById("quoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    alert("Please enter both fields.");
    return;
  }
  const newQuote = {id: ++lastQuoutedid, text, category};
  quotes
  saveQuotes();
  populateCategories();
  alert("Quote added successfully!");
  document.getElementById("quoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}
function exportToJson(){
  const data =JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], {type: "application/json"}); 
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a,download = "quotes.json";
  a.click ();
  URL.revokeObjectURL(url);
}
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      data.forEach(q => {
        if (!q.id) q.id = ++lastQuoteId;
      });
      quotes.push(...data);
      saveQuotes();
      populateCategories();
      alert("Quotes imported!");
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };
  reader.readAsText(file);
}

async function fetchServerQuotes() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const data = await res.json();

    let updates = [], conflicts = [];

    data.forEach(server => {
      const incoming = { id: server.id, text: server.title, category: "Imported" };
      const local = quotes.find(q => q.id === incoming.id);
      if (!local) {
        quotes.push(incoming);
        updates.push(incoming);
      } else if (local.text !== incoming.text) {
        const i = quotes.findIndex(q => q.id === incoming.id);
        quotes[i] = incoming;
        conflicts.push({ old: local, new: incoming });
      }
    });

    if (updates.length || conflicts.length) {
      saveQuotes();
      populateCategories();
      notifyUser(updates, conflicts);
    }
  } catch (e) {
    console.error("Server sync error:", e);
  }
}
function notifyUser(updates, conflicts) {
  const note = document.getElementById("notification");
  note.innerHTML = '';

  if (updates.length) note.innerHTML += `<p>${updates.length} new quote(s) added from server.</p>`;
  if (conflicts.length) note.innerHTML += `<p>${conflicts.length} conflict(s) resolved by server data.</p>`;

  setTimeout(() => note.innerText = '', 8000);
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  populateCategories();
  const last = sessionStorage.getItem('lastQuote');
  if (last) {
    const q = JSON.parse(last);
    document.getElementById("quoteDisplay").innerText = `"${q.text}" - (${q.category})`;
  }
  fetchServerQuotes();
  setInterval(fetchServerQuotes, 30000); 
});
