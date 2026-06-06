const SELLER_STORAGE_KEY = "souk-atlas-published-sellers";
const SELECTED_SELLER_KEY = "souk-atlas-selected-seller";
const MAX_PRODUCT_IMAGES = 8;

const defaultProductImages = {
  beef: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=640&q=82",
  lamb: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?auto=format&fit=crop&w=640&q=82",
  chicken: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=640&q=82",
  turkey: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?auto=format&fit=crop&w=640&q=82",
  sardines: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=640&q=82"
};

const meatProducts = {
  beef: { label: "Beef", local: "lham ba9ar", short: "Beef" },
  lamb: { label: "Lamb", local: "lham ghanam", short: "Lamb" },
  chicken: { label: "Chicken", local: "djaj", short: "Chicken" },
  turkey: { label: "Turkey", local: "dinde", short: "Turkey" },
  sardines: { label: "Sardines", local: "srdine", short: "Sard" }
};

const demoCities = {
  rabat: { name: "Rabat", center: [34.020882, -6.84165] },
  casablanca: { name: "Casablanca", center: [33.5731, -7.5898] },
  sale: { name: "Sale", center: [34.0331, -6.7985] },
  temara: { name: "Temara", center: [33.9267, -6.9122] },
  marrakech: { name: "Marrakech", center: [31.6295, -7.9811] },
  fes: { name: "Fes", center: [34.0181, -5.0078] },
  tangier: { name: "Tangier", center: [35.7595, -5.834] }
};

const locationCoordinates = {
  "rabat medina": [34.0234, -6.8347],
  hassan: [34.0201, -6.8221],
  agdal: [34.0028, -6.8494],
  akkari: [34.0265, -6.8586],
  ocean: [34.0289, -6.8466],
  souissi: [33.9811, -6.8503],
  "hay riad": [33.9539, -6.8694],
  sale: [34.0411, -6.7963],
  temara: [33.9287, -6.9065],
  rabat: [34.020882, -6.84165]
};

const productImagesInput = document.getElementById("productImagesInput");
const productPreviewGrid = document.getElementById("productPreviewGrid");
const profileImageInput = document.getElementById("profileImageInput");
const profilePreview = document.getElementById("profilePreview");
const profileInitials = document.getElementById("profileInitials");
const listingForm = document.getElementById("listingForm");
const titleInput = document.getElementById("titleInput");
const priceInput = document.getElementById("priceInput");
const categoryInput = document.getElementById("categoryInput");
const sellerNameInput = document.getElementById("sellerNameInput");
const phoneInput = document.getElementById("phoneInput");
const locationInput = document.getElementById("locationInput");
const publishButton = document.getElementById("publishButton");
const draftButton = document.getElementById("draftButton");
const progressBar = document.getElementById("progressBar");
const photosProgress = document.getElementById("photosProgress");
const createListingPage = document.getElementById("createListingPage");
const sellerProfilePage = document.getElementById("sellerProfilePage");
const profilePageAvatar = document.getElementById("profilePageAvatar");
const profilePageName = document.getElementById("profilePageName");
const profilePageProduct = document.getElementById("profilePageProduct");
const profilePagePrice = document.getElementById("profilePagePrice");
const bestPriceBadge = document.getElementById("bestPriceBadge");
const phoneLink = document.getElementById("phoneLink");
const whatsappLink = document.getElementById("whatsappLink");
const profileLocation = document.getElementById("profileLocation");
const sellerGallery = document.getElementById("sellerGallery");
const galleryLightbox = document.getElementById("galleryLightbox");
const closeLightbox = document.getElementById("closeLightbox");
const lightboxImage = document.getElementById("lightboxImage");

let productImages = [];
let profileImage = "";

const sellerIdFromUrl = new URLSearchParams(window.location.search).get("id");

if (sellerIdFromUrl && sellerProfilePage) {
  renderSellerProfile(sellerIdFromUrl);
} else if (createListingPage) {
  initListingForm();
} else if (sellerProfilePage) {
  renderSellerProfile("");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function getInitials(name) {
  return (name || "SA")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function getCoordinates(location) {
  const normalizedLocation = location.trim().toLowerCase();
  const directMatch = locationCoordinates[normalizedLocation];
  if (directMatch) {
    return directMatch;
  }

  const partialMatch = Object.entries(locationCoordinates).find(([key]) => normalizedLocation.includes(key) || key.includes(normalizedLocation));
  if (partialMatch) {
    return partialMatch[1];
  }

  return [
    34.020882 + (Math.random() - 0.5) * 0.025,
    -6.84165 + (Math.random() - 0.5) * 0.025
  ];
}

function renderProductPreviews() {
  productPreviewGrid.innerHTML = productImages
    .map(
      (image, index) => `
        <div class="preview-item">
          <img src="${image}" alt="Product preview ${index + 1}" />
          <button class="remove-image" type="button" data-index="${index}" aria-label="Remove image">&times;</button>
        </div>
      `
    )
    .join("");
  updateProgress();
  validateForm();
}

function updateProgress() {
  const checks = [
    productImages.length > 0,
    titleInput.value.trim() && Number(priceInput.value) > 0 && categoryInput.value,
    sellerNameInput.value.trim() && phoneInput.value.trim() && locationInput.value.trim() && profileImage
  ];
  const percent = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  progressBar.style.width = `${percent}%`;
  photosProgress.textContent = `${percent}%`;
}

function validateForm() {
  const isValid =
    productImages.length > 0 &&
    titleInput.value.trim() &&
    Number(priceInput.value) > 0 &&
    categoryInput.value &&
    sellerNameInput.value.trim() &&
    phoneInput.value.trim() &&
    locationInput.value.trim() &&
    profileImage;

  publishButton.disabled = !isValid;
}

function getSavedListings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SELLER_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function demoProduct(productId, price) {
  const product = meatProducts[productId] || meatProducts.beef;
  return {
    id: productId,
    name: product.label,
    title: product.label,
    local: product.local,
    short: product.short,
    price,
    unit: "kg",
    image: defaultProductImages[productId] || defaultProductImages.beef
  };
}

function demoSeller(id, name, location, lat, lng, productRows) {
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
    products: productRows.map(([productId, price]) => demoProduct(productId, price)),
    productImages: productRows.map(([productId]) => defaultProductImages[productId] || defaultProductImages.beef)
  };
}

function generateDemoSellers() {
  const shopNouns = ["Boucherie", "Atlas Cuts", "Prime Meats", "Halal Souk", "Chez L'Haj", "Fresh Cuts", "Red Meat House", "Atlas Butchery", "Al Medina Meats", "Fine Halal", "Souk Atlas Halal", "Al Boustane", "Nour Halal Meats", "Wafaa Butchery"];
  const firstNames = ["Hassan", "Ahmed", "Mohamed", "Youssef", "Karim", "Omar", "Brahim", "Mustapha", "Rachid", "Khalid", "Anas", "Hamza", "Amine", "Bilal", "Yassine"];
  const locations = {
    rabat: ["Medina", "Agdal", "Hassan", "Les Orangers", "Souissi", "Akkari"],
    casablanca: ["Anfa", "Maarif", "Gauthier", "Ain Diab", "Sidi Bernoussi", "Oasis"],
    sale: ["Tabriquet", "Bettana", "Sidi Moussa", "Sala Al Jadida", "Medina"],
    temara: ["Wifaq", "Harhoura", "Massira", "Center", "Sadate"],
    marrakech: ["Gueliz", "Medina", "Hivernage", "Daoudiate", "Chrifia"],
    fes: ["Narjiss", "Atlas", "Medina", "Route d'Imouzzer", "Batha"],
    tangier: ["Malabata", "Marshane", "Brance", "Medina", "Boukhalef"]
  };
  const generated = [];
  let idCounter = 1;

  Object.entries(demoCities).forEach(([cityId, cityData]) => {
    for (let i = 0; i < 4; i += 1) {
      const firstName = firstNames[(Math.floor(Math.sin(idCounter) * 10000) & 0xffff) % firstNames.length];
      const shopNoun = shopNouns[(Math.floor(Math.cos(idCounter) * 10000) & 0xffff) % shopNouns.length];
      const lat = cityData.center[0] + Math.sin(idCounter * 12.3) * 0.015;
      const lng = cityData.center[1] + Math.cos(idCounter * 7.8) * 0.015;
      const cityLocs = locations[cityId] || ["Medina"];
      const locationName = `${cityLocs[(Math.floor(Math.sin(idCounter * 3) * 1000) & 0xff) % cityLocs.length]}, ${cityData.name}`;
      const productRows = [];

      ["beef", "chicken", "lamb", "turkey", "sardines"].forEach((productId, index) => {
        const shouldInclude = ((Math.abs(Math.sin(idCounter * (index + 1) * 5.5)) * 10) % 1) > 0.25 || index === 0;
        if (shouldInclude) {
          productRows.push([productId, Math.floor(Math.abs(Math.cos(idCounter * (index + 2) * 9.1)) * 41 + 70)]);
        }
      });

      generated.push(demoSeller(`generated-${cityId}-${idCounter}`, `${shopNoun} ${firstName}`, locationName, lat, lng, productRows));
      idCounter += 1;
    }
  });

  return generated;
}

function getSelectedSeller() {
  try {
    return JSON.parse(localStorage.getItem(SELECTED_SELLER_KEY) || "null");
  } catch {
    return null;
  }
}

function findSellerForProfile(sellerId) {
  const selectedSeller = getSelectedSeller();
  if (selectedSeller?.id === sellerId) {
    return selectedSeller;
  }

  const publishedSeller = getSavedListings().find((listing) => listing.id === sellerId);
  if (publishedSeller) {
    return publishedSeller;
  }

  return generateDemoSellers().find((seller) => seller.id === sellerId) || generateDemoSellers()[0];
}

function getPrimaryProduct(seller) {
  return seller.products?.[0] || {
    id: "beef",
    name: "Beef",
    title: "Beef",
    price: 0,
    unit: "kg",
    image: defaultProductImages.beef
  };
}

function renderAvatar(target, seller) {
  if (seller.profileImage) {
    target.innerHTML = `<img src="${seller.profileImage}" alt="${seller.name}" />`;
    return;
  }

  target.textContent = getInitials(seller.name);
}

function renderSellerProfile(sellerId) {
  const seller = findSellerForProfile(sellerId);
  if (createListingPage) {
    createListingPage.hidden = true;
  }
  sellerProfilePage.hidden = false;

  const product = getPrimaryProduct(seller);
  const productName = product.title || product.name || product.id;
  const productImage = product.image || defaultProductImages[product.id] || defaultProductImages.beef;
  const galleryImages = seller.productImages?.length ? seller.productImages : [productImage];
  const cleanPhone = String(seller.phone || "").replace(/[^\d+]/g, "");

  renderAvatar(profilePageAvatar, seller);
  profilePageName.textContent = seller.name;
  profilePageProduct.textContent = productName;
  profilePagePrice.textContent = `${product.price}dh/${product.unit || "kg"}`;
  bestPriceBadge.hidden = !seller.isBestPrice;
  phoneLink.textContent = seller.phone || "Phone not added";
  phoneLink.href = cleanPhone ? `tel:${cleanPhone}` : "#";
  whatsappLink.href = cleanPhone ? `https://wa.me/${cleanPhone.replace(/^\+/, "")}` : "#";
  profileLocation.textContent = seller.location || "Seller location";
  sellerGallery.innerHTML = galleryImages
    .map((image, index) => `<button type="button" data-image="${image}" aria-label="Open product image ${index + 1}"><img src="${image}" alt="${productName}" loading="lazy" /></button>`)
    .join("");

  renderSellerMiniMap(seller);
}

function renderSellerMiniMap(seller) {
  if (!window.L) {
    return;
  }

  const map = L.map("sellerMiniMap", {
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false
  }).setView([seller.lat, seller.lng], 15);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    subdomains: "abcd",
    attribution: ""
  }).addTo(map);

  L.circleMarker([seller.lat, seller.lng], {
    radius: 9,
    color: "#7a1f1f",
    fillColor: "#b03a3a",
    fillOpacity: 0.9,
    weight: 3
  }).addTo(map);
}

function saveListing(status) {
  const [lat, lng] = getCoordinates(locationInput.value);
  const listing = {
    id: `seller-${Date.now()}`,
    name: sellerNameInput.value.trim(),
    phone: phoneInput.value.trim(),
    location: locationInput.value.trim(),
    lat,
    lng,
    profileImage,
    productImages,
    status,
    products: [
      {
        id: categoryInput.value,
        title: titleInput.value.trim(),
        price: Number(priceInput.value),
        unit: "kg",
        image: productImages[0]
      }
    ]
  };

  const listings = getSavedListings();
  localStorage.setItem(SELLER_STORAGE_KEY, JSON.stringify([listing, ...listings]));
  return listing;
}

function initListingForm() {
productImagesInput.addEventListener("change", async (event) => {
  const files = [...event.target.files].slice(0, MAX_PRODUCT_IMAGES - productImages.length);
  const images = await Promise.all(files.map(readFileAsDataUrl));
  productImages = [...productImages, ...images].slice(0, MAX_PRODUCT_IMAGES);
  productImagesInput.value = "";
  renderProductPreviews();
});

productPreviewGrid.addEventListener("click", (event) => {
  if (event.target.matches(".remove-image")) {
    productImages = productImages.filter((_, index) => index !== Number(event.target.dataset.index));
    renderProductPreviews();
  }
});

profileImageInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  profileImage = await readFileAsDataUrl(file);
  profilePreview.src = profileImage;
  profilePreview.hidden = false;
  profileInitials.hidden = true;
  updateProgress();
  validateForm();
});

sellerNameInput.addEventListener("input", () => {
  profileInitials.textContent = getInitials(sellerNameInput.value);
});

listingForm.addEventListener("input", () => {
  updateProgress();
  validateForm();
});

draftButton.addEventListener("click", () => {
  saveListing("draft");
  draftButton.textContent = "Draft Saved";
  window.setTimeout(() => {
    draftButton.textContent = "Save Draft";
  }, 1600);
});

listingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (publishButton.disabled) {
    return;
  }

  saveListing("published");
  publishButton.textContent = "Published";
  window.setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
});

updateProgress();
validateForm();
}

sellerGallery?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-image]");
  if (!button) {
    return;
  }

  lightboxImage.src = button.dataset.image;
  galleryLightbox.hidden = false;
});

closeLightbox?.addEventListener("click", () => {
  galleryLightbox.hidden = true;
  lightboxImage.src = "";
});
