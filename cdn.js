(function (window) {
  function sanitizeInput(input) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(input));
    return div.innerHTML;
  }

  function payWithMePaas({
    apiKey,
    amount,
    email,
    onClose,
    onSuccess,
    onError,
    envLink,
  }) {
    // Sanitize inputs
    apiKey = sanitizeInput(apiKey);
    amount = sanitizeInput(amount);
    email = sanitizeInput(email);
    const captureLink = sanitizeInput(envLink);

    const link = envLink ? captureLink : "https://me-paas-sdk.vercel.app";

    // Validate required parameters
    if (!apiKey || !amount || !email || !link) {
      if (typeof onError === "function") {
        onError("Missing required parameters: apiKey, amount, email, or link.");
      }
      return; // Prevent the modal from opening
    }

    // Build iframe link with query params
    const iframeLink = `${link}?apiKey=${encodeURIComponent(
      apiKey
    )}&amount=${encodeURIComponent(amount)}&email=${encodeURIComponent(email)}`;

    // Create the modal container with animation
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.backgroundColor = "rgba(0,0,0,0.5)";
    modal.style.zIndex = "9999";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.opacity = "0"; // Start invisible

    // Create the modal content container
    const modalContent = document.createElement("div");
    modalContent.style.position = "relative";
    modalContent.style.width = "400px";
    modalContent.style.height = "600px";
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.borderRadius = "32px";
    modalContent.style.overflow = "hidden";
    modalContent.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.1)";

    // Add class to modalContent for easy targeting by media query
    modalContent.classList.add("me-protocol-modal-content");

    // Apply media queries for mobile full-screen style
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      @media (max-width: 768px) {
        .me-protocol-modal-content {
          width: 100vw !important;
          height: 100vh !important;
          border-radius: 0 !important;
        }
      }
    `;
    document.head.appendChild(styleElement);

    // Create the iframe
    const iframe = document.createElement("iframe");
    iframe.src = iframeLink;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.allow = "payment";

    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Animate modal (fade-in)
    setTimeout(() => {
      modal.style.opacity = "1"; // Fade-in
    }, 10); // Small timeout to trigger the transition

    // Handle closing of the modal
    function closeModal() {
      modal.style.opacity = "0"; // Fade-out
      setTimeout(() => {
        document.body.removeChild(modal); // Remove the modal after animation
        if (typeof onClose === "function") {
          onClose();
        }
      }, 500); // Wait for the fade-out transition to finish
    }

    // Listen for success message from iframe (if using postMessage)
    window.addEventListener("message", function (event) {
      if (event.origin !== new URL(link).origin) {
        return; // Ignore messages from unknown origins
      }
      if (event.data.status === "success" && typeof onSuccess === "function") {
        onSuccess(event.data.task_id); // Handle the success and return the hash
      } else if (
        event.data.status === "error" &&
        typeof onError === "function"
      ) {
        onError(event.data.message); // Handle the error case
      } else if (event.data.status === "close") {
        closeModal();
      }
    });

    // Optionally, close modal when clicking outside the modal content
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Expose the payWithMePaas function to the global scope
  window.payWithMePaas = payWithMePaas;
})(window);
