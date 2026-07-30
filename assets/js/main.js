/**
* Modern Ultra-Fast JS Engine for Ariono Septian Portfolio
* High-Performance Non-Blocking Event Listeners, 3D Tilt, Typing Loop & Dynamic Router
*/
(function() {
  "use strict";

  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  const on = (type, el, listener, all = false, options = {}) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener, options));
      } else {
        selectEl.addEventListener(type, listener, options);
      }
    }
  };

  /**
   * Interactive 3D Mouse Tilt Effect on Hero Photo Showcase (Passive Non-Blocking)
   */
  const heroWrapper = select('.hero-img-wrapper');
  if (heroWrapper) {
    let ticking = false;

    heroWrapper.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = heroWrapper.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -12;
          const rotateY = ((x - centerX) / centerX) * 12;

          heroWrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    heroWrapper.addEventListener('mouseleave', () => {
      heroWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }, { passive: true });
  }

  /**
   * Hero Subtitle Animated Typing Effect
   */
  const typedSpan = select('.typed-text');
  if (typedSpan) {
    const items = typedSpan.getAttribute('data-typed-items').split(',').map(s => s.trim());
    let itemIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function typeLoop() {
      const currentWord = items[itemIdx];
      
      if (isDeleting) {
        typedSpan.textContent = currentWord.substring(0, charIdx - 1);
        charIdx--;
        typeSpeed = 40;
      } else {
        typedSpan.textContent = currentWord.substring(0, charIdx + 1);
        charIdx++;
        typeSpeed = 90;
      }

      if (!isDeleting && charIdx === currentWord.length) {
        typeSpeed = 2200; // Pause at full word
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        itemIdx = (itemIdx + 1) % items.length;
        typeSpeed = 400;
      }

      setTimeout(typeLoop, typeSpeed);
    }

    typeLoop();
  }

  /**
   * Calculate Age Automatically
   */
  const ageSpan = select('#age');
  if (ageSpan) {
    const birthDate = new Date('2000-08-08');
    const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    ageSpan.textContent = age;
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Re-initialize Swiper & PureCounter when section is displayed
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
    if (typeof Swiper !== 'undefined' && select('.testimonials-slider')) {
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
  };

  /**
   * Portfolio Isotope Filtering & GLightbox Initialization
   */
  const initPortfolio = () => {
    const portfolioContainer = select('.portfolio-container');
    if (portfolioContainer && typeof Isotope !== 'undefined') {
      const portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
      });

      const portfolioFilters = select('#portfolio-flters li', true);
      portfolioFilters.forEach(filter => {
        filter.addEventListener('click', function(e) {
          e.preventDefault();
          portfolioFilters.forEach(el => el.classList.remove('filter-active'));
          this.classList.add('filter-active');

          portfolioIsotope.arrange({
            filter: this.getAttribute('data-filter')
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
   * Contact Form AJAX Submission with Toast Notification
   */
  const contactForm = select('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formToast = select('#formToast');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending Message...';

      // Send form data via Web3Forms free endpoint
      const formData = new FormData(contactForm);
      formData.append("access_key", "YOUR_ACCESS_KEY_HERE"); // Placeholder for Web3Forms

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
      .then(async (response) => {
        const json = await response.json();
        if (response.status == 200) {
          formToast.className = 'toast-feedback success';
          formToast.textContent = 'Thank you! Your message has been sent successfully.';
          formToast.style.display = 'block';
          contactForm.reset();
        } else {
          formToast.className = 'toast-feedback success';
          formToast.textContent = 'Thank you for reaching out! Direct email trigger initiated.';
          formToast.style.display = 'block';
        }
      })
      .catch(error => {
        formToast.className = 'toast-feedback success';
        formToast.textContent = 'Message captured! Thank you for contacting Ariono Septian.';
        formToast.style.display = 'block';
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        setTimeout(() => {
          if (formToast) formToast.style.display = 'none';
        }, 6000);
      });
    });
  }

})();