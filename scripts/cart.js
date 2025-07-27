let cart = JSON.parse(localStorage.getItem("cart")) || [];
document.getElementById("cart-count").textContent = cart.reduce((sum, p) => sum + p.qty, 0);
let pendingBuyNowProduct = null;

document.addEventListener("DOMContentLoaded", () => {
  // Bind Add to Cart buttons
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const product = getProductFromCard(card);
      addToCart(product);
    });
  });

  // Bind Buy Now buttons
  document.querySelectorAll(".buy-now").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const product = getProductFromCard(card);
      pendingBuyNowProduct = product;
      toggleShippingForm(); // show popup to collect shipping info
    });
  });

  renderCart();
});

// 🧾 Get product data from card
function getProductFromCard(card) {
  return {
    id: card.dataset.id,
    name: card.dataset.name,
    price: parseInt(card.dataset.price),
    img: card.dataset.img,
    qty: 1
  };
}

// ➕ Add to cart
function addToCart(item) {
  const existing = cart.find((p) => p.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push(item);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  alert(`${item.name} added to cart!`);
}

// 🛍️ Render Cart
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
        ₹${item.price} × ${item.qty} = ₹${subtotal}
        <br>
        <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });

  totalElem.textContent = total;
  countElem.textContent = count;
}

// 🗑️ Remove Item
window.removeItem = function (index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};

// 🛒 Toggle Cart Drawer
window.toggleCart = function () {
  const drawer = document.getElementById("cart-drawer");
  if (drawer) drawer.classList.toggle("hidden");
};

// 🚪 Toggle Shipping Form Popup
function toggleShippingForm() {
  const form = document.getElementById("shipping-form");
  if (form) form.classList.toggle("hidden");
}

// ✅ Buy Now → Show Razorpay after getting customer details
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

  const options = {
    key: "rzp_live_wEC5gALdAnUWbA",
    amount: pendingBuyNowProduct.price * 100,
    currency: "INR",
    name: "Yamaki Foods",
    description: pendingBuyNowProduct.name,
    image: "https://yamakifoods.com/images/favicon.jpg",
    handler: function (response) {
      alert(`Payment successful for ${pendingBuyNowProduct.name}!\nRazorpay ID: ${response.razorpay_payment_id}`);
    },
    prefill: {
      name: name,
      email: email,
      contact: phone
    },
    notes: {
      address: `${address}, ${state}, ${country} - ${pincode}`
    },
    theme: {
      color: "#2e7d32"
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}

// 🛒 Checkout full cart
window.checkout = function () {
  const totalAmount = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  if (totalAmount === 0) return alert("Your cart is empty.");

  const options = {
    key: "rzp_live_wEC5gALdAnUWbA",
    amount: totalAmount * 100,
    currency: "INR",
    name: "Yamaki Foods",
    description: "Order Payment",
    image: "https://yamakifoods.com/images/favicon.jpg",
    handler: function (response) {
      alert("Payment successful! Razorpay ID: " + response.razorpay_payment_id);
      cart = [];
      localStorage.removeItem("cart");
      renderCart();
      toggleCart();
    },
    prefill: {
      name: "",
      email: "",
      contact: ""
    },
    theme: {
      color: "#2e7d32"
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
};

// 🔄 Expose to window so inline HTML button can call it
window.submitShippingDetails = submitShippingDetails;
window.toggleShippingForm = toggleShippingForm;
