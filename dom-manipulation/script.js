// Modify quote structure to include unique IDs
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { id: 1, text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { id: 3, text: "Success is not final, failure is not fatal.", category: "Success" }
];

let lastQuoteId = quotes.reduce((max, q) => Math.max(max, q.id), 0); // Track latest ID

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
  const categorySelect = document.getElementById("quoteCategory");  }
async function fetchServerQuotes() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const serverQuotes = await response.json();

    let updates = [];
    let conflicts = [];

    serverQuotes.forEach(serverQuote => {
      const mapped = {
        id: serverQuote.id,
        text: serverQuote.title,
        category: "Imported"
      };

      const existing = quotes.find(q => q.id === mapped.id);

      if (!existing) {
        quotes.push(mapped);
        updates.push(mapped);
      } else if (existing.text !== mapped.text) {

        conflicts.push({ old: existing, new: mapped });
        const index = quotes.findIndex(q => q.id === mapped.id);
        quotes[index] = mapped;
      }
    });

    if (updates.length > 0 || conflicts.length > 0) {
      saveQuotes();
      populateCategories();
      notifyUser(updates, conflicts);
    }
  } catch (error) {
    console.error("Error syncing with server:", error);
  }
}

// Notify user of updates/conflicts
function notifyUser(updates, conflicts) {
  const notify = document.getElementById("notification");
  notify.innerHTML = '';

  if (updates.length > 0) {
    notify.innerHTML += `<p>${updates.length} new quote(s) added from server.</p>`;
  }

  if (conflicts.length > 0) {
    notify.innerHTML += `<p>${conflicts.length} conflict(s) resolved by server data.</p>`;
  }

  setTimeout(() => {
    notify.innerText = '';
  }, 10000);
}


setInterval(fetchServerQuotes, 30000);


function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Both quote and category are required.");
    return;
  }

  const newQuote = {
    id: ++lastQuoteId,
    text,
    category
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added!");
}
