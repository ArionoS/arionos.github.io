/**
* Main JavaScript File for Ariono Septian Portfolio
* High-Performance Single Page Application (SPA) Router & Micro-Animations
*/
(function() {
  "use strict";

  /**
   * Helper Selector Functions
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener, { passive: true }));
      } else {
        selectEl.addEventListener(type, listener, { passive: true });
      }
    }
  };

  /**
   * 3D Tilt Micro-Animation Throttled via RequestAnimationFrame
   */
  const heroWrapper = select('.hero-img-wrapper');
  if (heroWrapper) {
    let ticking = false;
    let mouseX = 0, mouseY = 0;

    heroWrapper.addEventListener('mousemove', (e) => {
      const rect = heroWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX = (x / rect.width - 0.5) * 16;
      mouseY = (y / rect.height - 0.5) * -16;

      if (!ticking) {
        requestAnimationFrame(() => {
          heroWrapper.style.transform = `rotateY(${mouseX}deg) rotateX(${mouseY}deg)`;
          ticking = false;
        });
        ticking = true;
      }
    });

    heroWrapper.addEventListener('mouseleave', () => {
      requestAnimationFrame(() => {
        heroWrapper.style.transform = 'rotateY(0deg) rotateX(0deg)';
      });
    });
  }

  /**
   * Typed Text Subtitle Loop
   */
  const typedEl = select('.typed-text');
  if (typedEl) {
    let items = typedEl.getAttribute('data-typed-items');
    items = items.split(',');
    let itemIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 90;

    function typeLoop() {
      const currentItem = items[itemIndex].trim();

      if (isDeleting) {
        typedEl.textContent = currentItem.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 40;
      } else {
        typedEl.textContent = currentItem.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 90;
      }

      if (!isDeleting && charIndex === currentItem.length) {
        typeSpeed = 2200; // Pause at end of word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        itemIndex = (itemIndex + 1) % items.length;
        typeSpeed = 450;
      }

      setTimeout(typeLoop, typeSpeed);
    }

    typeLoop();
  }

  /**
   * Single Page Application Section Navigation Router
   */
  const navLinks = select('#navbar .nav-link', true);
  const header = select('#header');
  const sections = select('section', true);

  const resetNav = () => {
    header.classList.remove('header-top');
    navLinks.forEach(item => {
      item.classList.remove('active');
    });
    const homeLink = select('#navbar a[href="#header"]');
    if (homeLink) homeLink.classList.add('active');

    sections.forEach(sec => {
      sec.classList.remove('section-show');
    });

    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const showSection = (hash) => {
    if (hash === '#header' || hash === '' || hash === '#') {
      resetNav();
      return;
    }

    const targetSection = select(hash);
    if (!targetSection) return;

    header.classList.add('header-top');
    navLinks.forEach(item => {
      if (item.getAttribute('href') === hash) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    sections.forEach(sec => {
      if ('#' + sec.id === hash) {
        sec.classList.add('section-show');
        sec.scrollTop = 0; // Reset internal section scroll
      } else {
        sec.classList.remove('section-show');
      }
    });

    // Re-layout Isotope smoothly if navigating to portfolio
    if (hash === '#portfolio' && window.portfolioIsotopeInstance) {
      setTimeout(() => {
        window.portfolioIsotopeInstance.layout();
      }, 50);
    }

    if (window.PureCounter) {
      new PureCounter();
    }
  };

  // Nav click handlers
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const hash = this.getAttribute('href');
      if (hash.startsWith('#')) {
        e.preventDefault();
        window.location.hash = hash;
        showSection(hash);

        // Close mobile navbar if open
        if (select('#navbar').classList.contains('navbar-mobile')) {
          select('#navbar').classList.remove('navbar-mobile');
          const toggle = select('.mobile-nav-toggle');
          if (toggle) {
            toggle.classList.toggle('bi-list');
            toggle.classList.toggle('bi-x');
          }
        }
      }
    });
  });

  // Handle URL Hash on Load or Change
  window.addEventListener('hashchange', () => {
    showSection(window.location.hash);
  });

  if (window.location.hash) {
    showSection(window.location.hash);
  }

  /**
   * Mobile Navigation Toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile');
    this.classList.toggle('bi-list');
    this.classList.toggle('bi-x');
  });

  /**
   * Testimonials Swiper Initialization
   */
  const initSwiper = () => {
    if (typeof Swiper !== 'undefined') {
      if (select('.testimonials-slider')) {
        new Swiper('.testimonials-slider', {
          speed: 600,
          loop: true,
          autoplay: {
            delay: 5000,
            disableOnInteraction: false
          },
          slidesPerView: 'auto',
          pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true
          },
          breakpoints: {
            320: {
              slidesPerView: 1,
              spaceBetween: 20
            },
            1200: {
              slidesPerView: 2,
              spaceBetween: 30
            }
          }
        });
      }
      
      if (select('.portfolio-swiper')) {
        new Swiper('.portfolio-swiper', {
          speed: 600,
          loop: true,
          autoplay: {
            delay: 4000,
            disableOnInteraction: false
          },
          pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }
        });
      }
    }
  };

  /**
   * Portfolio Isotope Filtering & GLightbox Initialization
   * Clean, Ultra-Smooth In-Place Scale & Fade Animation across EVERY filter tab
   */
  const initPortfolio = () => {
    const portfolioContainer = select('.portfolio-container');
    if (portfolioContainer && typeof Isotope !== 'undefined') {
      window.portfolioIsotopeInstance = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows',
        transitionDuration: '0.35s',
        hiddenStyle: {
          opacity: 0,
          transform: 'scale(0.85)'
        },
        visibleStyle: {
          opacity: 1,
          transform: 'scale(1)'
        }
      });

      const portfolioFilters = select('#portfolio-flters li', true);
      portfolioFilters.forEach(filter => {
        filter.addEventListener('click', function(e) {
          e.preventDefault();
          portfolioFilters.forEach(el => el.classList.remove('filter-active'));
          this.classList.add('filter-active');

          const filterValue = this.getAttribute('data-filter');

          // Trigger Isotope layout arrangement
          window.portfolioIsotopeInstance.arrange({
            filter: filterValue
          });

          // Reset subtle scale-fade animation class on all inner cards
          const allWraps = select('.portfolio-wrap', true);
          allWraps.forEach(wrap => {
            wrap.classList.remove('filter-animate');
            void wrap.offsetWidth; // force DOM reflow
          });

          // Stagger subtle scale-fade animation for active target cards
          const targetItems = filterValue === '*' 
            ? select('.portfolio-item', true) 
            : select(`.portfolio-item${filterValue}`, true);

          targetItems.forEach((item, idx) => {
            const wrap = item.querySelector('.portfolio-wrap');
            if (wrap) {
              setTimeout(() => {
                wrap.classList.add('filter-animate');
              }, idx * 30);
            }
          });
        });
      });
    }

    if (typeof GLightbox !== 'undefined') {
      GLightbox({
        selector: '.portfolio-lightbox'
      });
    }
  };

  // Run initializations on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    initSwiper();
    initPortfolio();
    if (window.PureCounter) {
      new PureCounter();
    }
  });

  /**
   * Firebase Realtime Database Integration & Contact Form Handling
   */
  const firebaseConfig = {
    databaseURL: "https://web-prof-4a520-default-rtdb.firebaseio.com",
    projectId: "web-prof-4a520"
  };

  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    try {
      firebase.initializeApp(firebaseConfig);
    } catch (err) {
      console.warn('Firebase init warning:', err);
    }
  }

  const contactForm = select('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const formToast = select('#formToast');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      const name = contactForm.querySelector('#name')?.value || '';
      const email = contactForm.querySelector('#email')?.value || '';
      const subject = contactForm.querySelector('#subject')?.value || '';
      const message = contactForm.querySelector('textarea[name="message"]')?.value || '';

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Sending...';

      const payload = {
        name,
        email,
        subject,
        message,
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      };

      let success = false;

      // Method 1: Firebase SDK
      if (typeof firebase !== 'undefined' && firebase.database) {
        try {
          await firebase.database().ref('messages').push(payload);
          success = true;
        } catch (sdkError) {
          console.warn('Firebase SDK submit failed, trying REST API fallback...', sdkError);
        }
      }

      // Method 2: Firebase REST API Fallback
      if (!success) {
        try {
          const res = await fetch("https://web-prof-4a520-default-rtdb.firebaseio.com/messages.json", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            success = true;
          }
        } catch (fetchErr) {
          console.error('Firebase REST API error:', fetchErr);
        }
      }

      if (success) {
        submitBtn.textContent = 'Message Sent!';
        if (formToast) {
          formToast.className = 'toast-feedback success';
          formToast.style.display = 'block';
          formToast.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Thank you! Your message has been saved to Firebase Realtime Database. I will get back to you shortly.';
        }
        contactForm.reset();
      } else {
        submitBtn.textContent = 'Send Message';
        if (formToast) {
          formToast.className = 'toast-feedback error';
          formToast.style.display = 'block';
          formToast.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>Submission error. Please check your Firebase Database Rules.';
        }
      }

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }, 4000);
    });
  }

  /**
   * Password-Protected Admin Firebase Inbox Logic
   */
  const ADMIN_PASSCODE = 'Husna901!@';
  let isAuthenticated = false;

  const messagesNavBtn = select('#messagesNavBtn');
  const adminPassModal = select('#adminPassModal');
  const adminInboxModal = select('#adminInboxModal');
  const adminPassForm = select('#adminPassForm');
  const adminPassInput = select('#adminPassInput');
  const passAuthError = select('#passAuthError');
  const inboxContainer = select('#inboxContainer');
  const inboxCountBadge = select('#inboxCountBadge');
  const refreshInboxBtn = select('#refreshInboxBtn');

  const getPassModal = () => bootstrap.Modal.getOrCreateInstance(adminPassModal);
  const getInboxModal = () => bootstrap.Modal.getOrCreateInstance(adminInboxModal);

  if (messagesNavBtn) {
    messagesNavBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (isAuthenticated) {
        getInboxModal().show();
        fetchFirebaseMessages();
      } else {
        if (passAuthError) passAuthError.style.display = 'none';
        if (adminPassInput) adminPassInput.value = '';
        getPassModal().show();
      }
    });
  }

  if (adminPassForm) {
    adminPassForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const entered = adminPassInput ? adminPassInput.value.trim() : '';
      if (entered === ADMIN_PASSCODE) {
        isAuthenticated = true;
        if (passAuthError) passAuthError.style.display = 'none';
        getPassModal().hide();
        getInboxModal().show();
        fetchFirebaseMessages();
      } else {
        if (passAuthError) passAuthError.style.display = 'block';
      }
    });
  }

  if (refreshInboxBtn) {
    refreshInboxBtn.addEventListener('click', function() {
      fetchFirebaseMessages();
    });
  }

  async function fetchFirebaseMessages() {
    if (!inboxContainer) return;
    inboxContainer.innerHTML = `
      <div class="text-center text-muted py-4">
        <div class="spinner-border text-info mb-2" role="status"></div>
        <p>Fetching messages from Firebase Realtime Database...</p>
      </div>`;

    let data = null;

    // Try SDK
    if (typeof firebase !== 'undefined' && firebase.database) {
      try {
        const snap = await firebase.database().ref('messages').once('value');
        data = snap.val();
      } catch (err) {
        console.warn('SDK fetch failed, trying REST API fallback...', err);
      }
    }

    // Try REST Fallback
    if (!data) {
      try {
        const res = await fetch("https://web-prof-4a520-default-rtdb.firebaseio.com/messages.json");
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {
        console.error('REST fetch failed:', err);
      }
    }

    renderInboxMessages(data);
  }

  function renderInboxMessages(data) {
    if (!data || Object.keys(data).length === 0) {
      if (inboxCountBadge) inboxCountBadge.textContent = '0 Messages';
      inboxContainer.innerHTML = `
        <div class="text-center text-muted py-5">
          <i class="bi bi-inbox fs-1 text-secondary mb-3 d-block"></i>
          <h5>No messages yet</h5>
          <p class="small">Contact form submissions from your website will appear here in real-time.</p>
        </div>`;
      return;
    }

    const keys = Object.keys(data).reverse(); // Newest first
    if (inboxCountBadge) inboxCountBadge.textContent = `${keys.length} Messages`;

    let html = '';
    keys.forEach(key => {
      const msg = data[key];
      const dateStr = msg.createdAt ? new Date(msg.createdAt).toLocaleString() : (msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'N/A');
      html += `
        <div class="message-card">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="text-white fw-bold mb-1"><i class="bi bi-person-fill text-info me-1"></i>${escapeHtml(msg.name || 'Anonymous')}</h6>
              <a href="mailto:${escapeHtml(msg.email || '')}" class="text-info small text-decoration-none me-3"><i class="bi bi-envelope me-1"></i>${escapeHtml(msg.email || 'No email')}</a>
              <span class="text-muted small"><i class="bi bi-clock me-1"></i>${dateStr}</span>
            </div>
            <button onclick="deleteFirebaseMessage('${key}')" class="btn btn-sm btn-outline-danger border-0" title="Delete Message"><i class="bi bi-trash"></i></button>
          </div>
          <div class="bg-dark p-2 rounded border border-secondary mb-2">
            <span class="text-white fw-semibold small">Subject:</span> <span class="text-light small">${escapeHtml(msg.subject || 'No Subject')}</span>
          </div>
          <p class="text-light small mb-0 style-message-body">${escapeHtml(msg.message || '')}</p>
        </div>`;
    });

    inboxContainer.innerHTML = html;
  }

  window.deleteFirebaseMessage = async function(key) {
    if (!confirm('Are you sure you want to delete this message from Firebase?')) return;
    try {
      if (typeof firebase !== 'undefined' && firebase.database) {
        await firebase.database().ref(`messages/${key}`).remove();
      } else {
        await fetch(`https://web-prof-4a520-default-rtdb.firebaseio.com/messages/${key}.json`, { method: 'DELETE' });
      }
      fetchFirebaseMessages();
    } catch (err) {
      alert('Failed to delete message: ' + err.message);
    }
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();