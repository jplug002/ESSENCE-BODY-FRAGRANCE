document.addEventListener("DOMContentLoaded", () => {
  // Cart functionality
  let cartItems = []
  const cartItemsContainer = document.getElementById("cart-items")
  const emptyCartMessage = document.getElementById("empty-cart")
  const cartContainer = document.querySelector(".cart-container")
  const subtotalAmount = document.getElementById("subtotal-amount")
  const totalAmount = document.getElementById("total-amount")
  const cartIcon = document.querySelector(".cart-icon")
  const checkoutButton = document.getElementById("checkout-button")
  const applyPromoButton = document.getElementById("apply-promo")
  const promoInput = document.getElementById("promo-input")

  // Create checkout confirmation modal
  const checkoutModal = document.createElement("div")
  checkoutModal.className = "checkout-modal"
  checkoutModal.innerHTML = `
    <div class="checkout-modal-content">
      <div class="checkout-modal-header">
        <h3>Order Confirmation</h3>
        <button id="close-checkout-modal" class="close-checkout">&times;</button>
      </div>
      <div class="checkout-modal-body">
        <div class="checkout-success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2>Thank You For Your Order!</h2>
        <p>We'll contact you for payment on delivery at:</p>
        <div class="contact-number" id="confirmation-phone-number"></div>
        <p class="order-note">Your order will be processed shortly.</p>
        <button id="continue-shopping-btn" class="continue-shopping-btn">Continue Shopping</button>
      </div>
    </div>
  `
  document.body.appendChild(checkoutModal)

  // Promo codes
  const promoCodes = {
    WELCOME10: 0.1, // 10% off
    SHEILA: 0.05, // 5% off
  }

  let appliedPromo = null

  // Load cart from localStorage
  function loadCart() {
    if (localStorage.getItem("cartItems")) {
      try {
        cartItems = JSON.parse(localStorage.getItem("cartItems"))
        updateCartCount()
        if (cartItemsContainer) {
          renderCartItems()
          calculateTotals()
        }
      } catch (e) {
        console.error("Error loading cart from localStorage", e)
        localStorage.removeItem("cartItems")
        cartItems = []
      }
    }

    // Make sure cart section is visible when on cart page
    const cartSection = document.querySelector(".cart-section")
    if (cartSection && window.location.pathname.includes("cart.html")) {
      cartSection.style.display = "block"
    }
  }

  // Save cart to localStorage
  function saveCart() {
    localStorage.setItem("cartItems", JSON.stringify(cartItems))
  }

  // Update cart count
  function updateCartCount() {
    const cartCount = document.getElementById("cart-count")
    if (cartCount) {
      const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)
      cartCount.textContent = totalItems
    }
  }

  // Format price
  function formatPrice(price) {
    return "GH₵" + Number.parseFloat(price).toFixed(2)
  }

  // Extract price number from string (e.g. "GH₵49.99" -> 49.99)
  function extractPrice(priceString) {
    return Number.parseFloat(priceString.replace("GH₵", ""))
  }

  // Calculate subtotal
  function calculateSubtotal() {
    return cartItems.reduce((total, item) => {
      return total + extractPrice(item.price) * item.quantity
    }, 0)
  }

  // Calculate total
  function calculateTotal(subtotal) {
    let total = subtotal

    // Apply percentage discount if applicable
    if (appliedPromo && appliedPromo !== "free-shipping") {
      total = total * (1 - appliedPromo)
    }

    return total
  }

  // Calculate and update totals
  function calculateTotals() {
    if (!subtotalAmount || !totalAmount) return

    const subtotal = calculateSubtotal()
    const total = calculateTotal(subtotal)

    subtotalAmount.textContent = formatPrice(subtotal)
    totalAmount.textContent = formatPrice(total)
  }

  // Render cart items in the cart page
  function renderCartItems() {
    if (!cartItemsContainer) return

    if (cartItems.length === 0) {
      if (cartContainer) cartContainer.style.display = "none"
      if (emptyCartMessage) emptyCartMessage.style.display = "flex"
      return
    }

    if (cartContainer) cartContainer.style.display = "flex"
    if (emptyCartMessage) emptyCartMessage.style.display = "none"

    cartItemsContainer.innerHTML = ""

    cartItems.forEach((item) => {
      const cartItemElement = document.createElement("div")
      cartItemElement.className = "cart-item"
      cartItemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-item-price">${item.price}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
                <div class="cart-item-total">
                    ${formatPrice(extractPrice(item.price) * item.quantity)}
                </div>
                <button class="remove-item" data-id="${item.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `
      cartItemsContainer.appendChild(cartItemElement)
    })

    // Add event listeners to quantity buttons and remove buttons
    document.querySelectorAll(".quantity-btn.decrease").forEach((btn) => {
      btn.addEventListener("click", decreaseQuantity)
    })

    document.querySelectorAll(".quantity-btn.increase").forEach((btn) => {
      btn.addEventListener("click", increaseQuantity)
    })

    document.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", removeItem)
    })
  }

  // Decrease item quantity
  function decreaseQuantity() {
    const itemId = this.dataset.id
    const itemIndex = cartItems.findIndex((item) => item.id === itemId)

    if (itemIndex !== -1) {
      if (cartItems[itemIndex].quantity > 1) {
        cartItems[itemIndex].quantity -= 1
      } else {
        cartItems.splice(itemIndex, 1)
      }

      saveCart()
      updateCartCount()
      renderCartItems()
      calculateTotals()
    }
  }

  // Increase item quantity
  function increaseQuantity() {
    const itemId = this.dataset.id
    const itemIndex = cartItems.findIndex((item) => item.id === itemId)

    if (itemIndex !== -1) {
      cartItems[itemIndex].quantity += 1

      saveCart()
      updateCartCount()
      renderCartItems()
      calculateTotals()
    }
  }

  // Remove item from cart
  function removeItem() {
    const itemId = this.dataset.id
    const itemIndex = cartItems.findIndex((item) => item.id === itemId)

    if (itemIndex !== -1) {
      cartItems.splice(itemIndex, 1)

      saveCart()
      updateCartCount()
      renderCartItems()
      calculateTotals()
    }
  }

  // Show checkout confirmation modal
  function showCheckoutModal() {
    // Update the phone number in the confirmation modal
    const customerPhoneInput = document.getElementById("customer-phone-input")
    const phoneNumberDisplay = document.getElementById("confirmation-phone-number")
    if (phoneNumberDisplay && customerPhoneInput) {
      phoneNumberDisplay.textContent = customerPhoneInput.value.trim()
    }

    checkoutModal.classList.add("show-checkout-modal")
  }

  // Close checkout confirmation modal
  function closeCheckoutModal() {
    checkoutModal.classList.remove("show-checkout-modal")
  }

  // Apply promo code
  function applyPromoCode() {
    const promoCode = promoInput.value.trim().toUpperCase()

    if (promoCodes.hasOwnProperty(promoCode)) {
      appliedPromo = promoCodes[promoCode]

      // Show success message
      const successMessage = document.createElement("div")
      successMessage.className = "promo-success"
      successMessage.textContent = "Promo code applied successfully!"

      const promoContainer = promoInput.parentElement

      // Remove any existing messages
      const existingMessage = promoContainer.querySelector(".promo-success, .promo-error")
      if (existingMessage) {
        promoContainer.removeChild(existingMessage)
      }

      promoContainer.appendChild(successMessage)

      // Recalculate totals
      calculateTotals()

      // Clear input
      promoInput.value = ""

      // Remove message after 3 seconds
      setTimeout(() => {
        if (promoContainer.contains(successMessage)) {
          promoContainer.removeChild(successMessage)
        }
      }, 3000)
    } else {
      // Show error message
      const errorMessage = document.createElement("div")
      errorMessage.className = "promo-error"
      errorMessage.textContent = "Invalid promo code"

      const promoContainer = promoInput.parentElement

      // Remove any existing messages
      const existingMessage = promoContainer.querySelector(".promo-success, .promo-error")
      if (existingMessage) {
        promoContainer.removeChild(existingMessage)
      }

      promoContainer.appendChild(errorMessage)

      // Remove message after 3 seconds
      setTimeout(() => {
        if (promoContainer.contains(errorMessage)) {
          promoContainer.removeChild(errorMessage)
        }
      }, 3000)
    }
  }

  // Declare emailjs
  const emailjs = window.emailjs

  // Checkout function
  function checkout() {
    // Get customer phone number
    const customerPhoneInput = document.getElementById("customer-phone-input")
    const customerPhone = customerPhoneInput.value.trim()

    // Validate phone number
    if (!customerPhone) {
      alert("Please enter your phone number for delivery.")
      customerPhoneInput.focus()
      return
    }

    // Generate a unique order ID
    const orderId = "ORD-" + Date.now()

    // Create order object with customer cart items and timestamp
    const order = {
      id: orderId,
      items: [...cartItems],
      total: calculateTotal(calculateSubtotal()),
      timestamp: new Date().toISOString(),
      contactNumber: customerPhone,
    }

    // Store order in localStorage
    let orders = []
    if (localStorage.getItem("orders")) {
      orders = JSON.parse(localStorage.getItem("orders"))
    }
    orders.push(order)
    localStorage.setItem("orders", JSON.stringify(orders))

    // Prepare order details for email
    let orderDetails = `
    Order ID: ${orderId}
    Date: ${new Date().toLocaleString()}
    Contact Number: ${customerPhone}
    
    Items:
`

    cartItems.forEach((item) => {
      orderDetails += `
  - ${item.name} (${item.price} × ${item.quantity}) = ${(extractPrice(item.price) * item.quantity).toFixed(2)}`
    })

    orderDetails += `
  
  Total: ${calculateTotal(calculateSubtotal()).toFixed(2)}
`

    // Send email notification using EmailJS
    emailjs
      .send(
        "service_id", // Replace with your EmailJS service ID
        "template_id", // Replace with your EmailJS template ID
        {
          to_email: "Bernisdhammy@yahoo.com",
          from_name: "Essence Website",
          subject: `New Order: ${orderId}`,
          message: orderDetails,
        },
        "user_id", // Replace with your EmailJS user ID
      )
      .then(
        (response) => {
          console.log("Email sent successfully:", response)
        },
        (error) => {
          console.error("Email sending failed:", error)
        },
      )

    // Show checkout confirmation modal
    showCheckoutModal()

    // Clear the cart after checkout
    cartItems = []
    saveCart()
    updateCartCount()
  }

  // Event listeners
  // Redirect to cart page when clicking cart icon
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      window.location.href = "cart.html"
    })
  }

  // Close modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === checkoutModal) {
      closeCheckoutModal()
    }
  })

  if (checkoutButton) {
    checkoutButton.addEventListener("click", checkout)
  }

  if (applyPromoButton) {
    applyPromoButton.addEventListener("click", applyPromoCode)
  }

  // Add event listeners for checkout modal
  document.getElementById("close-checkout-modal").addEventListener("click", closeCheckoutModal)
  document.getElementById("continue-shopping-btn").addEventListener("click", () => {
    closeCheckoutModal()
    window.location.href = "products.html"
  })

  // Initialize cart
  loadCart()
})
