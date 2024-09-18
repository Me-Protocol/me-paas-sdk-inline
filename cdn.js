(function (window) {
  function sanitizeInput(input) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(input));
    return div.innerHTML;
  }

  function openIframe({
    apiKey,
    amount,
    email,
    onClose,
    onSuccess,
    onError,
    link,
  }) {
    // Sanitize inputs
    apiKey = sanitizeInput(apiKey);
    amount = sanitizeInput(amount);
    email = sanitizeInput(email);
    link = sanitizeInput(link);

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
    modalContent.style.height = "550px";
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

    // Create the close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM15.36 14.3C15.65 14.59 15.65 15.07 15.36 15.36C15.21 15.51 15.02 15.58 14.83 15.58C14.64 15.58 14.45 15.51 14.3 15.36L12 13.06L9.7 15.36C9.55 15.51 9.36 15.58 9.17 15.58C8.98 15.58 8.79 15.51 8.64 15.36C8.35 15.07 8.35 14.59 8.64 14.3L10.94 12L8.64 9.7C8.35 9.41 8.35 8.93 8.64 8.64C8.93 8.35 9.41 8.35 9.7 8.64L12 10.94L14.3 8.64C14.59 8.35 15.07 8.35 15.36 8.64C15.65 8.93 15.65 9.41 15.36 9.7L13.06 12L15.36 14.3Z" fill="#878789"/>
      </svg>
    `;
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "0px";
    closeButton.style.background = "none";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";

    // Append close button and iframe to modal content
    modalContent.appendChild(closeButton);
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

    // Close modal when close button is clicked
    closeButton.addEventListener("click", closeModal);

    // Listen for success message from iframe (if using postMessage)
    window.addEventListener("message", function (event) {
      if (event.origin !== new URL(link).origin) {
        return; // Ignore messages from unknown origins
      }
      if (event.data.status === "success" && typeof onSuccess === "function") {
        onSuccess(event.data.hash); // Handle the success and return the hash
        closeModal();
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

  // Expose the openIframe function to the global scope
  window.openIframe = openIframe;
})(window);
