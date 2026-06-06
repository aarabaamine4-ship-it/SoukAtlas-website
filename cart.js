const CART_STORAGE_KEY = "souk-atlas-cart";
const STANDARD_DELIVERY_FEE = 0;
const EXPRESS_DELIVERY_FEE = 20;

const cartItemsList = document.getElementById("cartItemsList");
const cartItemsCount = document.getElementById("cartItemsCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartDeliveryFee = document.getElementById("cartDeliveryFee");
const cartTotal = document.getElementById("cartTotal");
const deliveryEstimate = document.getElementById("deliveryEstimate");
const deliveryForm = document.getElementById("deliveryForm");
const checkoutMessage = document.getElementById("checkoutMessage");
const cartItemTemplate = document.getElementById("cartItemTemplate");

let cartItems = loadCart();

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(savedCart) ? savedCart : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

function formatMoney(value) {
  return `${Math.round(value)}dh`;
}

function getSelectedDeliveryFee() {
  const selected = document.querySelector('input[name="deliveryOption"]:checked')?.value;
  return selected === "express" ? EXPRESS_DELIVERY_FEE : STANDARD_DELIVERY_FEE;
}

function renderCart() {
  cartItemsList.replaceChildren();

  if (!cartItems.length) {
    cartItemsList.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is waiting for fresh deals</h3>
        <p>Go back to the marketplace and add beef, chicken, turkey, lamb, or sardines from nearby sellers.</p>
        <a href="index.html">Browse products</a>
      </div>
    `;
  } else {
    cartItems.forEach((item) => {
      const fragment = cartItemTemplate.content.cloneNode(true);
      const row = fragment.querySelector(".cart-item");
      const image = fragment.querySelector(".cart-item-image");
      const title = fragment.querySelector("h3");
      const meta = fragment.querySelector("p");
      const price = fragment.querySelector(".cart-item-copy strong");
      const quantity = fragment.querySelector(".quantity-control span");

      row.dataset.productId = item.productId;
      row.dataset.sellerId = item.sellerId;
      image.src = item.image;
      image.alt = item.name;
      title.textContent = item.name;
      meta.textContent = `${item.sellerName} - ${item.location || "Nearby seller"}`;
      price.textContent = `${item.price}dh/${item.unit || "kg"}`;
      quantity.textContent = String(item.quantity);
      cartItemsList.appendChild(fragment);
    });
  }

  updateSummary();
}

function updateSummary() {
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const deliveryFee = cartItems.length ? getSelectedDeliveryFee() : 0;
  const total = subtotal + deliveryFee;
  const quantity = cartItems.reduce((sum, item) => sum + Number(item.quantity), 0);

  cartItemsCount.textContent = `${quantity} item${quantity === 1 ? "" : "s"}`;
  cartSubtotal.textContent = formatMoney(subtotal);
  cartDeliveryFee.textContent = deliveryFee ? formatMoney(deliveryFee) : "Free";
  cartTotal.textContent = formatMoney(total);
  deliveryEstimate.textContent = deliveryFee ? "Estimated delivery: 20-30 min" : "Estimated delivery: 45-60 min";
}

function updateQuantity(productId, sellerId, delta) {
  cartItems = cartItems
    .map((item) =>
      item.productId === productId && item.sellerId === sellerId
        ? { ...item, quantity: Math.max(1, Number(item.quantity) + delta) }
        : item
    );
  saveCart();
  renderCart();
}

function removeItem(productId, sellerId) {
  cartItems = cartItems.filter((item) => item.productId !== productId || item.sellerId !== sellerId);
  saveCart();
  renderCart();
}

cartItemsList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const row = button.closest(".cart-item");
  const { productId, sellerId } = row.dataset;

  if (button.dataset.action === "increase") {
    updateQuantity(productId, sellerId, 1);
  }
  if (button.dataset.action === "decrease") {
    updateQuantity(productId, sellerId, -1);
  }
  if (button.dataset.action === "remove") {
    removeItem(productId, sellerId);
  }
});

document.querySelectorAll('input[name="deliveryOption"]').forEach((input) => {
  input.addEventListener("change", updateSummary);
});

deliveryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!cartItems.length) {
    checkoutMessage.textContent = "Add at least one product before placing an order.";
    checkoutMessage.className = "checkout-message error";
    return;
  }

  if (!deliveryForm.checkValidity()) {
    deliveryForm.reportValidity();
    return;
  }

  checkoutMessage.textContent = "Order placed successfully. Sellers will contact you shortly.";
  checkoutMessage.className = "checkout-message success";
  cartItems = [];
  saveCart();
  renderCart();
  deliveryForm.reset();
});

renderCart();
