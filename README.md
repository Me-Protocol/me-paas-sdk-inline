# me-paas-sdk-inline

## Install

```html
<script src="https://cdn.jsdelivr.net/gh/ME-PAAS/me-paas-sdk-inline/dist/me-paas-sdk-inline.min.js"></script>
```

## Usage

```html
<button id="openModalBtn">Pay</button>

<script>
  document
    .getElementById("openModalBtn")
    .addEventListener("click", function () {
      const email = document.getElementById("email").value;

      if (!email) {
        alert("Please enter your email address");
        return;
      }

      payWithMePaas({
        apiKey: "ro2a6ajkavja4i0uhui41i", // Replace with actual API key
        amount: 1.2, // Amount in your preferred format
        email: email, // Replace with actual email
        onClose: function () {
          console.log("Modal closed");
        },
        onSuccess: function (transactionId) {
          console.log("Payment successful", transactionId);
        },
        onError: function (error) {
          console.log("Payment failed", error);
        },
      });
    });
</script>
```
