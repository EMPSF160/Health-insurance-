/* ==========================================================================
   ApexShield - Main Application Logic & Interactivity (jQuery & ES6)
   ========================================================================== */

$(document).ready(function () {
  // Global State
  const state = {
    currentUser: null,
    quoteData: {
      type: 'health',
      age: 30,
      zip: '',
      tier: 'premium',
      addons: []
    }
  };

  /* ------------------------------------------------------------------------
     1. SPA Routing System
     ------------------------------------------------------------------------ */
  function navigateTo(pageId) {
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

    // Close mobile nav if open
    $('.nav-links').removeClass('active');

    // Trigger page-specific animations
    if (targetPage === 'home') {
      animateCounters();
    }
  }

  // Hash change listener & initial load
  function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);
  }

  $(window).on('hashchange', handleRoute);
  handleRoute(); // Run on initial load

  // Mobile menu toggle
  $('.mobile-toggle').on('click', function () {
    $('.nav-links').toggleClass('active');
  });

  // Sticky Navbar shadow on scroll
  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 40) {
      $('.navbar').addClass('scrolled');
    } else {
      $('.navbar').removeClass('scrolled');
    }
  });

  /* ------------------------------------------------------------------------
     2. Counter Animation System
     ------------------------------------------------------------------------ */
  let countersAnimated = false;
  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    $('.stat-number').each(function () {
      const $this = $(this);
      const targetVal = parseFloat($this.attr('data-target'));
      const prefix = $this.attr('data-prefix') || '';
      const suffix = $this.attr('data-suffix') || '';

      $({ countNum: 0 }).animate({ countNum: targetVal }, {
        duration: 2000,
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
  // Open Auth Modal (Sign In / Register)
  window.openAuthModal = function (mode = 'signin') {
    $('#authModal').addClass('active');
    switchAuthTab(mode);
  };

  // Close Modals
  $('.modal-close, .modal-overlay').on('click', function (e) {
    if (e.target === this || $(this).hasClass('modal-close')) {
      $('.modal-overlay').removeClass('active');
    }
  });

  // Prevent closing when clicking modal content
  $('.modal-content').on('click', function (e) {
    e.stopPropagation();
  });

  // Switch Auth Tabs
  function switchAuthTab(mode) {
    $('.auth-tab').removeClass('active');
    $('.auth-form-view').hide();

    if (mode === 'register') {
      $('.auth-tab[data-tab="register"]').addClass('active');
      $('#registerFormView').show();
      $('#authModalTitle').text('Create an Account');
    } else {
      $('.auth-tab[data-tab="signin"]').addClass('active');
      $('#signinFormView').show();
      $('#authModalTitle').text('Sign In to ApexShield');
    }
  }

  $('.auth-tab').on('click', function () {
    const tab = $(this).attr('data-tab');
    switchAuthTab(tab);
  });

  // Password Visibility Toggle
  $('.pwd-toggle').on('click', function () {
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
     5. Multi-Step Quote Wizard Modal
     ------------------------------------------------------------------------ */
  let currentStep = 1;

  window.openQuoteModal = function (preselectType = 'health') {
    $('#quoteTypeSelect').val(preselectType);
    currentStep = 1;
    updateWizardStep();
    $('#quoteModal').addClass('active');
  };

  function updateWizardStep() {
    $('.wizard-step-item').removeClass('active completed');
    $('.wizard-step-content').removeClass('active');

    for (let i = 1; i <= 4; i++) {
      const $item = $(`.wizard-step-item[data-step="${i}"]`);
      if (i < currentStep) {
        $item.addClass('completed');
        $item.find('.step-circle').html('<i class="fa-solid fa-check"></i>');
      } else if (i === currentStep) {
        $item.addClass('active');
        $item.find('.step-circle').html(i);
        $(`#wizardStep${i}`).addClass('active');
      } else {
        $item.find('.step-circle').html(i);
      }
    }

    // Prev / Next button visibility
    $('#wizardPrevBtn').toggle(currentStep > 1 && currentStep < 4);
    $('#wizardNextBtn').toggle(currentStep < 3);
    $('#wizardSubmitBtn').toggle(currentStep === 3);
  }

  $('#wizardNextBtn').on('click', function () {
    if (currentStep < 3) {
      currentStep++;
      updateWizardStep();
    }
  });

  $('#wizardPrevBtn').on('click', function () {
    if (currentStep > 1) {
      currentStep--;
      updateWizardStep();
    }
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

    currentStep = 4;
    updateWizardStep();
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
});
