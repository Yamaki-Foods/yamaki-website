// CONFIG: Set this to your live Google Apps Script Web App URL
const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbywep3DL_CAIMPK6HHDWDcfOt0KNqBt2BgMqB5PwvudEY8RFcyYu8A8x3NAkphE_oNM/exec";

// Submit shipping data and trigger Razorpay
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

  const amount = isFullCartCheckout
    ? cart.reduce((sum, p) => sum + p.price * p.qty, 0)
    : (pendingBuyNowProduct?.price || 0) * (pendingBuyNowProduct?.qty || 1);

  const product = isFullCartCheckout
    ? "Cart Checkout"
    : (pendingBuyNowProduct?.name || "Buy Now");

  const params = new URLSearchParams({
    name,
    email,
    phone,
    address,
    state,
    country,
    pincode,
    product,
    amount: amount.toString()
  });

  // Send to Google Sheet using GET to bypass CORS
  fetch(`${GOOGLE_SHEET_WEBAPP_URL}?${params.toString()}`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to save shipping data.");
      return res.text();
    })
    .then(() => {
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
        amount
      });
    })
    .catch((err) => {
      alert("Error submitting form: " + err.message);
    });
}

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
    },
    prefill: {
      name: data.name,
      email: data.email,
      contact: data.phone
    },
    notes: {
      address: `${data.address}, ${data.state}, ${data.country} - ${data.pincode}`
    },
    theme: {
      color: "#2e7d32"
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}
