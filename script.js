document.addEventListener("DOMContentLoaded", () => {
  // Add this function to the script.js file, near the top of the DOMContentLoaded event handler
  function formatPrice(price) {
    return "GH₵" + Number.parseFloat(price).toFixed(2)
  }

  // Add this function to extract price from string
  function extractPrice(priceString) {
    return Number.parseFloat(priceString.replace("GH₵", ""))
  }

  // Mobile menu toggle
  const mobileMenu = document.querySelector(".mobile-menu")
  const navLinks = document.querySelector(".nav-links")

  if (mobileMenu) {
    mobileMenu.addEventListener("click", () => {
      mobileMenu.classList.toggle("active")
      navLinks.classList.toggle("active")
    })
  }

  // Initialize cart from localStorage
  initializeCart()

  // Add to cart functionality
  const addToCartButtons = document.querySelectorAll(".add-to-cart")
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productCard = this.closest(".product-card")
      const productId = productCard.dataset.id
      const productName = productCard.querySelector("h3").textContent
      const productPrice = productCard.querySelector(".product-price").textContent.replace("GH₵", "")
      const productImage = productCard.querySelector("img").src
      const productCategory = productCard.dataset.category

      addToCart(productId, productName, Number.parseFloat(productPrice), productImage, productCategory)
      updateCartCount()

      // Show added to cart feedback
      const originalText = this.textContent
      this.textContent = "Added to Bag!"
      this.disabled = true
      this.style.backgroundColor = "var(--success-color)"

      setTimeout(() => {
        this.textContent = originalText
        this.disabled = false
        this.style.backgroundColor = ""
      }, 2000)
    })
  })

  // Cart icon click - redirect to cart page
  const cartIcon = document.querySelector(".cart-icon")
  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      window.location.href = "cart.html"
    })
  }

  // Category tabs functionality
  const categoryTabs = document.querySelectorAll(".category-tab")
  const productCards = document.querySelectorAll(".product-card")

  if (categoryTabs.length > 0) {
    categoryTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        // Remove active class from all tabs
        categoryTabs.forEach((t) => t.classList.remove("active"))
        // Add active class to clicked tab
        this.classList.add("active")

        const category = this.dataset.category

        // Show/hide products based on category with animation
        productCards.forEach((card) => {
          // Reset animation
          card.style.animation = "none"
          card.offsetHeight // Trigger reflow

          if (category === "all" || card.dataset.category === category) {
            card.style.display = "flex"
            card.style.animation = "fadeIn 0.5s forwards"
          } else {
            card.style.display = "none"
          }
        })
      })
    })

    // Check if URL has a hash for category
    if (window.location.hash) {
      const category = window.location.hash.substring(1)
      const categoryTab = document.querySelector(`.category-tab[data-category="${category}"]`)
      if (categoryTab) {
        categoryTab.click()
      }
    }
  }

  // Testimonial slider
  const testimonials = document.querySelectorAll(".testimonial")
  const dots = document.querySelectorAll(".dot")
  let currentTestimonial = 0

  if (testimonials.length > 0 && dots.length > 0) {
    // Hide all testimonials except the first one
    testimonials.forEach((testimonial, index) => {
      if (index !== 0) {
        testimonial.style.display = "none"
      }
    })

    // Add click event to dots
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showTestimonial(index)
      })
    })

    // Auto slide testimonials
    setInterval(() => {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length
      showTestimonial(currentTestimonial)
    }, 5000)
  }

  function showTestimonial(index) {
    testimonials.forEach((testimonial) => {
      testimonial.style.display = "none"
    })
    dots.forEach((dot) => {
      dot.classList.remove("active")
    })

    testimonials[index].style.display = "block"
    dots[index].classList.add("active")
    currentTestimonial = index
  }

  // Cart page functionality
  if (window.location.pathname.includes("cart.html")) {
    displayCart()
    setupCartFunctionality()
  }

  // Admin page functionality
  if (window.location.pathname.includes("admin.html")) {
    displayOrders()
    setupAdminFunctionality()
  }

  // Newsletter form submission
  const newsletterForm = document.getElementById("newsletter-form")
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault()
      const emailInput = this.querySelector('input[type="email"]')
      const email = emailInput.value

      // Here you would typically send this to your backend
      alert(`Thank you for subscribing with ${email}! You'll receive our newsletter soon.`)
      emailInput.value = ""
    })
  }

  // FAQ functionality
  const faqQuestions = document.querySelectorAll(".faq-question")
  if (faqQuestions.length > 0) {
    faqQuestions.forEach((question) => {
      question.addEventListener("click", () => {
        const answer = question.nextElementSibling
        const isOpen = answer.style.display === "block"

        // Close all answers
        document.querySelectorAll(".faq-answer").forEach((ans) => {
          ans.style.display = "none"
        })

        // Toggle the clicked answer
        if (!isOpen) {
          answer.style.display = "block"
        }
      })
    })

    // Open the first FAQ by default
    if (faqQuestions[0] && faqQuestions[0].nextElementSibling) {
      faqQuestions[0].nextElementSibling.style.display = "block"
    }
  }

  // Scroll to top button
  const scrollTopBtn = document.querySelector(".scroll-top")

  if (scrollTopBtn) {
    // Show/hide button based on scroll position
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add("visible")
      } else {
        scrollTopBtn.classList.remove("visible")
      }
    })

    // Scroll to top when clicked
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    })
  }

  // Add animation to FAQ items
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {
      const faqItem = question.parentElement
      const answer = question.nextElementSibling

      // Toggle active class
      faqItem.classList.toggle("active")

      // Toggle answer visibility
      if (faqItem.classList.contains("active")) {
        answer.style.maxHeight = answer.scrollHeight + "px"
      } else {
        answer.style.maxHeight = "0"
      }
    })
  })
})

// Cart Functions
function initializeCart() {
  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", JSON.stringify([]))
  }
  updateCartCount()
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || []
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartCount()
}

function addToCart(id, name, price, image, category) {
  const cart = getCart()
  const existingItem = cart.find((item) => item.id === id)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      id,
      name,
      price,
      image,
      category,
      quantity: 1,
    })
  }

  saveCart(cart)
}

function updateCartCount() {
  const cart = getCart()
  const count = cart.reduce((total, item) => total + item.quantity, 0)
  const cartCountElement = document.getElementById("cart-count")

  if (cartCountElement) {
    cartCountElement.textContent = count
  }
}

function displayCart() {
  const cart = getCart()
  const cartItemsContainer = document.querySelector(".cart-items")
  const cartEmptyMessage = document.querySelector(".cart-empty")
  const cartContent = document.querySelector(".cart-content")

  if (!cartItemsContainer) return

  if (cart.length === 0) {
    if (cartContent) cartContent.style.display = "none"
    if (cartEmptyMessage) cartEmptyMessage.style.display = "block"
    return
  }

  if (cartContent) cartContent.style.display = "flex"
  if (cartEmptyMessage) cartEmptyMessage.style.display = "none"

  // Clear previous items
  cartItemsContainer.innerHTML = ""

  // Add cart items
  cart.forEach((item) => {
    const cartItemElement = document.createElement("div")
    cartItemElement.className = "cart-item"
    cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">GH₵${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn increase" data-id="${item.id}">+</button>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `

    cartItemsContainer.appendChild(cartItemElement)
  })

  updateCartSummary()
}

function updateCartSummary() {
  const cart = getCart()
  const subtotalElement = document.getElementById("cart-subtotal")
  const totalElement = document.getElementById("cart-total")

  if (!subtotalElement || !totalElement) return

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const total = subtotal

  subtotalElement.textContent = `GH₵${subtotal.toFixed(2)}`
  totalElement.textContent = `GH₵${total.toFixed(2)}`
}

function setupCartFunctionality() {
  const cartItemsContainer = document.querySelector(".cart-items")
  const checkoutBtn = document.querySelector(".checkout-btn")
  const phoneInput = document.getElementById("phone-input")

  if (!cartItemsContainer) return

  // Quantity buttons
  cartItemsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("decrease") || e.target.classList.contains("increase")) {
      const id = e.target.dataset.id
      updateItemQuantity(id, e.target.classList.contains("increase") ? 1 : -1)
    }

    if (e.target.classList.contains("cart-item-remove") || e.target.closest(".cart-item-remove")) {
      const id = e.target.dataset.id || e.target.closest(".cart-item-remove").dataset.id
      removeCartItem(id)
    }
  })

  // Checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault()

      if (!phoneInput || !phoneInput.value.trim()) {
        alert("Please enter your phone number to proceed.")
        return
      }

      const phoneNumber = phoneInput.value.trim()
      const cart = getCart()

      // Create order
      const order = {
        id: generateOrderId(),
        date: new Date().toISOString(),
        items: cart,
        total: cart.reduce((total, item) => total + item.price * item.quantity, 0),
        phone: phoneNumber,
      }

      // Save order
      saveOrder(order)

      // Clear cart
      localStorage.setItem("cart", JSON.stringify([]))

      // Show confirmation
      showOrderConfirmation(order)
    })
  }
}

function updateItemQuantity(id, change) {
  const cart = getCart()
  const itemIndex = cart.findIndex((item) => item.id === id)

  if (itemIndex !== -1) {
    cart[itemIndex].quantity += change

    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1)
    }

    saveCart(cart)
    displayCart()
  }
}

function removeCartItem(id) {
  const cart = getCart()
  const updatedCart = cart.filter((item) => item.id !== id)
  saveCart(updatedCart)
  displayCart()
}

function generateOrderId() {
  return "ORD-" + Math.random().toString(36).substring(2, 8).toUpperCase()
}

function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem("orders")) || []
  orders.push(order)
  localStorage.setItem("orders", JSON.stringify(orders))
}

function showOrderConfirmation(order) {
  // Create modal overlay
  const modalOverlay = document.createElement("div")
  modalOverlay.className = "modal-overlay"

  // Create modal
  const modal = document.createElement("div")
  modal.className = "modal"

  // Create modal content
  modal.innerHTML = `
        <div class="modal-header">
            <h3 class="modal-title">Order Confirmation</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <p>Thank you for your order! Your order ID is <strong>${order.id}</strong>.</p>
            <p>We will contact you at <strong>${order.phone}</strong> to arrange delivery and payment.</p>
            <p>Order total: <strong>GH₵${order.total.toFixed(2)}</strong></p>
        </div>
        <div class="modal-footer">
            <button class="modal-btn modal-btn-confirm">OK</button>
        </div>
    `

  // Append modal to overlay
  modalOverlay.appendChild(modal)

  // Append overlay to body
  document.body.appendChild(modalOverlay)

  // Show modal
  setTimeout(() => {
    modalOverlay.classList.add("active")
  }, 10)

  // Close modal on button click
  modal.querySelector(".modal-btn-confirm").addEventListener("click", () => {
    modalOverlay.classList.remove("active")
    setTimeout(() => {
      modalOverlay.remove()
      window.location.href = "index.html"
    }, 300)
  })

  // Close modal on X click
  modal.querySelector(".modal-close").addEventListener("click", () => {
    modalOverlay.classList.remove("active")
    setTimeout(() => {
      modalOverlay.remove()
    }, 300)
  })
}

// Admin Functions
function displayOrders() {
  const orders = JSON.parse(localStorage.getItem("orders")) || []
  const ordersContainer = document.querySelector(".orders-container")

  if (!ordersContainer) return

  if (orders.length === 0) {
    ordersContainer.innerHTML = '<div class="no-orders">No orders yet.</div>'
    return
  }

  // Clear previous orders
  ordersContainer.innerHTML = ""

  // Sort orders by date (newest first)
  orders.sort((a, b) => new Date(b.date) - new Date(a.date))

  // Add orders
  orders.forEach((order) => {
    const orderElement = document.createElement("div")
    orderElement.className = "order-item"
    orderElement.dataset.id = order.id

    // Format date
    const orderDate = new Date(order.date)
    const formattedDate = orderDate.toLocaleDateString() + " " + orderDate.toLocaleTimeString()

    // Create order header
    const orderHeader = document.createElement("div")
    orderHeader.className = "order-header"
    orderHeader.innerHTML = `
            <div class="order-id">${order.id}</div>
            <div class="order-date">${formattedDate}</div>
        `

    // Create order products
    const orderProducts = document.createElement("div")
    orderProducts.className = "order-products"

    order.items.forEach((item) => {
      const productElement = document.createElement("div")
      productElement.className = "order-product"
      productElement.innerHTML = `
                <div class="order-product-name">${item.name}</div>
                <div class="order-product-quantity">x${item.quantity}</div>
                <div class="order-product-price">GH₵${(item.price * item.quantity).toFixed(2)}</div>
            `

      orderProducts.appendChild(productElement)
    })

    // Create order total
    const orderTotal = document.createElement("div")
    orderTotal.className = "order-total"
    orderTotal.textContent = `Total: GH₵${order.total.toFixed(2)}`

    // Create order phone
    const orderPhone = document.createElement("div")
    orderPhone.className = "order-phone"
    orderPhone.textContent = `Customer Phone: ${order.phone}`

    // Create order actions
    const orderActions = document.createElement("div")
    orderActions.className = "order-actions"
    orderActions.innerHTML = `
            <button class="delete-order-btn" data-id="${order.id}">Delete Order</button>
        `

    // Append all elements to order
    orderElement.appendChild(orderHeader)
    orderElement.appendChild(orderProducts)
    orderElement.appendChild(orderTotal)
    orderElement.appendChild(orderPhone)
    orderElement.appendChild(orderActions)

    // Append order to container
    ordersContainer.appendChild(orderElement)
  })
}

function setupAdminFunctionality() {
  const ordersContainer = document.querySelector(".orders-container")

  if (!ordersContainer) return

  // Delete order button
  ordersContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-order-btn")) {
      const orderId = e.target.dataset.id
      showDeleteConfirmation(orderId)
    }
  })
}

function showDeleteConfirmation(orderId) {
  // Create modal overlay
  const modalOverlay = document.createElement("div")
  modalOverlay.className = "modal-overlay"

  // Create modal
  const modal = document.createElement("div")
  modal.className = "modal"

  // Create modal content
  modal.innerHTML = `
        <div class="modal-header">
            <h3 class="modal-title">Confirm Deletion</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <p>Are you sure you want to delete order <strong>${orderId}</strong>?</p>
            <p>This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
            <button class="modal-btn modal-btn-cancel">Cancel</button>
            <button class="modal-btn modal-btn-confirm">Delete</button>
        </div>
    `

  // Append modal to overlay
  modalOverlay.appendChild(modal)

  // Append overlay to body
  document.body.appendChild(modalOverlay)

  // Show modal
  setTimeout(() => {
    modalOverlay.classList.add("active")
  }, 10)

  // Cancel button
  modal.querySelector(".modal-btn-cancel").addEventListener("click", () => {
    modalOverlay.classList.remove("active")
    setTimeout(() => {
      modalOverlay.remove()
    }, 300)
  })

  // Delete button
  modal.querySelector(".modal-btn-confirm").addEventListener("click", () => {
    deleteOrder(orderId)
    modalOverlay.classList.remove("active")
    setTimeout(() => {
      modalOverlay.remove()
    }, 300)
  })

  // Close modal on X click
  modal.querySelector(".modal-close").addEventListener("click", () => {
    modalOverlay.classList.remove("active")
    setTimeout(() => {
      modalOverlay.remove()
    }, 300)
  })
}

function deleteOrder(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders")) || []
  const updatedOrders = orders.filter((order) => order.id !== orderId)
  localStorage.setItem("orders", JSON.stringify(updatedOrders))
  displayOrders()
}
