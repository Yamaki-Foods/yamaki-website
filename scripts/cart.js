let cart = JSON.parse(localStorage.getItem("cart")) || [];

window.toggleCart = function () {
  const drawer = document.getElementById("cart-drawer");
  if (drawer) {
    drawer.classList.toggle("hidden");
  }
};

window.removeItem = function (index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};

window.checkout = function () {
  const totalAmount = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  if (totalAmount === 0) return alert("Your cart is empty.");

  const options = {
    key: "rzp_live_wEC5gALdAnUWbA", // Replace with your actual Razorpay key
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

window.triggerRazorpay = function (product) {
  const options = {
    key: "rzp_live_wEC5gALdAnUWbA",
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
};

document.addEventListener("DOMContentLoaded", () => {
  // Add-to-cart buttons
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const product = getProductFromCard(card);
      addToCart(product);
    });
  });

  // Buy-now buttons
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
    qty: 1
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
