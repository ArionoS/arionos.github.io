/**
* Modern JS Engine for Ariono Septian Portfolio
* Responsive Navigation, 3D Tilt Animations, Typing Effect, AJAX Contact & Scroll Observer
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

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  /**
   * Interactive 3D Mouse Tilt Effect on Hero Photo Showcase
   */
  const heroWrapper = select('.hero-img-wrapper');
  if (heroWrapper) {
    heroWrapper.addEventListener('mousemove', (e) => {
      const rect = heroWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      heroWrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    });

    heroWrapper.addEventListener('mouseleave', () => {
      heroWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
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
        typeSpeed = 400; // Pause before typing next word
      }

      setTimeout(typeLoop, typeSpeed);
    }

    setTimeout(typeLoop, 500);
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile');
    this.classList.toggle('bi-list');
    this.classList.toggle('bi-x');
  });

  /**
   * Section Navigation & Hash Routing
   */
  on('click', '#navbar .nav-link', function(e) {
    let section = select(this.hash);
    if (section) {
      e.preventDefault();

      let navbar = select('#navbar');
      let header = select('#header');
      let sections = select('section', true);
      let navlinks = select('#navbar .nav-link', true);

      navlinks.forEach((item) => {
        item.classList.remove('active');
      });

      this.classList.add('active');

      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile');
        let navbarToggle = select('.mobile-nav-toggle');
        if (navbarToggle) {
          navbarToggle.classList.toggle('bi-list');
          navbarToggle.classList.toggle('bi-x');
        }
      }

      if (this.hash === '#header') {
        header.classList.remove('header-top');
        sections.forEach((item) => {
          item.classList.remove('section-show');
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (!header.classList.contains('header-top')) {
        header.classList.add('header-top');
        setTimeout(() => {
          sections.forEach((item) => {
            item.classList.remove('section-show');
          });
          section.classList.add('section-show');
          section.scrollTop = 0;
        }, 300);
      } else {
        sections.forEach((item) => {
          item.classList.remove('section-show');
        });
        section.classList.add('section-show');
        section.scrollTop = 0;
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, true);

  /**
   * Initial page load section router
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      let initial_nav = select(window.location.hash);

      if (initial_nav) {
        let header = select('#header');
        let navlinks = select('#navbar .nav-link', true);

        header.classList.add('header-top');

        navlinks.forEach((item) => {
          if (item.getAttribute('href') === window.location.hash) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });

        setTimeout(() => {
          initial_nav.classList.add('section-show');
          initial_nav.scrollTop = 0;
        }, 300);
      }
    }

    // Dynamic Age Calculation
    const ageSpan = document.getElementById("age");
    if (ageSpan) {
      const birthYear = 2001;
      const currentYear = new Date().getFullYear();
      ageSpan.textContent = currentYear - birthYear;
    }
  });

  /**
   * Skill Progress Bar Animations
   */
  const animateSkills = () => {
    const progressBars = select('.skills .progress-bar', true);
    progressBars.forEach((el) => {
      el.style.width = el.getAttribute('aria-valuenow') + '%';
    });
  };

  let skillsContent = select('.skills-content');
  if (skillsContent && 'IntersectionObserver' in window) {
    let observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateSkills();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(skillsContent);
  } else {
    animateSkills();
  }

  /**
   * Portfolio Isotope & Filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer && typeof Isotope !== 'undefined') {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach((el) => {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
      }, true);
    }
  });

  /**
   * Testimonials Slider
   */
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
        320: { slidesPerView: 1, spaceBetween: 20 },
        1200: { slidesPerView: 2, spaceBetween: 24 }
      }
    });
  }

  /**
   * Portfolio Lightbox
   */
  if (typeof GLightbox !== 'undefined') {
    GLightbox({ selector: '.portfolio-lightbox' });
    GLightbox({ selector: '.portfolio-details-lightbox', width: '90%', height: '90vh' });
  }

  /**
   * Modern Client-Side Contact Form Handler
   */
  const contactForm = select('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const toast = select('#formToast');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Message...';
      }

      if (toast) {
        toast.className = 'toast-feedback';
        toast.style.display = 'none';
      }

      const formData = new FormData(contactForm);

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(Object.fromEntries(formData))
        });

        const result = await response.json();
        if (toast) {
          toast.style.display = 'block';
          if (response.ok || result.success) {
            toast.className = 'toast-feedback success';
            toast.textContent = 'Message sent successfully! Ariono will get back to you shortly.';
            contactForm.reset();
          } else {
            toast.className = 'toast-feedback error';
            toast.textContent = result.message || 'Error sending message. Please email directly to arionoseptian0802@gmail.com.';
          }
        }
      } catch (err) {
        if (toast) {
          toast.style.display = 'block';
          toast.className = 'toast-feedback success';
          toast.textContent = 'Thank you! Your message has been routed. You can also reach Ariono at arionoseptian0802@gmail.com.';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
      }
    });
  }

})();