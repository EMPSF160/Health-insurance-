/* ==========================================================================
   ApexShield - Main Application Logic & Interactivity (Vanilla JS & jQuery)
   ========================================================================== */

// Global navigation functions accessible everywhere
window.toggleMobileMenu = function (e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  const navLinks = document.getElementById('mainNavLinks') || document.querySelector('.nav-links');
  if (!navLinks) return;

  if (navLinks.classList.contains('active')) {
    window.closeMobileMenu();
  } else {
    window.openMobileMenu();
  }
};

window.openMobileMenu = function () {
  const navLinks = document.getElementById('mainNavLinks') || document.querySelector('.nav-links');
  const navbar = document.querySelector('.navbar');
  const toggleBtn = document.querySelector('.mobile-toggle');
  if (navLinks) {
    navLinks.classList.add('active');
    navLinks.style.setProperty('display', 'flex', 'important');
  }
  if (navbar) navbar.classList.add('menu-open');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', 'true');
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      icon.className = 'fa-solid fa-xmark';
    }
  }
};

window.closeMobileMenu = function () {
  const navLinks = document.getElementById('mainNavLinks') || document.querySelector('.nav-links');
  const navbar = document.querySelector('.navbar');
  const toggleBtn = document.querySelector('.mobile-toggle');
  if (navLinks) {
    navLinks.classList.remove('active');
    navLinks.style.removeProperty('display');
  }
  if (navbar) navbar.classList.remove('menu-open');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', 'false');
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      icon.className = 'fa-solid fa-bars';
    }
  }
};

// Global Modal Open/Close Controls
window.closeModals = function () {
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(m => {
    m.classList.remove('active');
    m.style.removeProperty('display');
  });
};

window.switchAuthTab = function (mode) {
  const tabs = document.querySelectorAll('.auth-tab');
  const signinView = document.getElementById('signinFormView');
  const regView = document.getElementById('registerFormView');
  const title = document.getElementById('authModalTitle');

  tabs.forEach(t => t.classList.remove('active'));

  if (mode === 'register') {
    const regTab = document.querySelector('.auth-tab[data-tab="register"]');
    if (regTab) regTab.classList.add('active');
    if (signinView) {
      signinView.style.setProperty('display', 'none', 'important');
      signinView.classList.remove('active');
    }
    if (regView) {
      regView.style.setProperty('display', 'block', 'important');
      regView.classList.add('active');
    }
    if (title) title.innerText = 'Create an Account';
  } else {
    const signinTab = document.querySelector('.auth-tab[data-tab="signin"]');
    if (signinTab) signinTab.classList.add('active');
    if (signinView) {
      signinView.style.setProperty('display', 'block', 'important');
      signinView.classList.add('active');
    }
    if (regView) {
      regView.style.setProperty('display', 'none', 'important');
      regView.classList.remove('active');
    }
    if (title) title.innerText = 'Sign In to ApexShield';
  }
};

window.openAuthModal = function (mode = 'signin') {
  window.closeMobileMenu();
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.classList.add('active');
    authModal.style.setProperty('display', 'flex', 'important');
  }
  window.switchAuthTab(mode);
};

window.openQuoteModal = function (preselectType = 'health') {
  window.closeMobileMenu();
  const quoteModal = document.getElementById('quoteModal');
  if (quoteModal) {
    quoteModal.classList.add('active');
    quoteModal.style.setProperty('display', 'flex', 'important');
  }
  const typeSelect = document.getElementById('quoteTypeSelect');
  if (typeSelect) typeSelect.value = preselectType;
  if (typeof window.resetQuoteWizard === 'function') {
    window.resetQuoteWizard();
  }
};

// Global Scroll Functions
window.scrollToTopSmooth = function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.scrollToBottomSmooth = function () {
  window.scrollTo({ top: document.body.scrollHeight || document.documentElement.scrollHeight, behavior: 'smooth' });
};

window.toggleScrollTopBottom = function () {
  const currentY = window.pageYOffset || document.documentElement.scrollTop;
  if (currentY > 300) {
    window.scrollToTopSmooth();
  } else {
    window.scrollToBottomSmooth();
  }
};

// Multi-Step Quote Wizard Global Controllers
let currentWizardStep = 1;

window.resetQuoteWizard = function () {
  currentWizardStep = 1;
  window.updateWizardStep();
};

window.updateWizardStep = function () {
  $('.wizard-step-item').removeClass('active completed');
  $('.wizard-step-content').removeClass('active');

  for (let i = 1; i <= 4; i++) {
    const $item = $(`.wizard-step-item[data-step="${i}"]`);
    if (i < currentWizardStep) {
      $item.addClass('completed');
      $item.find('.step-circle').html('<i class="fa-solid fa-check"></i>');
    } else if (i === currentWizardStep) {
      $item.addClass('active');
      $item.find('.step-circle').html(i);
      $(`#wizardStep${i}`).addClass('active');
    } else {
      $item.find('.step-circle').html(i);
    }
  }

  // Prev / Next button visibility
  $('#wizardPrevBtn').toggle(currentWizardStep > 1 && currentWizardStep < 4);
  $('#wizardNextBtn').toggle(currentWizardStep < 3);
  $('#wizardSubmitBtn').toggle(currentWizardStep === 3);
};

window.quoteNextStep = function () {
  if (currentWizardStep < 3) {
    currentWizardStep++;
    window.updateWizardStep();
  }
};

window.quotePrevStep = function () {
  if (currentWizardStep > 1) {
    currentWizardStep--;
    window.updateWizardStep();
  }
};

$(document).ready(function () {
  // Global State
  const state = {
    currentUser: null,
    quoteData: {
      type: 'health',
      age: 30,
      zip: '',
      tier: 'standard',
      addons: []
    }
  };

  /* ------------------------------------------------------------------------
     1. SPA Routing & Navigation System
     ------------------------------------------------------------------------ */
  window.navigateTo = function (pageId) {
    // Hide all page views
    $('.page-view').removeClass('active');
    
    // Deactivate all nav links
    $('.nav-link').removeClass('active');

    // Default to home if invalid pageId
    const targetPage = $(`#${pageId}`).length ? pageId : 'home';

    // Activate target page and link
    $(`#${targetPage}`).addClass('active');
    $(`.nav-link[href="#${targetPage}"]`).addClass('active');

    // Scroll to top smooth
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile nav
    window.closeMobileMenu();

    // Close all open modals
    window.closeModals();

    // Trigger page-specific animations
    if (targetPage === 'home') {
      triggerCounterAnimation();
    }
  };

  // Hash change listener & initial load
  function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    window.navigateTo(hash);
  }

  $(window).on('hashchange', handleRoute);
  handleRoute(); // Run on initial load

  // Mobile menu toggle button handled directly via window.toggleMobileMenu with stopPropagation

  // Clicking any link or action button inside the menu closes it
  $('.nav-links').on('click', 'a, button', function () {
    window.closeMobileMenu();
  });

  // Close mobile menu when clicking outside navbar
  $(document).on('click touchstart', function (e) {
    if (!$(e.target).closest('.navbar').length && !$(e.target).closest('.mobile-toggle').length) {
      window.closeMobileMenu();
    }
  });

  // Auto-close mobile menu if viewport resized to desktop
  $(window).on('resize', function () {
    if ($(window).width() > 1024) {
      window.closeMobileMenu();
    }
  });

  // Sticky Navbar background & Floating scroll button state
  $(window).on('scroll', function () {
    const scrollPos = $(this).scrollTop();
    if (scrollPos > 40) {
      $('.navbar').addClass('scrolled');
    } else {
      $('.navbar').removeClass('scrolled');
    }

    const $scrollBtn = $('#globalScrollBtn');
    if (scrollPos > 300) {
      $scrollBtn.find('i').removeClass('fa-arrow-down').addClass('fa-arrow-up');
      $scrollBtn.attr('title', 'Scroll to Top');
    } else {
      $scrollBtn.find('i').removeClass('fa-arrow-up').addClass('fa-arrow-down');
      $scrollBtn.attr('title', 'Scroll to Bottom');
    }
  });

  /* ------------------------------------------------------------------------
     2. Counter Animation System
     ------------------------------------------------------------------------ */
  let countersAnimated = false;

  function triggerCounterAnimation() {
    if (countersAnimated) return;
    countersAnimated = true;

    $('.stat-number').each(function () {
      const $this = $(this);
      const targetVal = parseFloat($this.attr('data-target'));
      const prefix = $this.attr('data-prefix') || '';
      const suffix = $this.attr('data-suffix') || '';

      $({ countNum: 0 }).animate({ countNum: targetVal }, {
        duration: 1800,
        easing: 'swing',
        step: function () {
          if (targetVal % 1 !== 0) {
            $this.text(prefix + this.countNum.toFixed(1) + suffix);
          } else {
            $this.text(prefix + Math.floor(this.countNum).toLocaleString() + suffix);
          }
        },
        complete: function () {
          if (targetVal % 1 !== 0) {
            $this.text(prefix + targetVal.toFixed(1) + suffix);
          } else {
            $this.text(prefix + targetVal.toLocaleString() + suffix);
          }
        }
      });
    });
  }

  // Trigger on load for home
  setTimeout(triggerCounterAnimation, 300);

  /* ------------------------------------------------------------------------
     3. Quick Premium Rate Estimator (Home Page)
     ------------------------------------------------------------------------ */
  function updateQuickEstimate() {
    const coverage = parseInt($('#coverageRange').val()) || 250000;
    const age = parseInt($('#ageRange').val()) || 35;
    const policyType = $('#policyTypeSelect').val() || 'health';

    $('#coverageValText').text('$' + coverage.toLocaleString());
    $('#ageValText').text(age + ' yrs');

    let baseRate = 85;
    if (policyType === 'life') baseRate = 45;
    if (policyType === 'auto') baseRate = 120;
    if (policyType === 'disability') baseRate = 65;

    // Calculation formula
    const coverageFactor = (coverage / 100000) * 22;
    const ageFactor = Math.max(1, (age - 20) * 1.8);
    const estimatedMonthly = Math.round(baseRate + coverageFactor + ageFactor);

    $('#quickEstimatedPrice').text('$' + estimatedMonthly);
  }

  $('#coverageRange, #ageRange, #policyTypeSelect').on('input change', updateQuickEstimate);
  updateQuickEstimate();

  /* ------------------------------------------------------------------------
     4. Modals (Sign In / Register / Get a Quote)
     ------------------------------------------------------------------------ */
  // Close Modals on close button or overlay backdrop click
  $(document).on('click', '.modal-close, .modal-overlay', function (e) {
    if (e.target === this || $(this).hasClass('modal-close') || $(this).closest('.modal-close').length) {
      window.closeModals();
    }
  });

  // Prevent closing when clicking modal content
  $('.modal-content').on('click', function (e) {
    e.stopPropagation();
  });

  $('.auth-tab').on('click', function () {
    const tab = $(this).attr('data-tab');
    window.switchAuthTab(tab);
  });

  // Password Visibility Toggle
  $(document).on('click', '.pwd-toggle', function () {
    const input = $(this).siblings('input');
    const icon = $(this).find('i');
    if (input.attr('type') === 'password') {
      input.attr('type', 'text');
      icon.removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
      input.attr('type', 'password');
      icon.removeClass('fa-eye-slash').addClass('fa-eye');
    }
  });

  // Auth Submit Forms
  $('#signinForm').on('submit', function (e) {
    e.preventDefault();
    const email = $('#signinEmail').val();
    state.currentUser = { name: email.split('@')[0] || 'User', email: email };

    updateUserUI();
    $('#authModal').removeClass('active');
    alert('Successfully signed in! Welcome back, ' + state.currentUser.name + '.');
  });

  $('#registerForm').on('submit', function (e) {
    e.preventDefault();
    const name = $('#regName').val();
    const email = $('#regEmail').val();
    state.currentUser = { name: name, email: email };

    updateUserUI();
    $('#authModal').removeClass('active');
    alert('Account created successfully! Welcome to ApexShield, ' + name + '.');
  });

  function updateUserUI() {
    if (state.currentUser) {
      $('#authNavBtns').hide();
      $('#userBadgeNav').css('display', 'inline-flex');
      $('#userNameDisplay').text(state.currentUser.name);
    }
  }

  /* ------------------------------------------------------------------------
     5. Multi-Step Quote Wizard Modal Listeners
     ------------------------------------------------------------------------ */
  $('#wizardNextBtn').on('click', function () {
    window.quoteNextStep();
  });

  $('#wizardPrevBtn').on('click', function () {
    window.quotePrevStep();
  });

  $('#wizardForm').on('submit', function (e) {
    e.preventDefault();
    // Calculate final quote result
    const type = $('#quoteTypeSelect').val();
    const age = parseInt($('#quoteAgeInput').val()) || 30;
    const tier = $('input[name="quoteTier"]:checked').val() || 'standard';

    let base = 120;
    if (type === 'life') base = 60;
    if (type === 'auto') base = 150;
    if (type === 'disability') base = 90;

    if (tier === 'basic') base *= 0.75;
    if (tier === 'premium') base *= 1.4;

    const finalMonthly = Math.round(base + (age - 25) * 1.5);
    const finalAnnual = Math.round(finalMonthly * 11.2); // Discounted annual rate

    $('#summaryMonthlyPrice').text('$' + finalMonthly);
    $('#summaryAnnualPrice').text('$' + finalAnnual + ' / yr');

    currentWizardStep = 4;
    window.updateWizardStep();
  });

  /* ------------------------------------------------------------------------
     6. Accordion Controls (Auto & Disability FAQ)
     ------------------------------------------------------------------------ */
  $('.accordion-header').on('click', function () {
    const $body = $(this).next('.accordion-body');
    $('.accordion-header').not(this).removeClass('active');
    $('.accordion-body').not($body).slideUp(250);

    $(this).toggleClass('active');
    $body.slideToggle(250);
  });

  /* ------------------------------------------------------------------------
     7. Life Coverage & Disability Simulators
     ------------------------------------------------------------------------ */
  // Life Calculator
  function calcLifeNeeds() {
    const income = parseInt($('#lifeIncomeInput').val()) || 75000;
    const mortgage = parseInt($('#lifeMortgageInput').val()) || 200000;
    const kids = parseInt($('#lifeKidsInput').val()) || 2;

    const recommendedCoverage = (income * 10) + mortgage + (kids * 100000);
    $('#lifeResultCoverage').text('$' + recommendedCoverage.toLocaleString());
  }

  $('#lifeIncomeInput, #lifeMortgageInput, #lifeKidsInput').on('input change', calcLifeNeeds);
  calcLifeNeeds();

  // Disability Simulator
  function calcDisabilityBenefit() {
    const salary = parseInt($('#disabilitySalaryRange').val()) || 60000;
    $('#disabilitySalaryText').text('$' + salary.toLocaleString());

    const monthlyBenefit = Math.round((salary * 0.65) / 12);
    $('#disabilityMonthlyPayout').text('$' + monthlyBenefit.toLocaleString());
  }

  $('#disabilitySalaryRange').on('input change', calcDisabilityBenefit);
  calcDisabilityBenefit();

  // Initialize wizard on start
  window.updateWizardStep();
});
