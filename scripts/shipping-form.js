// CONFIG: Set this to your live Google Apps Script Web App URL
const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbywep3DL_CAIMPK6HHDWDcfOt0KNqBt2BgMqB5PwvudEY8RFcyYu8A8x3NAkphE_oNM/exec";

// 🔁 Unified function to handle iframe-based form submission + Razorpay
window.handleFormSubmit = function () {
  const name = document.getElementById("ship-name").value;
  const email = document.getElementById("ship-email").value;
  const phone = document.getElementById("ship-phone").value;
  const address = document.getElementById("ship-address").value;
  const state = document.getElementById("ship-state").value;
  const country = document.getElementById("ship-country").value;
  const pincode = document.getElementById("ship-pincode").value;

  if (!name || !email || !phone || !address || !state || !country || !pincode) {
    alert("Please fill in all fields.");
    return false; // prevent form submission
  }

  const isBuyNow = !isFullCartCheckout;
  const product = isBuyNow
    ? (pendingBuyNowProduct?.name || "Buy Now")
    : "Cart Checkout";

  const amount = isBuyNow
    ? (pendingBuyNowProduct?.price || 0) * (pendingBuyNowProduct?.qty || 1)
    : cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  const cartItems = isBuyNow
    ? `${pendingBuyNowProduct.name} (x${pendingBuyNowProduct.qty}) - ₹${pendingBuyNowProduct.price * pendingBuyNowProduct.qty}`
    : cart.map(p => `${p.name} (x${p.qty}) - ₹${p.price * p.qty}`).join(", ");

  // 💡 Set hidden form fields so GAS receives them
  document.getElementById("hidden-product").value = product;
  document.getElementById("hidden-cartItems").value = cartItems;
  document.getElementById("hidden-amount").value = amount;

  // ⏳ Delay Razorpay until form data is sent (approx 1 sec)
  setTimeout(() => {
    toggleShippingForm();
    startRazorpayPayment({
      name,
      email,
      phone,
      address,
      state,
      country,
      pincode,
      product,
      cartItems,
      amount
    });
  }, 1000);

  return true; // ✅ allow the form to submit via iframe
};

function startRazorpayPayment(data) {
  if (data.amount === 0) {
    alert("Something went wrong. Amount is 0.");
    return;
  }

  const options = {
    key: "",
    amount: data.amount * 100,
    currency: "INR",
    name: "Yamaki Foods",
    description: data.product,
    image: "https://yamakifoods.com/images/favicon.jpg",
    handler: function (response) {
      alert("Payment successful! Razorpay ID: " + response.razorpay_payment_id);
      if (isFullCartCheckout) {
        cart = [];
        localStorage.removeItem("cart");
        renderCart();
      } else {
        pendingBuyNowProduct = null;
      }
    },
    prefill: {
      name: data.name,
      email: data.email,
      contact: data.phone
    },
    notes: {
      address: `${data.address}, ${data.state}, ${data.country} - ${data.pincode}`,
      items: data.cartItems
    },
    theme: {
      color: "#2e7d32"
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}
