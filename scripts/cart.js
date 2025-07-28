let cart = JSON.parse(localStorage.getItem("cart")) || [];
document.getElementById("cart-count").textContent = cart.reduce((sum, p) => sum + p.qty, 0);

let pendingBuyNowProduct = null;
let isFullCartCheckout = false;

document.addEventListener("DOMContentLoaded", () => {
  // 🔗 Clickable product image/name → redirect to individual product page
  document.querySelectorAll(".product-card .image-wrapper, .product-card p").forEach((el) => {
    el.addEventListener("click", () => {
      const card = el.closest(".product-card");
      if (card && card.dataset.id) {
        window.location.href = `${card.dataset.id}.html`;
      }
    });
  });

  // 🛒 Add to cart button
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const product = getProductFromCard(card);
      addToCart(product);
    });
  });

  renderCart();
});

// 🔍 Get product data from card
function getProductFromCard(card) {
  const qtyInput = card.querySelector(".quantity-input");
  const qty = parseInt(qtyInput?.value || "1");
  return {
    id: card.dataset.id,
    name: card.dataset.name,
    price: parseInt(card.dataset.price),
    img: card.dataset.img,
    qty: qty
  };
}

// ➕ Add item to cart
function addToCart(item) {
  const existing = cart.find((p) => p.id === item.id);
  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push(item);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  alert(`${item.name} added to cart!`);
}

// 🛒 Render Cart UI
function renderCart() {
  const container = document.querySelector(".cart-items");
  const totalElem = document.getElementById("cart-total");
  const countElem = document.getElementById("cart-count");

  if (!container || !totalElem || !countElem) return;

  container.innerHTML = "";
  let total = 0, count = 0;

  cart.forEach((item, index) => {
    const subtotal = item.qty * item.price;
    total += subtotal;
    count += item.qty;
    container.innerHTML += `
      <div class="item">
        <strong>${item.name}</strong><br>
        ₹${item.price} × ${item.qty} = ₹${subtotal}<br>
        <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
      </div>`;
  });

  totalElem.textContent = total;
  countElem.textContent = count;
}

// ❌ Remove item
window.removeItem = function (index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};

// 🛍️ Full cart checkout
window.prepareCartCheckout = function () {
  if (cart.length === 0) return alert("Your cart is empty.");
  isFullCartCheckout = true;
  pendingBuyNowProduct = null;
  toggleShippingForm();
};

// 🛒 Buy Now checkout from product page
window.prepareBuyNowCheckout = function () {
  const qtyInput = document.querySelector(".quantity-input, #product-qty");
  const qty = parseInt(qtyInput?.value || "1");

  pendingBuyNowProduct = {
    id: "konjac-rice",
    name: "Konjac Rice",
    price: 199,
    img: "images/konjac-rice-1.jpg",
    qty: qty
  };

  isFullCartCheckout = false;
  toggleShippingForm();
};

// 🧾 Toggle cart drawer
window.toggleCart = function () {
  const drawer = document.getElementById("cart-drawer");
  if (drawer) drawer.classList.toggle("hidden");
};

// 🚚 Show/hide shipping form
function toggleShippingForm() {
  const form = document.getElementById("shipping-form");
  if (form) form.classList.toggle("hidden");
}
// 🔓 Expose to HTML
window.toggleShippingForm = toggleShippingForm;
// ✅ Minimal bridge to trigger form submission
window.submitShippingDetails = function () {
  const form = document.getElementById("shipping-form-element");
  if (form) form.requestSubmit(); // triggers form submission, handled by handleFormSubmit
};
