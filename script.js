/**
 * GIOIA CACCIA E PESCA - Interactive Store Script
 * Daniel Bevacqua Shop - Decap CMS + Stripe Setup
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. DATA AND STATE
  // ==========================================
  let products = [];
  let wishlist = [];
  let currentSlide = 0;
  let autoplayTimer = null;
  let activeCategoryFilter = "all";

  // Fallback products array
  const fallbackProducts = [
    {
      id: 1,
      name: "Starlight Ricaricabile",
      price: 12.50,
      brand: "Trabucco",
      category: "fili",
      img: "assets/starlight.jpeg",
      rating: 5.0,
      reviews: 12,
      badge: "Novità",
      specs: ["LED USB", "Alta Visib.", "Auton. 8h"],
      desc: "Starlight ricaricabile a LED ad alta visibilità con spina USB incorporata. Perfetto per le sessioni di pesca notturna. Durevole, ecologico e resistente all'acqua.",
      stripeUrl: "https://buy.stripe.com/mock-starlight"
    },
    {
      id: 2,
      name: "Monofilo",
      price: 14.90,
      brand: "Trabucco",
      category: "fili",
      img: "assets/monofilo.jpeg",
      rating: 5.0,
      reviews: 8,
      badge: "Best Seller",
      specs: ["Nylon Giapp.", "Fluorocarbon", "Bobina 150m"],
      desc: "Monofilo in nylon di fabbricazione giapponese con rivestimento in fluorocarbon. Invisibile in acqua, ad altissima resistenza al nodo e all'abrasione.",
      stripeUrl: "https://buy.stripe.com/mock-monofilo"
    },
    {
      id: 3,
      name: "Mulinello",
      price: 89.00,
      brand: "Shimano",
      category: "mulinelli",
      img: "assets/mulinello.jpeg",
      rating: 5.0,
      reviews: 24,
      badge: "Top Quality",
      specs: ["Friz. Microm.", "9+1 Cuscin.", "Max Drag 12k"],
      desc: "Mulinello da pesca ad alte prestazioni con frizione micrometrica a dischi multipli, 9+1 cuscinetti a sfera schermati in acciaio inox e corpo sigillato anti-corrosione.",
      stripeUrl: "https://buy.stripe.com/mock-mulinello"
    },
    {
      id: 4,
      name: "Jig 15gr",
      price: 7.50,
      brand: "BKK",
      category: "jig",
      img: "assets/jig.jpeg",
      rating: 4.5,
      reviews: 19,
      badge: "Offerta",
      specs: ["Olograf. 3D", "Ancorette BKK", "Lancio Long"],
      desc: "Metal Jig da 15 grammi con finitura olografica 3D riflettente ad alta attrazione. Montato con ancorette originali BKK ad alta penetrazione.",
      stripeUrl: "https://buy.stripe.com/mock-jig"
    }
  ];

  // ==========================================
  // 2. ELEMENT SELECTORS
  // ==========================================
  const header = document.querySelector('.main-header');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const indicatorDots = document.querySelectorAll('.indicator-dot');
  
  // Search selectors
  const searchInput = document.getElementById('search-input');
  const searchSuggestions = document.getElementById('search-suggestions');
  const suggestionsList = document.getElementById('suggestions-list');
  const searchStatusBar = document.getElementById('search-status-bar');
  const searchStatusText = document.getElementById('search-status-text');
  const noProductsFound = document.getElementById('no-products-found');
  
  // Mobile drawer selectors
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');
  const drawerOverlayBg = document.getElementById('drawer-overlay-bg');
  const drawerSearchInput = document.getElementById('drawer-search-input');
  const submenuToggles = document.querySelectorAll('.submenu-toggle');
  
  // Quickview selectors
  const quickviewModal = document.getElementById('quickview-modal');
  const quickviewContent = document.getElementById('quickview-content');

  // ==========================================
  // 3. SCROLL REVEAL OBSERVER
  // ==========================================
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
  });

  function observeRevealElements() {
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }

  // ==========================================
  // 4. DYNAMIC PRODUCTS RENDERING
  // ==========================================
  function renderProductsGrid() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = products.map(product => {
      const badgeHtml = product.badge 
        ? `<span class="product-badge pesca">${product.badge}</span>` 
        : '';
      
      const specsHtml = (product.specs || [])
        .map(spec => `<li>${spec}</li>`)
        .join('');

      // Render stars dynamically based on rating
      const ratingStarsHtml = Array.from({ length: 5 }, (_, i) => {
        const starVal = i + 1;
        if (product.rating >= starVal) {
          return `<i class="fa-solid fa-star"></i>`;
        } else if (product.rating >= starVal - 0.5) {
          return `<i class="fa-solid fa-star-half-stroke"></i>`;
        } else {
          return `<i class="fa-regular fa-star"></i>`;
        }
      }).join('');

      const isWishlisted = wishlist.includes(product.id);
      const heartIconClass = isWishlisted 
        ? "fa-solid fa-heart active text-orange-bold" 
        : "fa-regular fa-heart";

      return `
        <div class="product-card-wrapper reveal" data-category="${product.category}" data-title="${product.name.toLowerCase()}">
          <div class="product-card" id="product-card-${product.id}">
            <div class="product-img-wrapper">
              ${badgeHtml}
              <img class="product-img" src="${product.img}" alt="${product.name}">
              <div class="product-action-overlays">
                <button class="btn-action-overlay add-to-wish" onclick="toggleWishlist(${product.id}, this)" aria-label="Aggiungi ai preferiti">
                  <i class="${heartIconClass}"></i>
                </button>
                <button class="btn-action-overlay zoom-product" onclick="openProductQuickview(${product.id})" aria-label="Anteprima rapida">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>
            <div class="product-info">
              <div class="product-brand">${product.brand}</div>
              <h3 class="product-title" onclick="openProductQuickview(${product.id})">${product.name}</h3>
              <div class="product-rating">
                ${ratingStarsHtml}
                <span class="rating-count">(${product.reviews})</span>
              </div>
              <ul class="product-specs">
                ${specsHtml}
              </ul>
              <div class="product-footer">
                <div class="product-price">€ ${product.price.toFixed(2)}</div>
                <a href="${product.stripeUrl || '#'}" target="_blank" rel="noopener noreferrer" class="product-btn" id="btn-buy-${product.id}">
                  Acquista <i class="fa-solid fa-credit-card"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Re-observe dynamic cards
    observeRevealElements();
    
    // Apply filters in case filters were pre-set
    applyProductFilters();
  }

  function loadProducts() {
    fetch('assets/products.json')
      .then(response => {
        if (!response.ok) throw new Error("File products.json non trovato o non accessibile");
        return response.json();
      })
      .then(data => {
        if (data && data.products && data.products.length > 0) {
          products = data.products;
          renderProductsGrid();
        }
      })
      .catch(err => {
        console.warn("Utilizzo dati di fallback statici per il catalogo:", err.message);
      });
  }

  // ==========================================
  // 5. SCROLL HANDLING
  // ==========================================
  function updateHeaderScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateHeaderScroll);
  updateHeaderScroll();

  // ==========================================
  // 6. CAROUSEL BANNER SLIDER
  // ==========================================
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    indicatorDots.forEach(dot => dot.classList.remove('active'));
    
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    
    const dot = document.querySelector(`.indicator-dot[data-slide="${currentSlide}"]`);
    if (dot) dot.classList.add('active');
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 6000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
    }
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(currentSlide - 1);
      startAutoplay();
    });
    nextBtn.addEventListener('click', () => {
      showSlide(currentSlide + 1);
      startAutoplay();
    });
  }

  indicatorDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.target.getAttribute('data-slide'));
      showSlide(targetIndex);
      startAutoplay();
    });
  });

  startAutoplay();

  // ==========================================
  // 7. TOAST NOTIFICATIONS ENGINE
  // ==========================================
  window.showToast = function(message, icon = "fa-circle-check") {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 3000);
  };

  // ==========================================
  // 8. WISHLIST TOGGLE
  // ==========================================
  window.toggleWishlist = function(productId, buttonEl) {
    const icon = buttonEl.querySelector('i');
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
      wishlist.splice(index, 1);
      icon.className = "fa-regular fa-heart";
      showToast("Prodotto rimosso dai preferiti", "fa-heart-crack");
    } else {
      wishlist.push(productId);
      icon.className = "fa-solid fa-heart active text-orange-bold";
      showToast("Prodotto aggiunto ai preferiti!", "fa-heart");
    }

    document.getElementById('wishlist-count').textContent = wishlist.length;
  };

  // ==========================================
  // 9. DYNAMIC FILTERING & LIVE SEARCH
  // ==========================================
  
  // Set filter categories from horizontal navigation
  window.filterCategory = function(categoryName) {
    activeCategoryFilter = categoryName;
    
    // Update filtering tabs active state
    const tabs = document.querySelectorAll('.filter-tab-btn');
    tabs.forEach(tab => {
      if (tab.getAttribute('data-filter') === categoryName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    applyProductFilters();
  };

  // Set filter category from products tabs
  window.setFilterTab = function(buttonEl) {
    const category = buttonEl.getAttribute('data-filter');
    filterCategory(category);
  };

  // Filter logic combined (category + search query)
  function applyProductFilters() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;
    
    const productCardWrappers = document.querySelectorAll('.product-card-wrapper');

    productCardWrappers.forEach(wrapper => {
      const cardCategory = wrapper.getAttribute('data-category');
      const cardTitle = wrapper.getAttribute('data-title').toLowerCase();
      
      const matchesCategory = (activeCategoryFilter === "all" || cardCategory === activeCategoryFilter);
      const matchesSearch = (query === "" || cardTitle.includes(query));

      if (matchesCategory && matchesSearch) {
        wrapper.style.display = 'block';
        wrapper.classList.add('active');
        visibleCount++;
      } else {
        wrapper.style.display = 'none';
      }
    });

    // Handle Search Feedback Bar
    if (query !== "") {
      searchStatusBar.style.display = 'flex';
      searchStatusText.innerHTML = `Mostrando <strong>${visibleCount}</strong> risultati per "<strong>${escapeHtml(query)}</strong>"`;
    } else {
      searchStatusBar.style.display = 'none';
    }

    // Handle No Results Message
    if (visibleCount === 0) {
      noProductsFound.style.display = 'block';
    } else {
      noProductsFound.style.display = 'none';
    }
  }

  // Clear search input filter
  window.clearSearchFilter = function() {
    searchInput.value = "";
    applyProductFilters();
    searchSuggestions.style.display = 'none';
  };

  // Live search key event
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyProductFilters();
      updateSearchSuggestions();
    });

    // Close suggestions if clicked outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
        searchSuggestions.style.display = 'none';
      }
    });
  }

  // Search input dropdown suggestions
  function updateSearchSuggestions() {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) {
      searchSuggestions.style.display = 'none';
      return;
    }

    const matches = products.filter(p => p.name.toLowerCase().includes(query));
    if (matches.length === 0) {
      searchSuggestions.style.display = 'none';
      return;
    }

    searchSuggestions.style.display = 'block';
    suggestionsList.innerHTML = matches.map(p => `
      <div class="suggestion-item" onclick="openSuggestionQuickview(${p.id})">
        <img src="${p.img}" alt="${p.name}" class="suggestion-img">
        <div class="suggestion-info">
          <div class="suggestion-name">${p.name}</div>
          <div class="suggestion-price">€ ${p.price.toFixed(2)}</div>
        </div>
      </div>
    `).join('');
  }

  // Click suggestion opens modal and clears hints
  window.openSuggestionQuickview = function(id) {
    searchSuggestions.style.display = 'none';
    openProductQuickview(id);
  };

  function escapeHtml(string) {
    return string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ==========================================
  // 10. QUICKVIEW PRODUCT MODAL
  // ==========================================
  window.openProductQuickview = function(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const ratingStarsHtml = Array.from({ length: 5 }, (_, i) => {
      const starVal = i + 1;
      if (product.rating >= starVal) {
        return `<i class="fa-solid fa-star"></i>`;
      } else if (product.rating >= starVal - 0.5) {
        return `<i class="fa-solid fa-star-half-stroke"></i>`;
      } else {
        return `<i class="fa-regular fa-star"></i>`;
      }
    }).join('');

    quickviewContent.innerHTML = `
      <div class="quickview-grid">
        <div class="qv-image">
          <img src="${product.img}" alt="${product.name}">
        </div>
        <div>
          <span class="qv-brand">${product.brand}</span>
          <h2 class="qv-title">${product.name}</h2>
          <div class="qv-rating">
            ${ratingStarsHtml}
            <span class="rating-count">(${product.reviews} recensioni)</span>
          </div>
          <div class="qv-price">€ ${product.price.toFixed(2)}</div>
          <p class="qv-desc">${product.desc}</p>
          <div class="qv-actions">
            <a href="${product.stripeUrl || '#'}" target="_blank" rel="noopener noreferrer" class="qv-add-btn" onclick="closeProductQuickview()">
              Acquista Ora <i class="fa-solid fa-credit-card"></i>
            </a>
          </div>
        </div>
      </div>
    `;

    quickviewModal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
  };

  window.closeProductQuickview = function() {
    quickviewModal.classList.remove('open');
    document.body.style.overflow = 'auto'; // Restore background scrolling
  };

  // Close modal when clicking outside contents
  if (quickviewModal) {
    quickviewModal.addEventListener('click', (e) => {
      if (e.target === quickviewModal) {
        closeProductQuickview();
      }
    });
  }

  // ==========================================
  // 11. MOBILE NAVIGATION DRAWER
  // ==========================================
  window.closeDrawer = function() {
    mobileDrawer.classList.remove('open');
    drawerOverlayBg.classList.remove('open');
    document.body.style.overflow = 'auto';
  };

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
      drawerOverlayBg.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlayBg) drawerOverlayBg.addEventListener('click', closeDrawer);

  // Submenus in mobile drawer toggle
  submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      const headerEl = e.target.closest('.drawer-submenu-header');
      const submenu = headerEl.nextElementSibling;
      
      submenu.classList.toggle('open');
      
      // Change icon
      if (submenu.classList.contains('open')) {
        e.target.className = "fa-solid fa-minus submenu-toggle";
      } else {
        e.target.className = "fa-solid fa-plus submenu-toggle";
      }
    });
  });

  // Filter product catalog from mobile drawer search input
  window.filterFromDrawer = function() {
    const query = drawerSearchInput.value.trim();
    if (query !== "") {
      searchInput.value = query;
      applyProductFilters();
      // Scroll smoothly to products section
      const target = document.getElementById('products-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
    closeDrawer();
  };

  // ==========================================
  // 12. NEWSLETTER & UTILS
  // ==========================================
  window.handleNewsletter = function(formEl) {
    const emailInput = document.getElementById('newsletter-email');
    if (!emailInput) return;

    const email = emailInput.value.trim();
    if (email !== "") {
      showToast("Grazie! Ti sei iscritto con successo.", "fa-paper-plane");
      emailInput.value = "";
    }
  };

  // ==========================================
  // 13. INITIALIZATION
  // ==========================================
  // Render fallback products immediately to avoid layout shifts,
  // then fetch dynamic ones from JSON asynchronously.
  products = fallbackProducts;
  renderProductsGrid();
  loadProducts();
});
