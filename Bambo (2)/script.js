let currentLang = "sq";
let currentCategory = "all";
let products = [];

// 1. Ngarkimi i të dhënave direkt nga skedari JSON
fetch("data/products.json")
  .then(res => res.json())
  .then(data => {
    // Përditësohet gjithmonë nga skedari për të parë ndryshimet pa Incognito
    products = data; 
    renderCategories();
    renderProducts();
  })
  .catch(err => console.error("Gabim gjatë ngarkimit të menusë:", err));

// 2. Gjenerimi i Kategorive (Përkthehen automatikisht)
function renderCategories() {
  const container = document.getElementById("categories");
  if (!container) return;

  // Përkthejmë butonin "All" bazuar te gjuha
  const btnAllName = currentLang === "sq" ? "Të gjitha" : "All";
  container.innerHTML = `<button onclick="filterCategory('all')">${btnAllName}</button>`;
  
  // Krijojmë një listë me kategori unike
  const uniqueCats = [];
  const seen = new Set();
  
  products.forEach(p => {
    if (!seen.has(p.category.sq)) {
      seen.add(p.category.sq);
      uniqueCats.push(p.category);
    }
  });

  // Shfaqim kategoritë në gjuhën e zgjedhur
  uniqueCats.forEach(cat => {
    container.innerHTML += `
      <button onclick="filterCategory('${cat.sq}')">
        ${cat[currentLang].toUpperCase()}
      </button>
    `;
  });
}

// 3. Shfaqja e Produkteve
function renderProducts() {
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "";
  
  // Filtrojmë produktet (përdorim .sq si çelës unik filtrimi)
  const filtered = products.filter(p =>
    currentCategory === "all" || p.category.sq === currentCategory
  );

  filtered.forEach(p => {
    let sizeHTML = '';
    
    // Për picat, shfaq madhësi normale dhe familjare
    if (p.category.sq === "pica" && p.priceFamily) {
      sizeHTML = `
        <div class="size-section">
          <p class="size-label">${currentLang === 'sq' ? 'Madhësia:' : 'Size:'}</p>
          <div class="size-cards">
            <div class="size-card active" data-price="${p.price}" data-size="normal" onclick="selectSize(this, ${p.id})">
              <div class="size-name">${currentLang === 'sq' ? 'Normale' : 'Regular'}</div>
              <div class="size-price">${p.price} Lekë</div>
            </div>
            <div class="size-card" data-price="${p.priceFamily}" data-size="family" onclick="selectSize(this, ${p.id})">
              <div class="size-name">${currentLang === 'sq' ? 'Familjare' : 'Family'}</div>
              <div class="size-price">${p.priceFamily} Lekë</div>
            </div>
          </div>
        </div>
      `;
    }

    // generate garnish section if applicable (supports both nested and flat formats)
    let garnishHTML = '';
    if (p.garnishes) {
      garnishHTML = `
        <div class="garnish-section">
          <p class="garnish-label">${currentLang === 'sq' ? 'Shoqëruese:' : 'Sides:'}</p>
          <div class="garnish-cards">
            ${p.garnishes
              .map(g => {
                // determine display name
                const name = g.name ? g.name[currentLang] : g[currentLang];
                // determine price (english/alq depending or generic)
                let price = g.price;
                if (price === undefined) {
                  price = currentLang === 'sq' ? g.priceSq : g.priceEn;
                }
                if (price === undefined) price = g.priceSq || g.priceEn || 0;
                return `
              <div class="garnish-card" data-price="${price}" onclick="updateGarnishPrice(this, ${p.id})">
                <div class="garnish-name">${name}</div>
                <div class="garnish-price">${price} Lekë</div>
              </div>
              `;
              })
              .join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML += `
      <div class="card" data-product-id="${p.id}" data-garnish-total="0">
        ${p.image ? `<img src="${p.image}" alt="${p.name[currentLang]}" />` : ''}
        <h3>${p.name[currentLang]}</h3>
        <p class="desc">${p.description ? p.description[currentLang] : ''}</p>
        ${sizeHTML}
        ${garnishHTML}
        <p class="price" data-base-price="${p.price}"><span class="base-price">${p.price}</span> Lekë</p>
      </div>
    `;
  });
}

// 4. Funksionet e Ndërveprimit
function filterCategory(catSq) {
  currentCategory = catSq;
  renderProducts();
}


// helper to sum garnishes, with special escalation rule for eskallop products
function calculateExtras(card) {
  const selected = [...card.querySelectorAll('.garnish-card.selected')];
  if (selected.length === 0) return 0;

  const name = card.querySelector('h3').innerText.toLowerCase();
  let total = 0;

  selected.forEach((g, idx) => {
    let p = parseInt(g.getAttribute('data-price'));
    // if product is eskallop and this is the second garnish, double its value
    if (idx === 1 && name.includes('eskallop')) {
      p *= 2;
    }
    total += p;
  });

  return total;
}

function selectSize(element, productId) {
  // Remove active class from all size cards in this card
  const card = element.closest('.card');
  card.querySelectorAll('.size-card').forEach(sc => {
    sc.classList.remove('active');
  });
  
  // Add active class to selected size
  element.classList.add('active');
  
  // Update price and store base-price attribute
  const price = parseInt(element.getAttribute('data-price'));
  const priceSpan = card.querySelector('.price');
  priceSpan.setAttribute('data-base-price', price);
  
  // include extras, using helper
  const extra = calculateExtras(card);
  priceSpan.innerHTML = `<span class="base-price">${price + extra}</span> Lekë`;
}

function updateGarnishPrice(el, productId/*, garnishPrice*/) {
  const card = el.closest('.card');
  const priceSpan = card.querySelector('.price');
  const base = parseInt(priceSpan.getAttribute('data-base-price')) || 0;

  // toggle selected state
  el.classList.toggle('selected');

  // recalc total extras using helper (includes eskallop rule)
  const extra = calculateExtras(card);

  priceSpan.innerHTML = `<span class="base-price">${base + extra}</span> Lekë`;
}

function changeLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  
  // Përkthimi i placeholder-it të Search Bar
  const searchInput = document.getElementById('menuSearch');
  if (searchInput) {
    searchInput.placeholder = lang === 'sq' ? 'Kërko ushqimin...' : 'Search food...';
  }
  
  // Rifreskojmë kategoritë dhe produktet me gjuhën e re
  renderCategories();
  renderProducts();
}


function searchMenu() {
  const input = document.getElementById('menuSearch').value.toLowerCase();
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    // Marrim emrin e produktit nga h3 brenda card-es
    const productName = card.querySelector('h3').innerText.toLowerCase();
    
    if (productName.includes(input)) {
      card.style.display = "block"; // Shfaqet
    } else {
      card.style.display = "none"; // Fshihet
    }
  });
}
