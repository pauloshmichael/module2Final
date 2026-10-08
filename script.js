const state = {
  items: [],     
  favorites: [],
  search: ""     
};

const API_URL = "https://dummyjson.com/users?limit=30";
const STORAGE_KEY = "favorites";


const mainGrid = document.querySelector("#main-grid");
const favGrid = document.querySelector("#fav-grid");
const searchForm = document.querySelector(".form");
const searchInput = document.querySelector("#search-input");
const statusMessage = document.querySelector(".loading-error");


function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    state.favorites = Array.isArray(saved) ? saved : [];
  } catch (error) {
    state.favorites = [];
  }
}

function saveFavorites() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.favorites));
}


function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("is-error", isError);
}

async function fetchItems() {
  setStatus("Loading...");

  try {
    const response = await fetch(API_URL);

  
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    state.items = data.users;
    setStatus("");
  } catch (error) {
    setStatus(`Could not load data: ${error.message}`, true);
  }
}

function isFavorite(id) {
  return state.favorites.some((item) => item.id === id);
}


function getFilteredItems() {
  const term = state.search.trim().toLowerCase();

  return state.items.filter((item) => {
    const name = `${item.firstName} ${item.lastName}`.toLowerCase();
    const title = item.company.title.toLowerCase();
    return name.includes(term) || title.includes(term);
  });
}


function cardTemplate(item) {
  const fullName = `${item.firstName} ${item.lastName}`;
  const saved = isFavorite(item.id);
  const img = `${item.image}`

  return `
    <article class="card">
      <img src="${img}" alt="${fullName}">
      <div class="card-container">
        <h3 class="show-h3">${fullName}</h3>
        <p class="discription">${item.company.title}</p>
      </div>
      <button
        class="fav-btn"
        type="button"
        data-id="${item.id}"
        aria-pressed="${saved}"
        aria-label="${saved ? "Remove" : "Add"} ${fullName} ${saved ? "from" : "to"} favorites">
        ${saved ? "&#9829;" : "&#9825;"}
      </button>
    </article>
  `;
}

function renderMain() {
 
  if (state.items.length === 0) {
    mainGrid.innerHTML = "";
    return;
  }

  const items = getFilteredItems();

  mainGrid.innerHTML = items.length
    ? items.map(cardTemplate).join("")
    : `<p class="empty-msg">No results found.</p>`;
}

function renderFavorites() {
  favGrid.innerHTML = state.favorites.length
    ? state.favorites.map(cardTemplate).join("")
    : `<p class="empty-msg">No favorites yet.</p>`;
}

function render() {
  renderMain();
  renderFavorites();
}

function toggleFavorite(id) {
  if (isFavorite(id)) {
    state.favorites = state.favorites.filter((item) => item.id !== id);
  } else {
    const item = state.items.find((item) => item.id === id);
    if (item) {
      state.favorites.push(item);
    }
  }

  saveFavorites();
  render();
}


document.addEventListener("click", (event) => {
  const button = event.target.closest(".fav-btn");
  if (!button) return;

  toggleFavorite(Number(button.dataset.id));
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderMain();
});


searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.search = searchInput.value;
  renderMain();
});

// ---------- Init ----------
async function init() {
  loadFavorites();  
  renderFavorites();  
  await fetchItems(); 
  render();           
}

init();
