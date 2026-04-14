if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js', {
    updateViaCache: 'none' 
  }).then(reg => {
    reg.update(); 
    console.log('Service Worker u regjistrua pa Cache! Scope:', reg.scope);
  }).catch(err => {
    console.error('Gabim gjatë regjistrimit të SW:', err);
  });
}

let currentLang = "sq";
let currentCategory = "all"; 
let products = [];

// 1. Ngarkimi i Menu-së (Shtojmë parametrin shouldScroll)
function loadMenu(lang, shouldScroll = false) {
  currentLang = lang;
  fetch(`data/${lang}.json`)
    .then(res => res.json())
    .then(data => {
      products = data; 
      renderCategories();
      renderProducts();
      
      // Bëjmë scroll VETËM nëse shouldScroll është true
      if (shouldScroll) {
        scrollToProducts();
      }
    })
    .catch(err => console.error("Gabim gjatë ngarkimit:", err));
}

// Ngarkimi fillestar (shouldScroll lihet false automatikisht)
loadMenu(currentLang);

function scrollToProducts() {
  const productsContainer = document.getElementById("products");
  if (productsContainer) {
    const offset = productsContainer.offsetTop - 130; 
    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  }
}

// 2. Gjenerimi i Kategorive
function renderCategories() {
  const container = document.getElementById("categories");
  if (!container) return;

  const labels = { sq: "Të gjitha", en: "All", it: "Tutto" };
  container.innerHTML = `<button onclick="filterCategory('all')">${labels[currentLang]}</button>`;

  const uniqueCats = [...new Set(products.map(p => p.category))];

  uniqueCats.forEach(cat => {
    container.innerHTML += `<button onclick="filterCategory('${cat}')">${cat.toUpperCase()}</button>`;
  });
}

function filterCategory(cat) {
  currentCategory = cat;
  renderProducts();
  scrollToProducts(); // Kategoritë gjithmonë bëjnë scroll
}

// 3. Shfaqja e Produkteve
function renderProducts() {
  const container = document.getElementById("products");
  if (!container) return;
  container.innerHTML = "";

  const filtered = currentCategory === "all" 
    ? products 
    : products.filter(p => p.category === currentCategory);

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    
    if (p.logic_type) {
      card.setAttribute('data-logic', p.logic_type);
    }

    let imageHTML = p.image ? `<img src="assets/${p.image}" alt="${p.name}" class="product-img" loading="lazy">` : '';

    let sizeHTML = '';
    if (p.priceFamily) {
      const sizeLabel = { sq: 'Madhësia:', en: 'Size:', it: 'Dimensione:' };
      const regLabel = { sq: 'Normale', en: 'Regular', it: 'Normale' };
      const famLabel = { sq: 'Familjare', en: 'Family', it: 'Famiglia' };

      sizeHTML = `
        <div class="size-section">
          <p class="size-label">${sizeLabel[currentLang]}</p>
          <div class="size-cards">
            <div class="size-card active" data-price="${p.price}" onclick="selectSize(this)">
              <div class="size-name">${regLabel[currentLang]}</div>
              <div class="size-price">${p.price} L</div>
            </div>
            <div class="size-card" data-price="${p.priceFamily}" onclick="selectSize(this)">
              <div class="size-name">${famLabel[currentLang]}</div>
              <div class="size-price">${p.priceFamily} L</div>
            </div>
          </div>
        </div>
      `;
    }

    let garnishHTML = '';
    if (p.garnishes && p.garnishes.length > 0) {
      const sidesLabel = { sq: 'Shoqëruese:', en: 'Sides:', it: 'Contorni:' };
      garnishHTML = `
        <div class="garnish-section">
          <p class="garnish-label">${sidesLabel[currentLang]}</p>
          <div class="garnish-cards">
            ${p.garnishes.map(g => `
              <div class="garnish-card" data-price="${g.price}" onclick="updateGarnishPrice(this)">
                <div class="garnish-name">${g.name}</div>
                <div class="garnish-price">${g.price} L</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      ${imageHTML}
      <div class="card-content">
        <h3>${p.name}</h3>
        <p class="desc">${p.description || ''}</p>
        ${sizeHTML}
        ${garnishHTML}
        <p class="price" data-base-price="${p.price}"><span class="base-price">${p.price}</span> Lekë</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function selectSize(element) {
  const card = element.closest('.card');
  card.querySelectorAll('.size-card').forEach(sc => sc.classList.remove('active'));
  element.classList.add('active');
  const newBasePrice = parseInt(element.getAttribute('data-price'));
  const priceSpan = card.querySelector('.price');
  priceSpan.setAttribute('data-base-price', newBasePrice);
  refreshTotalPrice(card);
}

function updateGarnishPrice(el) {
  el.classList.toggle('selected');
  refreshTotalPrice(el.closest('.card'));
}

function refreshTotalPrice(card) {
  const basePrice = parseInt(card.querySelector('.price').getAttribute('data-base-price'));
  const selectedGarnishes = [...card.querySelectorAll('.garnish-card.selected')];
  
  const logicType = card.getAttribute('data-logic'); 
  
  let extra = 0;
  selectedGarnishes.forEach((g, idx) => {
    let p = parseInt(g.getAttribute('data-price')) || 0;

    if (idx === 1 && logicType === 'double_garnish') { 
      p = p * 2; 
    }
    
    extra += p;
  });

  card.querySelector('.base-price').innerText = basePrice + extra;
}

function changeLanguage(lang) {
  currentCategory = "all";
  const placeholders = { sq: 'Kërko ushqimin...', en: 'Search food...', it: 'Cerca cibo...' };
  const searchInput = document.getElementById('menuSearch');
  if (searchInput) searchInput.placeholder = placeholders[lang];
  
  // Këtu kalojmë 'true' që të ndodhë scroll-i kur ndërrohet gjuha
  loadMenu(lang, true);
  
  const menu = document.getElementById('languageOptions');
  if (menu) menu.classList.remove('show');
}

function searchMenu() {
  const input = document.getElementById('menuSearch').value.toLowerCase();
  document.querySelectorAll('.card').forEach(card => {
    const name = card.querySelector('h3').innerText.toLowerCase();
    card.style.display = name.includes(input) ? "block" : "none";
  });
}

function toggleLanguages() {
  const menu = document.getElementById('languageOptions');
  if (menu) menu.classList.toggle('show');
}

window.onscroll = function() {
  let btn = document.getElementById("backToTop");
  if (!btn) return;
  if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
    btn.style.display = "flex";
  } else {
    btn.style.display = "none";
  }
};

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
