// CONFIG: Set this to your live Google Apps Script Web App URL
const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbywep3DL_CAIMPK6HHDWDcfOt0KNqBt2BgMqB5PwvudEY8RFcyYu8A8x3NAkphE_oNM/exec";

// ✅ Global Razorpay handler — triggered after form is submitted via iframe
window.handleFormSubmit = function () {
  const name = document.getElementById("ship-name").value;
  const email = document.getElementById("ship-email").value;
  const phone = document.getElementById("ship-phone").value;
  const address = document.getElementById("ship-address").value;
  const state = document.getElementById("ship-state").value;
  const country = document.getElementById("ship-country").value;
  const pincode = document.getElementById("ship-pincode").value;

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

  // 💳 Proceed to Razorpay after a short delay
  setTimeout(() => {
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
  }, 500);
};

// 💳 Razorpay Payment
function startRazorpayPayment(data) {
  if (data.amount === 0) {
    alert("Something went wrong. Amount is 0.");
    return;
  }

  const options = {
    key: "rzp_live_wEC5gALdAnUWbA",
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

      toggleShippingForm(); // Close the shipping form after payment
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
