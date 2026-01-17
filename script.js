(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  var bus = window.__app;

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var args = arguments;
      var context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() { inThrottle = false; }, limit);
      }
    };
  }

  function initBurger() {
    if (bus.burgerInited) return;
    bus.burgerInited = true;

    var toggle = document.querySelector('.navbar-toggler, .c-nav__toggle');
    var navbarCollapse = document.querySelector('.navbar-collapse');
    var body = document.body;

    if (!toggle || !navbarCollapse) return;

    function openMenu() {
      navbarCollapse.classList.add('is-open', 'show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
    }

    function closeMenu() {
      navbarCollapse.classList.remove('is-open', 'show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (navbarCollapse.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navbarCollapse.classList.contains('is-open')) {
        closeMenu();
      }
    });

    document.addEventListener('click', function(e) {
      var header = document.querySelector('.l-header');
      if (header && !header.contains(e.target) && navbarCollapse.classList.contains('is-open')) {
        closeMenu();
      }
    });

    var navLinks = document.querySelectorAll('.nav-link, .c-nav__link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        closeMenu();
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && navbarCollapse.classList.contains('is-open')) {
        closeMenu();
      }
    }, 150);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function initSmoothScroll() {
    if (bus.smoothScrollInited) return;
    bus.smoothScrollInited = true;

    function getHeaderHeight() {
      var header = document.querySelector('.l-header');
      return header ? header.offsetHeight : 72;
    }

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      var href = target.getAttribute('href');
      if (!href || !href.startsWith('#') || href === '#' || href === '#!') return;

      var targetId = href.substring(1);
      var targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        var offset = getHeaderHeight();
        var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  }

  function initActiveMenu() {
    if (bus.activeMenuInited) return;
    bus.activeMenuInited = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.nav-link, .c-nav__link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkPath = link.getAttribute('href');

      link.removeAttribute('aria-current');
      link.classList.remove('active');

      if (linkPath === currentPath || 
          (currentPath === '/' && linkPath === '/index.html') ||
          (currentPath === '/index.html' && linkPath === '/')) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    }
  }

  function initScrollSpy() {
    if (bus.scrollSpyInited) return;
    bus.scrollSpyInited = true;

    var sections = document.querySelectorAll('section[id]');
    if (sections.length === 0) return;

    function getHeaderHeight() {
      var header = document.querySelector('.l-header');
      return header ? header.offsetHeight : 72;
    }

    function updateActiveLink() {
      var scrollPos = window.pageYOffset + getHeaderHeight() + 50;
      var currentSection = null;

      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var sectionTop = section.offsetTop;
        var sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          currentSection = section.getAttribute('id');
          break;
        }
      }

      var navLinks = document.querySelectorAll('.nav-link, .c-nav__link');
      for (var j = 0; j < navLinks.length; j++) {
        var link = navLinks[j];
        var href = link.getAttribute('href');
        
        link.classList.remove('active');
        link.removeAttribute('aria-current');

        if (href && href.startsWith('#') && currentSection && href === '#' + currentSection) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      }
    }

    var scrollHandler = throttle(updateActiveLink, 100);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    updateActiveLink();
  }

  function initHeaderScroll() {
    if (bus.headerScrollInited) return;
    bus.headerScrollInited = true;

    var header = document.querySelector('.l-header');
    if (!header) return;

    function updateHeader() {
      if (window.pageYOffset > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    var scrollHandler = throttle(updateHeader, 100);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    updateHeader();
  }

  function initImages() {
    if (bus.imagesInited) return;
    bus.imagesInited = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      var isCritical = img.hasAttribute('data-critical') || img.classList.contains('c-logo__img');
      if (!isCritical && !img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function() {
        var failedImg = this;
        var placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e0e0e0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E';
        failedImg.src = placeholder;
      });
    }
  }

  bus.notify = function(message, type) {
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.setAttribute('role', 'region');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'alert alert-' + (type || 'info') + ' alert-dismissible fade show';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = message + '<button type="button" class="btn-close" aria-label="Close"></button>';

    var closeBtn = toast.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        toast.classList.remove('show');
        setTimeout(function() {
          if (toast.parentNode) {
            container.removeChild(toast);
          }
        }, 150);
      });
    }

    container.appendChild(toast);

    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() {
        if (toast.parentNode) {
          container.removeChild(toast);
        }
      }, 150);
    }, 5000);
  };

  function validateField(field) {
    var name = field.name || field.id;
    var value = field.value.trim();
    var type = field.type;
    var errorElement = document.getElementById(field.id + 'Error') || field.parentElement.querySelector('.c-form__error');

    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('is-visible');
    }

    field.classList.remove('has-error');

    if (field.hasAttribute('required') && !value) {
      if (errorElement) {
        errorElement.textContent = 'This field is required';
        errorElement.classList.add('is-visible');
      }
      field.classList.add('has-error');
      return false;
    }

    if (type === 'email' && value) {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        if (errorElement) {
          errorElement.textContent = 'Please enter a valid email address';
          errorElement.classList.add('is-visible');
        }
        field.classList.add('has-error');
        return false;
      }
    }

    if (name === 'name' && value && value.length < 2) {
      if (errorElement) {
        errorElement.textContent = 'Name must be at least 2 characters';
        errorElement.classList.add('is-visible');
      }
      field.classList.add('has-error');
      return false;
    }

    if (type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      if (errorElement) {
        errorElement.textContent = 'You must accept this';
        errorElement.classList.add('is-visible');
      }
      field.classList.add('has-error');
      return false;
    }

    return true;
  }

  function initForms() {
    if (bus.formsInited) return;
    bus.formsInited = true;

    var pollForm = document.getElementById('pollForm');
    if (pollForm) {
      pollForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var radios = pollForm.querySelectorAll('input[type="radio"]');
        var selected = false;
        for (var i = 0; i < radios.length; i++) {
          if (radios[i].checked) {
            selected = true;
            break;
          }
        }

        var errorElement = pollForm.querySelector('.c-form__error');
        if (!selected) {
          if (errorElement) {
            errorElement.textContent = 'Please select an option';
            errorElement.classList.add('is-visible');
          }
          return;
        }

        if (errorElement) {
          errorElement.textContent = '';
          errorElement.classList.remove('is-visible');
        }

        var submitBtn = pollForm.querySelector('button[type="submit"]');
        var originalText = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Submitting...';
        }

        setTimeout(function() {
          bus.notify('Thank you for your feedback!', 'success');
          pollForm.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
        }, 800);
      });
    }

    var brochureForm = document.getElementById('brochureForm');
    if (brochureForm) {
      brochureForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var nameField = document.getElementById('brochureName');
        var emailField = document.getElementById('brochureEmail');
        var privacyField = document.getElementById('brochurePrivacy');

        var isValid = true;

        if (nameField && !validateField(nameField)) {
          isValid = false;
        }

        if (emailField && !validateField(emailField)) {
          isValid = false;
        }

        if (privacyField && !validateField(privacyField)) {
          isValid = false;
        }

        if (!isValid) return;

        var submitBtn = brochureForm.querySelector('button[type="submit"]');
        var originalText = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Sending...';
        }

        setTimeout(function() {
          window.location.href = 'thank_you.html';
        }, 1000);
      });

      var formFields = [
        document.getElementById('brochureName'),
        document.getElementById('brochureEmail'),
        document.getElementById('brochurePrivacy')
      ];

      for (var i = 0; i < formFields.length; i++) {
        if (formFields[i]) {
          formFields[i].addEventListener('blur', function() {
            validateField(this);
          });
        }
      }
    }

    var genericForms = document.querySelectorAll('.c-form:not(#pollForm):not(#brochureForm)');
    for (var j = 0; j < genericForms.length; j++) {
      var form = genericForms[j];
      form.addEventListener('submit', function(e) {
        e.preventDefault();

        var fields = this.querySelectorAll('input, textarea, select');
        var isValid = true;

        for (var k = 0; k < fields.length; k++) {
          if (!validateField(fields[k])) {
            isValid = false;
          }
        }

        if (!isValid) return;

        var submitBtn = this.querySelector('button[type="submit"]');
        var originalText = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Sending...';
        }

        setTimeout(function() {
          window.location.href = 'thank_you.html';
        }, 1000);
      });
    }
  }

  function initScrollToTop() {
    if (bus.scrollToTopInited) return;
    bus.scrollToTopInited = true;

    var scrollTopButtons = document.querySelectorAll('[href="#top"], .scroll-to-top');
    
    for (var i = 0; i < scrollTopButtons.length; i++) {
      scrollTopButtons[i].addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  function initPrivacyModal() {
    if (bus.privacyModalInited) return;
    bus.privacyModalInited = true;

    var privacyLinks = document.querySelectorAll('a[href*="privacy"], a[href*="Privacy"]');
    
    for (var i = 0; i < privacyLinks.length; i++) {
      var link = privacyLinks[i];
      var href = link.getAttribute('href');
      
      if (href && (href.indexOf('privacy') !== -1 || href.indexOf('Privacy') !== -1) && href.indexOf('.html') === -1 && href !== '#') {
        link.setAttribute('href', 'privacy.html');
      }
    }
  }

  function initAccessibility() {
    if (bus.a11yInited) return;
    bus.a11yInited = true;

    var interactiveElements = document.querySelectorAll('a, button, input, select, textarea');
    
    for (var i = 0; i < interactiveElements.length; i++) {
      var el = interactiveElements[i];
      
      if (el.tagName === 'A' && !el.hasAttribute('href')) {
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
      }

      if ((el.tagName === 'BUTTON' || el.tagName === 'A') && !el.hasAttribute('aria-label') && !el.textContent.trim()) {
        el.setAttribute('aria-label', 'Interactive element');
      }
    }
  }

  bus.init = function() {
    if (bus.initialized) return;
    bus.initialized = true;

    initBurger();
    initSmoothScroll();
    initActiveMenu();
    initScrollSpy();
    initHeaderScroll();
    initImages();
    initForms();
    initScrollToTop();
    initPrivacyModal();
    initAccessibility();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bus.init);
  } else {
    bus.init();
  }

})();
