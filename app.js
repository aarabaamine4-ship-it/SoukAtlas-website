const RABAT_CENTER = [34.020882, -6.84165];
const DEFAULT_ZOOM = 15.25;
const FOCUSED_ZOOM = 17;
const MAX_MAP_ZOOM = 20;
const PRICE_TOLERANCE = 5;
const SELLER_STORAGE_KEY = "souk-atlas-published-sellers";
const SESSION_KEY = "souk-atlas-current-user";
const CART_STORAGE_KEY = "souk-atlas-cart";

const meatProducts = [
  {
    id: "beef",
    label: "Beef",
    local: "lham ba9ar",
    short: "Beef",
    aliases: ["beef", "cow", "meat", "lham", "lham ba9ar", "l7am", "lahm", "viande"],
    image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=640&q=82"
  },
  {
    id: "lamb",
    label: "Lamb",
    local: "lham ghanam",
    short: "Lamb",
    aliases: ["lamb", "sheep", "ghanam", "lham ghanam", "agneau"],
    image: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?auto=format&fit=crop&w=640&q=82"
  },
  {
    id: "chicken",
    label: "Chicken",
    local: "djaj",
    short: "Chicken",
    aliases: ["chicken", "djaj", "dajaj", "poulet"],
    image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=640&q=82"
  },
  {
    id: "turkey",
    label: "Turkey",
    local: "dinde",
    short: "Turkey",
    aliases: ["turkey", "dinde", "bibi", "dindon"],
    image: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?auto=format&fit=crop&w=640&q=82"
  },
  {
    id: "sardines",
    label: "Sardines",
    local: "srdine",
    short: "Sard",
    aliases: ["sardines", "sardine", "sardin", "srdine", "hout"],
    image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=640&q=82"
  }
];

const productById = new Map(meatProducts.map((product) => [product.id, product]));

const CITIES = {
  rabat: { name: "Rabat", center: [34.020882, -6.84165] },
  casablanca: { name: "Casablanca", center: [33.5731, -7.5898] },
  sale: { name: "Salé", center: [34.0331, -6.7985] },
  temara: { name: "Temara", center: [33.9267, -6.9122] },
  marrakech: { name: "Marrakech", center: [31.6295, -7.9811] },
  fes: { name: "Fes", center: [34.0181, -5.0078] },
  tangier: { name: "Tangier", center: [35.7595, -5.8340] }
};

let activeCityCenter = CITIES.rabat.center;

function generateFakeSellers() {
  const shopNouns = ["Boucherie", "Atlas Cuts", "Prime Meats", "Halal Souk", "Chez L'Haj", "Fresh Cuts", "Red Meat House", "Atlas Butchery", "Al Medina Meats", "Fine Halal", "Souk Atlas Halal", "Al Boustane", "Nour Halal Meats", "Wafaa Butchery"];
  const firstNames = ["Hassan", "Ahmed", "Mohamed", "Youssef", "Karim", "Omar", "Brahim", "Mustapha", "Rachid", "Khalid", "Anas", "Hamza", "Amine", "Bilal", "Yassine"];
  
  const generated = [];
  let idCounter = 1;
  
  Object.entries(CITIES).forEach(([cityId, cityData]) => {
    // Generate 4 dynamic sellers per city, totaling 28 sellers across Morocco
    for (let i = 0; i < 4; i++) {
      const firstName = firstNames[(Math.floor(Math.sin(idCounter) * 10000) & 0xffff) % firstNames.length];
      const shopNoun = shopNouns[(Math.floor(Math.cos(idCounter) * 10000) & 0xffff) % shopNouns.length];
      const name = `${shopNoun} ${firstName}`;
      
      // Slightly offset coordinates to spread markers naturally around city center
      // Use deterministic math so refresh / reload gives the same lovely spread
      const latOffset = (Math.sin(idCounter * 12.3) * 0.015);
      const lngOffset = (Math.cos(idCounter * 7.8) * 0.015);
      const lat = cityData.center[0] + latOffset;
      const lng = cityData.center[1] + lngOffset;
      
      // Choose neighborhood names for each Moroccan city
      const locations = {
        rabat: ["Medina", "Agdal", "Hassan", "Les Orangers", "Souissi", "Akkari"],
        casablanca: ["Anfa", "Maarif", "Gauthier", "Ain Diab", "Sidi Bernoussi", "Oasis"],
        sale: ["Tabriquet", "Bettana", "Sidi Moussa", "Sala Al Jadida", "Medina"],
        temara: ["Wifaq", "Harhoura", "Massira", "Center", "Sadate"],
        marrakech: ["Gueliz", "Medina", "Hivernage", "Daoudiate", "Chrifia"],
        fes: ["Narjiss", "Atlas", "Medina", "Route d'Imouzzer", "Batha"],
        tangier: ["Malabata", "Marshane", "Brance", "Medina", "Boukhalef"]
      };
      
      const cityLocs = locations[cityId] || ["Medina"];
      const locationName = cityLocs[(Math.floor(Math.sin(idCounter * 3) * 1000) & 0xff) % cityLocs.length] + ", " + cityData.name;
      
      // Choose a deterministic number of products (3 to 5) out of the list
      const cityProductRows = [];
      const prodList = ["beef", "chicken", "lamb", "turkey", "sardines"];
      
      prodList.forEach((prodId, idx) => {
        // Deterministically assign product to seller
        const shouldInclude = ((Math.abs(Math.sin(idCounter * (idx + 1) * 5.5)) * 10) % 1) > 0.25 || idx === 0; // ensure at least 1 product
        if (shouldInclude) {
          // Generate price between 70dh and 110dh
          const price = Math.floor((Math.abs(Math.cos(idCounter * (idx + 2) * 9.1)) * 41) + 70);
          cityProductRows.push([prodId, price]);
        }
      });
      
      generated.push(
        seller(
          `generated-${cityId}-${idCounter++}`,
          name,
          locationName,
          lat,
          lng,
          cityProductRows
        )
      );
    }
  });
  
  return generated;
}

const baseSellers = generateFakeSellers();

const sellers = [...baseSellers, ...loadPublishedSellers()];

const featuredProductsGrid = document.getElementById("featuredProducts");
const productResultCount = document.getElementById("productResultCount");
const mapSearch = document.getElementById("mapSearch");
const mapSearchInput = document.getElementById("mapSearchInput");
const globalSearch = document.getElementById("navSearch");
const globalSearchInput = document.getElementById("globalSearchInput");
const locationButton = document.getElementById("locationButton");
const searchStatus = document.getElementById("searchStatus");
const mapSidePanel = document.getElementById("mapSidePanel");
const mapPanelClose = document.getElementById("mapPanelClose");
const mapPanelSeller = document.getElementById("mapPanelSeller");
const mapPanelProducts = document.getElementById("mapPanelProducts");
const mapPanelLink = document.getElementById("mapPanelLink");
const marketplacePage = document.getElementById("marketplacePage");
const listViewButton = document.getElementById("listViewButton");
const mapViewButton = document.getElementById("mapViewButton");
const sellerCta = document.querySelector(".seller-cta");
const loginLink = document.querySelector(".login-link");
const bestPriceHighlight = document.getElementById("bestPriceHighlight");
const productFilter = document.getElementById("productFilter");
const priceRangeFilter = document.getElementById("priceRangeFilter");
const priceRangeLabel = document.getElementById("priceRangeLabel");
const distanceFilter = document.getElementById("distanceFilter");
const cartCountBadge = document.getElementById("cartCountBadge");

let map;
let sellerLayer;
let filteredSellers = [...sellers];
let selectedProductId = "beef";
let targetPrice = null;
let activeSellerId = null;
let userLocationMarker = null;
let searchTimeoutId = null;
let lastSearchQuery = "";
const markerBySellerId = new Map();
const currentUser = getCurrentUser();
const currentRole = currentUser ? "seller" : "visitor";

document.body.dataset.role = currentRole;

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function updateRoleUI() {
  if (currentUser) {
    if (loginLink) {
      loginLink.textContent = currentUser.name || "Seller";
      loginLink.href = "create-listing.html";
    }
    if (sellerCta) {
      sellerCta.textContent = "Add Product";
      sellerCta.href = "create-listing.html";
    }
    return;
  }

  if (loginLink) {
    loginLink.textContent = "Login";
    loginLink.href = "login.html";
  }
  if (sellerCta) {
    sellerCta.textContent = "Become a Seller";
    sellerCta.href = "register.html";
  }
}

function getCartItems() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function saveCartItems(cartItems) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  updateCartBadge();
}

function updateCartBadge() {
  if (!cartCountBadge) {
    return;
  }

  const count = getCartItems().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  cartCountBadge.textContent = String(count);
  cartCountBadge.hidden = count === 0;
}

function findSellerById(sellerId) {
  return sellers.find((marketSeller) => marketSeller.id === sellerId) || sellers[0];
}

function storeSellerForProfile(sellerId) {
  const marketSeller = findSellerById(sellerId);
  if (!marketSeller) {
    return null;
  }

  localStorage.setItem(
    "souk-atlas-selected-seller",
    JSON.stringify({
      ...marketSeller,
      isBestPrice: marketSeller.id === getCheapestSellerId()
    })
  );
  return marketSeller;
}

function seller(id, name, location, lat, lng, productRows) {
  return {
    id,
    name,
    phone: "06 00 00 00 00",
    category: "meat",
    location,
    lat,
    lng,
    profileImage: "",
    userGenerated: false,
    products: productRows.map(([productId, price]) => product(productId, price))
  };
}

function normalizeMockPrice(price) {
  if (price < 50) {
    return Math.min(110, price + 60);
  }
  if (price < 70) {
    return Math.min(110, price + 30);
  }
  return Math.min(110, price);
}

function product(productId, price, customImage = "", shouldNormalize = true) {
  const definition = productById.get(productId);
  const normalizedPrice = shouldNormalize ? normalizeMockPrice(price) : price;
  return {
    id: productId,
    name: definition.label,
    local: definition.local,
    short: definition.short,
    price: normalizedPrice,
    unit: "kg",
    image: customImage || definition.image
  };
}

function loadPublishedSellers() {
  try {
    const savedListings = JSON.parse(localStorage.getItem(SELLER_STORAGE_KEY) || "[]");
    if (!Array.isArray(savedListings)) {
      return [];
    }

    return savedListings
      .filter((listing) => listing?.status === "published" && listing?.products?.[0]?.id && productById.has(listing.products[0].id))
      .map((listing) => {
        const listingProduct = listing.products[0];
        return {
          id: listing.id,
          name: listing.name || "New Souk Atlas Seller",
          phone: listing.phone || "Phone not added",
          category: "meat",
          location: listing.location || "Rabat",
          lat: Number(listing.lat) || RABAT_CENTER[0],
          lng: Number(listing.lng) || RABAT_CENTER[1],
          profileImage: listing.profileImage || "",
          productImages: Array.isArray(listing.productImages) ? listing.productImages : [],
          userGenerated: true,
          products: [product(listingProduct.id, Number(listingProduct.price) || 0, listingProduct.image, false)]
        };
      });
  } catch {
    return [];
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatPrice(item) {
  return `${item.price}dh/${item.unit}`;
}

function getStartingProduct(marketSeller) {
  return marketSeller.products.reduce((lowest, item) => (item.price < lowest.price ? item : lowest), marketSeller.products[0]);
}

function getMarkerProduct(marketSeller) {
  return marketSeller.products.find((item) => item.id === selectedProductId) || getStartingProduct(marketSeller);
}

function resolveProductId(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return null;
  }

  return meatProducts.find((item) =>
    item.aliases.some((alias) => alias.includes(normalizedQuery) || normalizedQuery.includes(alias))
  )?.id || null;
}

function parseSearchQuery(query) {
  const normalizedQuery = query.trim().toLowerCase();
  const priceMatch = normalizedQuery.match(/\d+(?:[.,]\d+)?/);
  const parsedPrice = priceMatch ? Number(priceMatch[0].replace(",", ".")) : null;
  const productText = normalizedQuery.replace(/\d+(?:[.,]\d+)?/g, " ").replace(/\s+/g, " ").trim();
  return {
    productId: resolveProductId(productText || normalizedQuery),
    price: Number.isFinite(parsedPrice) ? parsedPrice : null,
    text: productText
  };
}

function isPriceClose(price, priceToMatch) {
  if (!priceToMatch) {
    return true;
  }

  return Math.abs(price - priceToMatch) <= PRICE_TOLERANCE;
}

function getDistanceKm(lat, lng, origin = (typeof activeCityCenter !== 'undefined' ? activeCityCenter : RABAT_CENTER)) {
  const radius = 6371;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRadians(lat - origin[0]);
  const dLng = toRadians(lng - origin[1]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(origin[0])) * Math.cos(toRadians(lat)) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function matchesSearch(marketSeller, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const parsedQuery = parseSearchQuery(query);
  if (parsedQuery.productId) {
    return marketSeller.products.some((item) => item.id === parsedQuery.productId && isPriceClose(item.price, parsedQuery.price));
  }

  if (parsedQuery.price && !parsedQuery.text) {
    return marketSeller.products.some((item) => isPriceClose(item.price, parsedQuery.price));
  }

  return marketSeller.name.toLowerCase().includes(normalizedQuery) || marketSeller.location.toLowerCase().includes(normalizedQuery);
}

function matchesActiveFilters(marketSeller) {
  const selectedFilter = productFilter?.value || "all";
  const maxPrice = Number(priceRangeFilter?.value || 110);
  const maxDistance = distanceFilter?.value || "all";
  const selectedCity = document.getElementById("cityFilter")?.value || "all";
  
  const cityMatch = selectedCity === "all" || marketSeller.location.toLowerCase().includes(selectedCity.toLowerCase());
  const matchingProducts = marketSeller.products.filter((item) => selectedFilter === "all" || item.id === selectedFilter);
  const productMatch = matchingProducts.length > 0;
  const priceMatch = matchingProducts.some((item) => item.price <= maxPrice);
  const distanceMatch = maxDistance === "all" || getDistanceKm(marketSeller.lat, marketSeller.lng) <= Number(maxDistance);
  return cityMatch && productMatch && priceMatch && distanceMatch;
}

function getFilteredSellers(query = lastSearchQuery) {
  const filteredByControls = sellers.filter(matchesActiveFilters);
  const filteredBySearch = filteredByControls.filter((marketSeller) => matchesSearch(marketSeller, query));
  return filteredBySearch.length ? filteredBySearch : filteredByControls.length ? filteredByControls : sellers;
}

function getVisibleSellers(sourceSellers = sellers) {
  if (!map) {
    return sourceSellers;
  }

  const bounds = map.getBounds();
  const visible = sourceSellers.filter((marketSeller) => bounds.contains([marketSeller.lat, marketSeller.lng]));
  return visible.length ? visible : sourceSellers;
}

function getPriceRange(productId, sourceSellers = getVisibleSellers(filteredSellers)) {
  const offers = sourceSellers.flatMap((marketSeller) => marketSeller.products.filter((item) => item.id === productId));
  if (!offers.length) {
    return null;
  }

  const prices = offers.map((item) => item.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    unit: "kg",
    count: offers.length
  };
}

function getPriceTone(marketSeller) {
  const markerProduct = getMarkerProduct(marketSeller);
  const range = getPriceRange(markerProduct.id, getVisibleSellers(filteredSellers));
  if (!range || range.min === range.max) {
    return "average";
  }

  const midpoint = (range.min + range.max) / 2;
  if (markerProduct.price <= midpoint - 2) {
    return "low";
  }
  if (markerProduct.price >= midpoint + 2) {
    return "high";
  }
  return "average";
}

function getCheapestSellerId(sourceSellers = filteredSellers) {
  const sellersWithPrices = sourceSellers
    .map((marketSeller) => ({
      id: marketSeller.id,
      price: getMarkerProduct(marketSeller).price
    }))
    .filter((item) => Number.isFinite(item.price));

  if (!sellersWithPrices.length) {
    return null;
  }

  return sellersWithPrices.reduce((cheapest, item) => (item.price < cheapest.price ? item : cheapest), sellersWithPrices[0]).id;
}

function createSellerIcon(marketSeller, isActive = false) {
  const markerProduct = getMarkerProduct(marketSeller);
  const tone = getPriceTone(marketSeller);
  const isCheapest = marketSeller.id === getCheapestSellerId();
  const avatarMarkup = marketSeller.profileImage
    ? `<img src="${marketSeller.profileImage}" alt="" />`
    : `<span>${escapeHtml(marketSeller.name.slice(0, 2).toUpperCase())}</span>`;

  return L.divIcon({
    className: "",
    html: `
      <div class="seller-marker profile-marker ${tone}${isActive ? " active" : ""}${isCheapest ? " cheapest" : ""}">
        <div class="marker-avatar">${avatarMarkup}</div>
        <div>
          <div class="marker-product">${escapeHtml(markerProduct.name)}</div>
          <div class="marker-price">${formatPrice(markerProduct)}</div>
        </div>
        <div class="marker-tail"></div>
      </div>
    `,
    iconSize: [110, 56],
    iconAnchor: [55, 56],
    tooltipAnchor: [0, -56]
  });
}

function createHoverCardContent(marketSeller) {
  const markerProduct = getMarkerProduct(marketSeller);
  return `
    <div class="map-preview-tooltip">
      <img src="${markerProduct.image}" alt="" />
      <div>
        <strong>${formatPrice(markerProduct)}</strong>
        <span>${escapeHtml(markerProduct.name)}</span>
      </div>
    </div>
  `;
}

function initMap() {
  map = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: true,
    zoomAnimation: true,
    markerZoomAnimation: true,
    fadeAnimation: true,
    preferCanvas: true,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    wheelPxPerZoomLevel: 90,
    maxZoom: MAX_MAP_ZOOM
  }).setView(RABAT_CENTER, DEFAULT_ZOOM);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: MAX_MAP_ZOOM,
    maxNativeZoom: 20,
    subdomains: "abcd",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);

  map.attributionControl.setPrefix(false);
  sellerLayer = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    animate: true,
    maxClusterRadius: 58,
    iconCreateFunction(cluster) {
      const markerPrices = cluster
        .getAllChildMarkers()
        .map((marker) => marker.options.sellerPrice)
        .filter((price) => Number.isFinite(price));
      const averagePrice = markerPrices.length
        ? Math.round(markerPrices.reduce((sum, price) => sum + price, 0) / markerPrices.length)
        : "--";
      return L.divIcon({
        html: `<div class="meat-cluster"><span>${cluster.getChildCount()}</span><small>avg ${averagePrice}dh</small></div>`,
        className: "",
        iconSize: [72, 58]
      });
    }
  }).addTo(map);
  map.on("moveend zoomend", () => {
    refreshMarkerIcons();
  });
  renderSellerMarkers(sellers);
}

function renderSellerMarkers(nextSellers) {
  markerBySellerId.clear();
  sellerLayer.clearLayers();

  nextSellers.forEach((marketSeller) => {
    const markerProduct = getMarkerProduct(marketSeller);
    const marker = L.marker([marketSeller.lat, marketSeller.lng], {
      icon: createSellerIcon(marketSeller, marketSeller.id === activeSellerId),
      title: marketSeller.name,
      alt: marketSeller.name,
      sellerPrice: markerProduct.price
    })
      .bindTooltip(createHoverCardContent(marketSeller), {
        className: "seller-hover-tooltip",
        direction: "top",
        offset: [0, -10],
        opacity: 1
      });

    marker.on("click", () => openMapSidePanel(marketSeller.id));
    marker.on("mouseover", () => marker.openTooltip());
    marker.on("mouseout", () => marker.closeTooltip());
    marker.addTo(sellerLayer);
    markerBySellerId.set(marketSeller.id, marker);
  });

  if (nextSellers.length > 1) {
    const bounds = L.latLngBounds(nextSellers.map((marketSeller) => [marketSeller.lat, marketSeller.lng]));
    map.flyToBounds(bounds, { padding: [70, 70], maxZoom: DEFAULT_ZOOM, duration: 0.6 });
  }
}

function openMapSidePanel(sellerId) {
  const marketSeller = storeSellerForProfile(sellerId);
  if (!marketSeller || !mapSidePanel) {
    return;
  }

  activeSellerId = marketSeller.id;
  refreshMarkerIcons();

  const avatar = marketSeller.profileImage
    ? `<img src="${marketSeller.profileImage}" alt="" />`
    : `<span>${escapeHtml(marketSeller.name.slice(0, 2).toUpperCase())}</span>`;

  mapPanelSeller.innerHTML = `
    <div class="side-panel-avatar">${avatar}</div>
    <div>
      <h3>${escapeHtml(marketSeller.name)}</h3>
      <p>${escapeHtml(marketSeller.location)}</p>
      <a href="tel:${escapeHtml(String(marketSeller.phone || "").replace(/[^\d+]/g, ""))}">${escapeHtml(marketSeller.phone || "Phone not added")}</a>
    </div>
  `;

  mapPanelProducts.innerHTML = marketSeller.products
    .map(
      (item) => `
        <div class="side-product-row">
          <img src="${item.image}" alt="${escapeHtml(item.name)}" />
          <span>${escapeHtml(item.name)}</span>
          <strong>${formatPrice(item)}</strong>
        </div>
      `
    )
    .join("");

  mapPanelLink.href = `seller.html?id=${encodeURIComponent(marketSeller.id)}`;
  mapSidePanel.hidden = false;

  const marker = markerBySellerId.get(marketSeller.id);
  if (marker) {
    marker.openTooltip();
    map.flyTo([marketSeller.lat, marketSeller.lng], Math.max(map.getZoom(), FOCUSED_ZOOM), { duration: 0.55 });
  }

  // Highlight and scroll the corresponding deal card in the list
  const card = document.querySelector(`.product-card[data-seller-id="${sellerId}"]`);
  if (card) {
    document.querySelectorAll(".product-card").forEach((c) => c.classList.remove("active-highlight"));
    card.classList.add("active-highlight");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function closeMapSidePanel() {
  if (mapSidePanel) {
    mapSidePanel.hidden = true;
  }
  activeSellerId = null;
  refreshMarkerIcons();
}

function setMarketplaceView(view) {
  const isMapView = view === "map";
  marketplacePage.classList.toggle("map-view", isMapView);
  marketplacePage.classList.toggle("list-view", !isMapView);
  listViewButton.classList.toggle("active", !isMapView);
  mapViewButton.classList.toggle("active", isMapView);
  listViewButton.setAttribute("aria-pressed", String(!isMapView));
  mapViewButton.setAttribute("aria-pressed", String(isMapView));

  window.setTimeout(() => {
    map.invalidateSize();
  }, 260);
}

function refreshMarkerIcons() {
  markerBySellerId.forEach((marker, sellerId) => {
    const marketSeller = sellers.find((item) => item.id === sellerId);
    marker.setIcon(createSellerIcon(marketSeller, sellerId === activeSellerId));
    marker.setTooltipContent(createHoverCardContent(marketSeller));
  });
}

function focusSeller(sellerId) {
  const marketSeller = sellers.find((item) => item.id === sellerId);
  if (!marketSeller) {
    return;
  }

  activeSellerId = marketSeller.id;
  refreshMarkerIcons();

  const marker = markerBySellerId.get(marketSeller.id);
  if (marker) {
    marker.openTooltip();
    map.flyTo([marketSeller.lat, marketSeller.lng], Math.max(map.getZoom(), FOCUSED_ZOOM), { duration: 0.55 });
  }
}

function openSellerProfile(sellerId) {
  const marketSeller = storeSellerForProfile(sellerId);
  if (!marketSeller) {
    return;
  }
  window.location.href = `seller.html?id=${encodeURIComponent(sellerId)}`;
}

function closeSellerPanel() {
  activeSellerId = null;
  markerBySellerId.forEach((marker) => marker.closeTooltip());
  refreshMarkerIcons();
}

function setSearchStatus(type, message = "") {
  searchStatus.className = `search-status ${type}`;
  searchStatus.textContent = message;
}

function applySearch(query) {
  lastSearchQuery = query;
  const parsedQuery = parseSearchQuery(query);
  const selectedFilter = productFilter?.value || "all";
  selectedProductId = parsedQuery.productId || (selectedFilter !== "all" ? selectedFilter : "beef");
  targetPrice = parsedQuery.price;
  filteredSellers = getFilteredSellers(query);
  closeSellerPanel();
  renderSellerMarkers(filteredSellers);
  renderFeaturedProducts(filteredSellers);
  updateBestPriceHighlight(filteredSellers);

  if (!query.trim()) {
    setSearchStatus("hidden");
    map.flyTo(RABAT_CENTER, DEFAULT_ZOOM, { duration: 0.6 });
    return;
  }

  const exactMatches = sellers.filter(matchesActiveFilters).filter((marketSeller) => matchesSearch(marketSeller, query));
  if (!exactMatches.length) {
    setSearchStatus("empty", "No exact match found, showing nearby live offers");
    return;
  }

  const productLabel = productById.get(selectedProductId).label;
  const priceLabel = targetPrice ? ` around ${targetPrice}dh/kg` : "";
  setSearchStatus("result", `${filteredSellers.length} seller${filteredSellers.length === 1 ? "" : "s"} found for ${productLabel}${priceLabel}`);
  focusSeller(filteredSellers[0].id);
}

function queueSearch(query) {
  window.clearTimeout(searchTimeoutId);
  setSearchStatus("loading", "Searching meat prices across Rabat...");
  searchTimeoutId = window.setTimeout(() => applySearch(query), 300);
}

function syncFilterLabels() {
  if (priceRangeFilter && priceRangeLabel) {
    priceRangeLabel.textContent = `Up to ${priceRangeFilter.value}dh`;
  }
}

function locateUser() {
  if (!navigator.geolocation) {
    locationButton.textContent = "Location unavailable";
    return;
  }

  locationButton.textContent = "Locating...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userPosition = [position.coords.latitude, position.coords.longitude];
      if (userLocationMarker) {
        userLocationMarker.setLatLng(userPosition);
      } else {
        userLocationMarker = L.circleMarker(userPosition, {
          radius: 9,
          color: "#2f8f6b",
          fillColor: "#2f8f6b",
          fillOpacity: 0.85,
          weight: 3
        })
          .addTo(map)
          .bindPopup("You are here");
      }

      map.flyTo(userPosition, FOCUSED_ZOOM, { duration: 0.7 });
      userLocationMarker.openPopup();
      locationButton.textContent = "Use my location";
    },
    () => {
      locationButton.textContent = "Location blocked";
      window.setTimeout(() => {
        locationButton.textContent = "Use my location";
      }, 2200);
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

function getBestOffer(productId) {
  return filteredSellers
    .flatMap((marketSeller) => marketSeller.products.map((item) => ({ ...item, seller: marketSeller.name })))
    .filter((item) => item.id === productId)
    .sort((a, b) => a.price - b.price)[0];
}

function getProductListings(sourceSellers = filteredSellers) {
  const selectedFilter = productFilter?.value || "all";
  const maxPrice = Number(priceRangeFilter?.value || 110);
  return sourceSellers
    .flatMap((marketSeller) =>
      marketSeller.products
        .filter((item) => selectedFilter === "all" || item.id === selectedFilter)
        .filter((item) => item.price <= maxPrice)
        .map((item) => ({
          ...item,
          seller: marketSeller.name,
          sellerId: marketSeller.id,
          location: marketSeller.location
        }))
    )
    .sort((a, b) => a.price - b.price);
}

function getAllProductListings(sourceSellers = sellers) {
  return sourceSellers
    .flatMap((marketSeller) =>
      marketSeller.products.map((item) => ({
        ...item,
        seller: marketSeller.name,
        sellerId: marketSeller.id,
        location: marketSeller.location
      }))
    )
    .sort((a, b) => a.price - b.price);
}

function getProductRangeLabel(productId, sourceSellers = filteredSellers) {
  const range = getPriceRange(productId, sourceSellers);
  return range ? `${range.min}dh - ${range.max}dh` : "No range";
}

function isBestDeal(listing, sourceSellers = filteredSellers) {
  const bestPrice = getBestPriceForProduct(listing.id, sourceSellers);
  return bestPrice !== null && listing.price === bestPrice;
}

function getBestPriceForProduct(productId, sourceSellers = filteredSellers) {
  const productListings = getProductListings(sourceSellers).filter((item) => item.id === productId);
  if (!productListings.length) {
    return null;
  }

  return Math.min(...productListings.map((item) => item.price));
}

function createProductCard(listing, sourceSellers = filteredSellers) {
  const meatProduct = productById.get(listing.id);
  const bestPrice = getBestPriceForProduct(listing.id, sourceSellers);
  const bestDeal = isBestDeal(listing, sourceSellers);
  
  const sellerObj = sellers.find(s => s.id === listing.sellerId);
  const distance = sellerObj ? getDistanceKm(sellerObj.lat, sellerObj.lng) : 0;
  
  return `
    <article class="product-card meat-search-card ${bestDeal ? "best-deal-card" : ""}" data-product-id="${meatProduct.id}" data-seller-id="${listing.sellerId}">
      <div class="product-image-wrap">
        <img class="product-image" src="${listing.image || meatProduct.image}" alt="${escapeHtml(meatProduct.label)}" loading="lazy" />
        ${bestDeal ? `<span class="deal-badge">Best deal</span>` : ""}
      </div>
      <div class="product-content">
        <p class="product-category">${escapeHtml(meatProduct.local)}</p>
        <h3>${escapeHtml(meatProduct.label)}</h3>
        <p>${escapeHtml(listing.location)} seller with live local pricing.</p>
        <div class="product-meta">
          <span class="product-price">${formatPrice(listing)}</span>
          <div class="seller-details-meta" style="text-align: right;">
            <div class="seller-name">${escapeHtml(listing.seller)}</div>
            <div class="seller-distance" style="font-size: 0.78rem; color: var(--muted); font-weight: 800; margin-top: 2px;">${distance.toFixed(1)} km away</div>
          </div>
        </div>
        <div class="price-range-row">
          <span>Price range</span>
          <strong>${getProductRangeLabel(listing.id, sourceSellers)}</strong>
        </div>
        <div class="best-price-row">
          Best price near you: <strong>${bestPrice ?? "--"}dh</strong>
        </div>
        <div class="product-actions-row">
          <button class="add-cart-button" type="button" data-action="add-cart">Add to cart</button>
          <button class="view-seller-button" type="button" data-action="view-seller">View seller</button>
        </div>
        ${currentRole === "seller" ? `
          <label class="price-filter-field seller-only">
            <span>Update/search price (dh/kg)</span>
            <input type="number" min="0" step="1" placeholder="Example: ${listing.price}" aria-label="Enter target price for ${escapeHtml(meatProduct.label)}" />
          </label>
          <button class="card-search-button seller-only" type="button" disabled>Search</button>
        ` : ""}
      </div>
    </article>
  `;
}

function addListingToCart(card) {
  const productId = card.dataset.productId;
  const sellerId = card.dataset.sellerId;
  const seller = findSellerById(sellerId);
  const product = seller?.products.find((item) => item.id === productId) || seller?.products[0];
  if (!seller || !product) {
    return;
  }

  const cartItems = getCartItems();
  const existingItem = cartItems.find((item) => item.productId === productId && item.sellerId === sellerId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      productId,
      sellerId,
      name: product.name || product.title || productId,
      sellerName: seller.name,
      location: seller.location,
      image: product.image,
      price: product.price,
      unit: product.unit || "kg",
      quantity: 1
    });
  }

  saveCartItems(cartItems);
  const button = card.querySelector('[data-action="add-cart"]');
  if (button) {
    button.textContent = "Added";
    window.setTimeout(() => {
      button.textContent = "Add to cart";
    }, 1200);
  }
}

function renderFeaturedProducts(sourceSellers = filteredSellers) {
  if (!featuredProductsGrid) {
    return;
  }

  renderProductSkeletons();
  window.setTimeout(() => renderProductListings(sourceSellers), 180);
}

function renderProductSkeletons() {
  featuredProductsGrid.classList.add("is-loading");
  featuredProductsGrid.innerHTML = Array.from({ length: 6 }, () => `
    <article class="product-card skeleton-card" aria-hidden="true">
      <div class="skeleton-image"></div>
      <div class="product-content">
        <span class="skeleton-line short"></span>
        <span class="skeleton-line title"></span>
        <span class="skeleton-line"></span>
        <span class="skeleton-line"></span>
      </div>
    </article>
  `).join("");
}

function renderProductListings(sourceSellers = filteredSellers) {
  let listings = getProductListings(sourceSellers);
  let displaySellers = sourceSellers;
  if (!listings.length) {
    displaySellers = sellers;
    listings = getProductListings(displaySellers);
  }
  if (!listings.length) {
    listings = getAllProductListings(sellers);
    displaySellers = sellers;
  }
  featuredProductsGrid.classList.remove("is-loading");
  if (productResultCount) {
    productResultCount.textContent = `${Math.max(listings.length, 1)} live listing${listings.length === 1 ? "" : "s"}`;
  }

  featuredProductsGrid.innerHTML = listings.map((listing) => createProductCard(listing, displaySellers)).join("");
}

function updateBestPriceHighlight(sourceSellers = filteredSellers) {
  if (!bestPriceHighlight) {
    return;
  }

  const selectedFilter = productFilter?.value || "all";
  const productId = selectedProductId || (selectedFilter !== "all" ? selectedFilter : "beef");
  const productDefinition = productById.get(productId) || productById.get("beef");
  const offers = sourceSellers
    .flatMap((marketSeller) =>
      marketSeller.products
        .filter((item) => item.id === productDefinition.id)
        .map((item) => ({
          ...item,
          seller: marketSeller.name,
          distance: getDistanceKm(marketSeller.lat, marketSeller.lng)
        }))
    )
    .sort((a, b) => a.price - b.price);

  const bestOffer = offers[0] || sellers
    .flatMap((marketSeller) =>
      marketSeller.products
        .filter((item) => item.id === productDefinition.id)
        .map((item) => ({
          ...item,
          seller: marketSeller.name,
          distance: getDistanceKm(marketSeller.lat, marketSeller.lng)
        }))
    )
    .sort((a, b) => a.price - b.price)[0];

  bestPriceHighlight.textContent = bestOffer
    ? `Best ${productDefinition.label.toLowerCase()} price today: ${bestOffer.price}dh/kg (${bestOffer.distance.toFixed(1)}km away)`
    : "Best price near you: live offers available";
}

function runCardSearch(card) {
  const input = card.querySelector("input");
  const productId = card.dataset.productId;
  const product = productById.get(productId);
  const price = Number(input.value);
  if (!Number.isFinite(price) || price <= 0) {
    return;
  }

  mapSearchInput.value = `${product.label} ${price}`;
  globalSearchInput.value = mapSearchInput.value;
  queueSearch(mapSearchInput.value);
  document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
}

mapSearch.addEventListener("submit", (event) => {
  event.preventDefault();
  queueSearch(mapSearchInput.value);
});

globalSearch.addEventListener("submit", (event) => {
  event.preventDefault();
  mapSearchInput.value = globalSearchInput.value;
  queueSearch(globalSearchInput.value);
});

mapSearchInput.addEventListener("input", (event) => queueSearch(event.target.value));
globalSearchInput.addEventListener("input", (event) => {
  mapSearchInput.value = event.target.value;
  queueSearch(event.target.value);
});

if (featuredProductsGrid) {
  featuredProductsGrid.addEventListener("input", (event) => {
    if (event.target.matches(".price-filter-field input")) {
      const card = event.target.closest(".meat-search-card");
      const button = card.querySelector(".card-search-button");
      button.disabled = !event.target.value || Number(event.target.value) <= 0;
    }
  });

  featuredProductsGrid.addEventListener("click", (event) => {
    if (event.target.closest("button") || event.target.closest("input") || event.target.closest("select")) {
      if (event.target.matches(".card-search-button")) {
        runCardSearch(event.target.closest(".meat-search-card"));
      }
      if (event.target.matches('[data-action="add-cart"]')) {
        addListingToCart(event.target.closest(".meat-search-card"));
      }
      if (event.target.matches('[data-action="view-seller"]')) {
        openSellerProfile(event.target.closest(".meat-search-card").dataset.sellerId);
      }
      return;
    }
    
    // Clicking anywhere on the deal card triggers centering the map on that seller's marker
    const card = event.target.closest(".product-card");
    const sellerId = card?.dataset.sellerId;
    if (sellerId) {
      // Highlight card active state manually
      document.querySelectorAll(".product-card").forEach((c) => c.classList.remove("active-highlight"));
      card.classList.add("active-highlight");
      
      // Focus seller on Leaflet map (center & zoom) and open details
      openMapSidePanel(sellerId);
    }
  });

  featuredProductsGrid.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.matches(".price-filter-field input")) {
      event.preventDefault();
      runCardSearch(event.target.closest(".meat-search-card"));
    }
  });
}

locationButton.addEventListener("click", locateUser);
mapPanelClose?.addEventListener("click", closeMapSidePanel);
listViewButton?.addEventListener("click", () => setMarketplaceView("list"));
mapViewButton?.addEventListener("click", () => setMarketplaceView("map"));

// City filter dropdown implementation
const cityFilter = document.getElementById("cityFilter");
cityFilter?.addEventListener("change", () => {
  const selectedCity = cityFilter.value;
  if (selectedCity !== "all" && CITIES[selectedCity]) {
    activeCityCenter = CITIES[selectedCity].center;
    if (map) {
      // Smoothly fly map to new city coordinates
      map.flyTo(activeCityCenter, DEFAULT_ZOOM, { duration: 0.85 });
    }
  } else {
    // Default to Rabat
    activeCityCenter = CITIES.rabat.center;
    if (map) {
      map.flyTo(activeCityCenter, DEFAULT_ZOOM, { duration: 0.85 });
    }
  }
  
  // Re-filter and sort list
  applySearch(lastSearchQuery);
});

// Mobile floating/smooth scroll button implementation
const viewDealsMobileBtn = document.getElementById("viewDealsMobileBtn");
viewDealsMobileBtn?.addEventListener("click", () => {
  const dealsSection = document.querySelector(".products-column");
  if (dealsSection) {
    dealsSection.scrollIntoView({ behavior: "smooth" });
  }
});

[productFilter, distanceFilter].forEach((control) => {
  control?.addEventListener("change", () => {
    syncFilterLabels();
    applySearch(lastSearchQuery);
  });
});

priceRangeFilter?.addEventListener("input", () => {
  syncFilterLabels();
  applySearch(lastSearchQuery);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSellerPanel();
  }
});

initMap();
updateRoleUI();
syncFilterLabels();
updateCartBadge();
renderFeaturedProducts(filteredSellers);
updateBestPriceHighlight(filteredSellers);

window.addEventListener("load", () => {
  map.invalidateSize();
});
