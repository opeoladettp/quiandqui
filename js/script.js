document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. State & Variables (Declared at top)
  // ==========================================
  let isScrolling = false;
  let toastTimeout = null;

  // Select DOM Elements
  const header = document.getElementById('header');
  const themeToggle = document.getElementById('theme-toggle');
  const menuBtn = document.getElementById('menu-btn');
  const drawerClose = document.getElementById('drawer-close');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTop = document.getElementById('back-to-top');
  
  // Parallax elements (hero overlay text only — bg removed in v2)
  const heroOverlayText = document.getElementById('hero-overlay-text');
  const heroImg = document.querySelector('.hero-img');
  
  // Form elements
  const contactForm = document.getElementById('contact-form');
  const formSubmit = document.getElementById('form-submit');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // Query section elements for navigation highlighting
  const sections = document.querySelectorAll('section');

  // ==========================================
  // 2. Utility & Helper Functions
  // ==========================================
  
  // Toast Notification System
  function showToast(message, type = 'success') {
    if (!toast || !toastText) return;
    
    // Clear existing timeout
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    
    const toastIcon = toast.querySelector('.toast-icon');
    if (toastIcon) {
      if (type === 'error') {
        toastIcon.textContent = 'error';
        toastIcon.style.color = '#ef4444';
        toast.style.borderColor = '#ef4444';
      } else {
        toastIcon.textContent = 'check_circle';
        toastIcon.style.color = 'var(--accent-gold)';
        toast.style.borderColor = 'var(--accent-gold)';
      }
    }

    toastText.textContent = message;
    toast.classList.add('show');
    
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
      toastTimeout = null;
    }, 4000);
  }

  // Email Validation helper
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  // Theme Icon Updater
  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const iconSpan = themeToggle.querySelector('.material-symbols-outlined');
    if (iconSpan) {
      iconSpan.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
    }
  }

  // Navigation Link Highlighting
  function highlightNavSection() {
    let currentSectionId = '';
    const scrollPos = window.scrollY + window.innerHeight / 3;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    // Update Desktop Nav Links
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });

    // Update Mobile Drawer Links
    drawerLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }

  // Mobile navigation drawer toggle
  const openDrawer = () => {
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; 
  };

  const closeDrawer = () => {
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Scroll Actions Handler
  function handleScrollEffects() {
    const scrollY = window.scrollY;
    
    // Header scrolled class
    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Subtle parallax on hero image (Ken Burns effect via scroll)
    if (heroImg) {
      const shift = Math.min(scrollY * 0.08, 40);
      heroImg.style.transform = `scale(1.04) translateY(${shift}px)`;
    }

    // Parallax hero overlay text
    if (heroOverlayText) {
      heroOverlayText.style.transform = `translateY(${-scrollY * 0.15}px) translateX(${scrollY * 0.05}px)`;
    }

    // Back to top visibility
    if (backToTop) {
      if (scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
    
    // Highlight nav
    highlightNavSection();
  }

  // ==========================================
  // 3. Theme Toggle Setup
  // ==========================================
  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
      showToast(`Switched to ${newTheme} mode.`);
    });
  }

  // ==========================================
  // 4. Navigation Event Listeners
  // ==========================================
  if (menuBtn) menuBtn.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Scroll listener using requestAnimationFrame for performance
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        handleScrollEffects();
        isScrolling = false;
      });
      isScrolling = true;
    }
  });

  // Run scroll effects initially to set correct classes
  handleScrollEffects();

  // ==========================================
  // 5. Intersection Observer (Reveal-on-Scroll)
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Unobserve once revealed
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ==========================================
  // 6. Contact Form Submission
  // ==========================================
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const serviceSelect = document.getElementById('form-service');
      const messageInput = document.getElementById('form-message');

      // Client Side Validation
      if (!nameInput.value.trim() || !emailInput.value.trim() || !serviceSelect.value || !messageInput.value.trim()) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      if (!validateEmail(emailInput.value)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      // Enter Loading State
      const originalBtnText = formSubmit.innerHTML;
      formSubmit.disabled = true;
      formSubmit.innerHTML = `
        Sending Inquiry...
        <span class="material-symbols-outlined" style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle;">sync</span>
      `;

      // Simulate API submit delay
      setTimeout(() => {
        showToast('Inquiry sent successfully. An advisor will contact you within 24 hours.');
        contactForm.reset();
        
        // Restore Button
        formSubmit.disabled = false;
        formSubmit.innerHTML = originalBtnText;
      }, 1500);
    });
  }
});

// CSS spin animation helper (inserted programmatically for button loading state)
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
