document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    // Close menu when link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }

  // Price Calculator Elements
  const coalSelect = document.getElementById('coal-type');
  const packagingSelect = document.getElementById('packaging');
  const quantityInput = document.getElementById('quantity');
  const qtyLabel = document.getElementById('qty-label');
  const zoneSelect = document.getElementById('zone');
  const bunkerCheckbox = document.getElementById('bunker-service');

  const subtotalEl = document.getElementById('subtotal-val');
  const deliveryEl = document.getElementById('delivery-val');
  const handlingEl = document.getElementById('handling-val');
  const totalEl = document.getElementById('total-val');
  const directWhatsAppBtn = document.getElementById('direct-whatsapp-quote');

  // Handle Packaging Change (Kg vs Bags vs Bulk Tonne)
  packagingSelect.addEventListener('change', () => {
    if (packagingSelect.value === 'bulk') {
      qtyLabel.textContent = 'मात्रा (टन / ट्रैक्टर लोड)';
      quantityInput.value = '1';
      quantityInput.min = '0.5';
      quantityInput.max = '30';
      quantityInput.step = '0.5';
    } else if (packagingSelect.value === 'kg') {
      qtyLabel.textContent = 'मात्रा (किलोग्राम - Kg)';
      quantityInput.value = '20';
      quantityInput.min = '5';
      quantityInput.max = '500';
      quantityInput.step = '1';
    } else {
      qtyLabel.textContent = 'मात्रा (बोरी संख्या)';
      quantityInput.value = '10';
      quantityInput.min = '1';
      quantityInput.max = '500';
      quantityInput.step = '1';
    }
    updateQuote();
  });

  // Calculate Function in Indian Rupees (₹)
  function updateQuote() {
    const pkgMode = packagingSelect.value;
    const baseBagPrice = parseFloat(coalSelect.value);
    const qty = parseFloat(quantityInput.value) || 0;

    let subtotal = 0;
    if (pkgMode === 'bulk') {
      // 1 Tonne ≈ 20 bags of 50kg. Wholesale discount factored
      const pricePerTonne = (baseBagPrice * 20) * 0.90;
      subtotal = pricePerTonne * qty;
    } else if (pkgMode === 'kg') {
      // Retail loose per kg: 1 bag = 50kg, small markup for loose weighment
      const pricePerKg = Math.round((baseBagPrice / 50) * 1.1);
      subtotal = pricePerKg * qty;
    } else {
      subtotal = baseBagPrice * qty;
    }

    // Transport (Bhada) calculation
    let deliveryFee = 0;
    const zoneVal = zoneSelect.value;
    if (zoneVal === 'pickup') {
      deliveryFee = 0;
    } else {
      const baseZone = parseFloat(zoneVal);
      // Small retail kg load auto fee vs bulk
      if (pkgMode === 'kg') {
        deliveryFee = qty < 50 ? Math.min(baseZone, 150) : baseZone;
      } else if (pkgMode === 'bulk' && qty > 2) {
        deliveryFee = baseZone * 1.5;
      } else {
        deliveryFee = baseZone;
      }
    }

    // Palledaar / Hamali labor
    let handlingFee = 0;
    if (bunkerCheckbox.checked) {
      if (pkgMode === 'bulk') {
        handlingFee = 250 * qty; // per tonne manual stacking
      } else if (pkgMode === 'kg') {
        handlingFee = 50; // nominal carry-in
      } else {
        handlingFee = qty > 25 ? 300 : 150;
      }
    }

    const total = subtotal + deliveryFee + handlingFee;

    // Format Indian Rupee numbers
    subtotalEl.textContent = `₹${Math.round(subtotal).toLocaleString('en-IN')}`;
    deliveryEl.textContent = `₹${Math.round(deliveryFee).toLocaleString('en-IN')}`;
    handlingEl.textContent = `₹${Math.round(handlingFee).toLocaleString('en-IN')}`;
    totalEl.textContent = `₹${Math.round(total).toLocaleString('en-IN')}`;

    // Update direct WhatsApp link in Hindi
    if (directWhatsAppBtn) {
      const selectedOption = coalSelect.options[coalSelect.selectedIndex];
      const coalName = selectedOption.getAttribute('data-name') || selectedOption.text;
      let packagingText = 'बोरी';
      if (pkgMode === 'bulk') packagingText = 'टन';
      if (pkgMode === 'kg') packagingText = 'किलो (Kg)';
      const zoneName = zoneSelect.options[zoneSelect.selectedIndex].text;
      
      const msg = encodeURIComponent(
        `नमस्ते सोनी कोल डिपो (दुर्ग)!\n` +
        `मैंने आपकी वेबसाइट पर यह रेट देखा है:\n` +
        `• कोयला: ${coalName}\n` +
        `• मात्रा: ${qty} ${packagingText}\n` +
        `• डिलीवरी क्षेत्र: ${zoneName}\n` +
        `• कुल अनुमानित खर्च: ₹${Math.round(total).toLocaleString('en-IN')}\n\n` +
        `कृपया गाड़ी और डिलीवरी का समय बताएं।`
      );
      directWhatsAppBtn.href = `https://wa.me/919826012345?text=${msg}`;
    }
  }

  // Event Listeners for calculator
  coalSelect.addEventListener('change', updateQuote);
  quantityInput.addEventListener('input', updateQuote);
  zoneSelect.addEventListener('change', updateQuote);
  bunkerCheckbox.addEventListener('change', updateQuote);

  // Initial Calculation
  updateQuote();

  // "Select for Estimate" buttons in Product Cards
  const productButtons = document.querySelectorAll('.select-product-btn');
  productButtons.forEach(button => {
    button.addEventListener('click', () => {
      const productPrice = button.getAttribute('data-price');
      if (coalSelect) {
        coalSelect.value = productPrice;
        updateQuote();
        const calcSection = document.getElementById('calculator');
        if (calcSection) {
          calcSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Transfer Quote Details to Contact Booking Form
  const bookQuoteBtn = document.getElementById('book-quote-btn');
  const orderDetailsInput = document.getElementById('order-details');
  const contactSection = document.getElementById('contact');

  if (bookQuoteBtn && orderDetailsInput) {
    bookQuoteBtn.addEventListener('click', () => {
      const selectedOption = coalSelect.options[coalSelect.selectedIndex];
      const coalName = selectedOption.getAttribute('data-name') || selectedOption.text;
      const pkgMode = packagingSelect.value;
      let packaging = 'बोरी';
      if (pkgMode === 'bulk') packaging = 'टन';
      if (pkgMode === 'kg') packaging = 'किलो (Kg)';
      const qty = quantityInput.value;
      const zoneName = zoneSelect.options[zoneSelect.selectedIndex].text;
      const totalEstimated = totalEl.textContent;
      const bunker = bunkerCheckbox.checked ? 'हां (पल्लेदार द्वारा चिनवाना है)' : 'गाड़ी से सीधा खाली';

      orderDetailsInput.value = `आर्डर विवरण:
- कोयले का प्रकार: ${coalName}
- मात्रा: ${qty} ${packaging}
- डिलीवरी क्षेत्र: ${zoneName}
- हमाली/पल्लेदार: ${bunker}
- कुल अनुमानित राशि: ${totalEstimated}`;

      contactSection.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('cust-name').focus();
    });
  }

  // Send WhatsApp via Booking Form
  const sendWhatsAppBtn = document.getElementById('send-whatsapp-btn');
  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener('click', () => {
      const name = document.getElementById('cust-name').value || 'ग्राहक';
      const phone = document.getElementById('cust-phone').value || '';
      const address = document.getElementById('cust-address').value || 'दुर्ग/भिलाई';
      const details = document.getElementById('order-details').value || '';

      const waMsg = encodeURIComponent(
        `नमस्ते सोनी कोल डिपो (दुर्ग),\n` +
        `• नाम/फर्म: ${name}\n` +
        `• मोबाइल नंबर: ${phone}\n` +
        `• डिलीवरी पता: ${address}\n\n` +
        `• आर्डर विवरण:\n${details}`
      );
      window.open(`https://wa.me/919826012345?text=${waMsg}`, '_blank');
    });
  }

  // Booking Form Submission Demo
  const bookingForm = document.getElementById('delivery-booking-form');
  const confirmationMsg = document.getElementById('booking-confirmation');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      confirmationMsg.classList.remove('hidden');
      bookingForm.reset();
      
      setTimeout(() => {
        confirmationMsg.classList.add('hidden');
      }, 10000);
    });
  }
});
