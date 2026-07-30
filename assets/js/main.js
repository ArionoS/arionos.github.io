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
   * Contact Form Submission Handling
   */
  const contactForm = select('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formToast = select('#formToast');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Message Received!';

      formToast.className = 'toast-feedback success';
      formToast.style.display = 'block';
      formToast.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Thank you! Your message has been sent successfully. I will get back to you shortly.';

      contactForm.reset();

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }, 4000);
    });
  }

})();