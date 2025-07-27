let cart = JSON.parse(localStorage.getItem("cart")) || [];
document.getElementById("cart-count").textContent = cart.reduce((sum, p) => sum + p.qty, 0);

let pendingBuyNowProduct = null;
let isFullCartCheckout = false;

document.addEventListener("DOMContentLoaded", () => {
  // Redirect product image/title to individual product page
  document.querySelectorAll(".product-card .image-wrapper, .product-card p").forEach((el) => {
    el.addEventListener("click", () => {
      const card = el.closest(".product-card");
      if (card && card.dataset.id) {
        window.location.href = `${card.dataset.id}.html`;
      }
    });
  });

  // Bind Add to Cart buttons
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

// ➕ Add to cart
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

// 🛒 Render Cart
function renderCart() {
  const container = document.querySelector(".cart-items");
  const totalElem = document.getElementById("cart-total");
  const countElem = document.getElementById("cart-count");

  if (!container || !totalElem || !countElem) return;

  container.innerHTML = "";
  let total = 0;
  let count = 0;

  cart.forEach((item, index) => {
    const subtotal = item.qty * item.price;
    total += subtotal;
    count += item.qty;

    container.innerHTML += `
      <div class="item">
        <strong>${item.name}</strong><br>
        ₹${item.price} × ${item.qty} = ₹${subtotal}<br>
        <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });

  totalElem.textContent = total;
  countElem.textContent = count;
}

// ❌ Remove item from cart
window.removeItem = function (index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};

// 📦 Prepare checkout for full cart
window.prepareCartCheckout = function () {
  if (cart.length === 0) return alert("Your cart is empty.");
  isFullCartCheckout = true;
  pendingBuyNowProduct = null;
  toggleShippingForm();
};

// 🧾 Toggle Cart Drawer
window.toggleCart = function () {
  const drawer = document.getElementById("cart-drawer");
  if (drawer) drawer.classList.toggle("hidden");
};

// 🧾 Toggle Shipping Form
function toggleShippingForm() {
  const form = document.getElementById("shipping-form");
  if (form) form.classList.toggle("hidden");
}

// 🚚 Final Submit Shipping → Razorpay
function submitShippingDetails() {
  const name = document.getElementById("ship-name").value;
  const email = document.getElementById("ship-email").value;
  const phone = document.getElementById("ship-phone").value;
  const address = document.getElementById("ship-address").value;
  const state = document.getElementById("ship-state").value;
  const country = document.getElementById("ship-country").value;
  const pincode = document.getElementById("ship-pincode").value;

  if (!name || !email || !phone || !address || !state || !country || !pincode) {
    alert("Please fill in all fields.");
    return;
  }

  toggleShippingForm();

  const customerNotes = `${address}, ${state}, ${country} - ${pincode}`;
  const amount = isFullCartCheckout
    ? cart.reduce((sum, p) => sum + p.price * p.qty, 0)
    : pendingBuyNowProduct?.price || 0;

  if (amount === 0) {
    alert("Something went wrong. Amount is 0.");
    return;
  }

  const options = {
    key: "rzp_live_wEC5gALdAnUWbA",
    amount: amount * 100,
    currency: "INR",
    name: "Yamaki Foods",
    description: isFullCartCheckout ? "Full Cart Checkout" : pendingBuyNowProduct.name,
    image: "https://yamakifoods.com/images/favicon.jpg",
    handler: function (response) {
      alert(`Payment successful! Razorpay ID: ${response.razorpay_payment_id}`);
      if (isFullCartCheckout) {
        cart = [];
        localStorage.removeItem("cart");
        renderCart();
        toggleCart();
      }
    },
    prefill: {
      name: name,
      email: email,
      contact: phone
    },
    notes: {
      address: customerNotes
    },
    theme: {
      color: "#2e7d32"
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();

  // Reset
  isFullCartCheckout = false;
  pendingBuyNowProduct = null;
}

// 🟢 Expose to HTML
window.submitShippingDetails = submitShippingDetails;
window.toggleShippingForm = toggleShippingForm;
