let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Add Event Listeners after DOM loads
document.addEventListener("DOMContentLoaded", () => {
  // Add to Cart button
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const product = getProductFromCard(card);
      addToCart(product);
    });
  });

  // Buy Now button
  document.querySelectorAll(".buy-now").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const product = getProductFromCard(card);
      triggerRazorpay(product);
    });
  });

  renderCart();
});

function getProductFromCard(card) {
  return {
    id: card.dataset.id,
    name: card.dataset.name,
    price: parseInt(card.dataset.price),
    img: card.dataset.img,
    qty: 1,
  };
}

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

function renderCart() {
  const container = document.querySelector(".cart-items");
  const totalElem = document.getElementById("cart-total");
  if (!container || !totalElem) return;

  container.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.qty * item.price;
    total += subtotal;

    container.innerHTML += `
      <div style="margin-bottom: 1em;">
        <strong>${item.name}</strong><br>
        ₹${item.price} × ${item.qty} = ₹${subtotal}
        <br><button onclick="removeItem(${index})" style="margin-top:5px;font-size:0.8em;color:#c00;">Remove</button>
      </div>
    `;
  });

  totalElem.textContent = total;
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function toggleCart() {
  document.getElementById("cart-drawer").classList.toggle("open");
}

function checkout() {
  const totalAmount = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  if (totalAmount === 0) return alert("Your cart is empty.");

  const options = {
    key: "rzp_live_wEC5gALdAnUWbA", // ⛳ Replace with your Razorpay key
    amount: totalAmount * 100, // in paise
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
}

function triggerRazorpay(product) {
  const options = {
    key: "rzp_live_wEC5gALdAnUWbA", // ⛳ Replace with your Razorpay key
    amount: product.price * 100,
    currency: "INR",
    name: "Yamaki Foods",
    description: product.name,
    image: "https://yamakifoods.com/images/favicon.jpg",
    handler: function (response) {
      alert(`Payment successful for ${product.name}! Razorpay ID: ` + response.razorpay_payment_id);
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
}
