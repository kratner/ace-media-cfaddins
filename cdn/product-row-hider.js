/*!
 * CF Classic — Robust Product Row Hider (CDN) v1.0.0 (2025-12-16)
 * 
 * PURPOSE: Keep specific product radios/rows hidden even as CF/CFPT re-render the order form.
 * 
 * CONFIGURATION:
 * Define window.FORCE_HIDE_PRODS before loading this script:
 * window.FORCE_HIDE_PRODS = ['5023738', '5023739', '5023740'];
 * 
 * HOW IT WORKS:
 * - Tags each product row with data-bump-hidden="1"
 * - Hides with CSS !important (prevents flicker)
 * - Re-applies on DOM mutations (no more reappearing rows)
 */

(function () {
  'use strict';
  
  // Prevent multiple initializations
  if (window.PRODUCT_ROW_HIDER_INITIALIZED) {
    console.warn('Product Row Hider: Already initialized, skipping...');
    return;
  }
  
  // Validate configuration
  if (typeof window.FORCE_HIDE_PRODS === 'undefined') {
    console.error('Product Row Hider: window.FORCE_HIDE_PRODS must be defined before loading this script');
    return;
  }
  
  if (!Array.isArray(window.FORCE_HIDE_PRODS)) {
    console.error('Product Row Hider: window.FORCE_HIDE_PRODS must be an array');
    return;
  }
  
  if (window.FORCE_HIDE_PRODS.length === 0) {
    console.warn('Product Row Hider: window.FORCE_HIDE_PRODS is empty, nothing to hide');
    return;
  }
  
  console.log('Product Row Hider v1.0.0: Hiding ' + window.FORCE_HIDE_PRODS.length + ' product(s)');
  
  // Use the externally defined configuration
  var FORCE_HIDE_PRODS = window.FORCE_HIDE_PRODS;
  
  // ─────────────────────────────────────────────────────────────────────────
  // CSS: One-time stylesheet to hard-hide any tagged rows
  // ─────────────────────────────────────────────────────────────────────────
  if (!document.getElementById('cf-force-hide-prods-css')) {
    var css = [
      '.elOrderProductOptinProducts[data-bump-hidden="1"]{display:none !important;}',
      // If CF changes container class, also hide grandparent fallback:
      'input[type="radio"][name="purchase[product_id]"][data-bump-hidden="1"]{display:none !important;}'
    ].join('');
    
    var style = document.createElement('style');
    style.id = 'cf-force-hide-prods-css';
    style.textContent = css;
    document.head.appendChild(style);
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // Helper Functions
  // ─────────────────────────────────────────────────────────────────────────
  var RADIO_SEL = 'input[type="radio"][name="purchase[product_id]"]';
  
  /**
   * Hide a specific product row by product ID
   */
  function hideRowFor(id) {
    // Check for jQuery
    if (typeof jQuery === 'undefined') {
      // Vanilla JS fallback
      var radios = document.querySelectorAll(RADIO_SEL + '[value="' + id + '"]');
      radios.forEach(function(radio) {
        radio.setAttribute('data-bump-hidden', '1');
        var row = radio.closest('.elOrderProductOptinProducts');
        if (row) row.setAttribute('data-bump-hidden', '1');
      });
    } else {
      // jQuery version
      var $r = $(RADIO_SEL + '[value="' + id + '"]');
      if ($r.length) {
        // Tag both the row and the input (belt & suspenders)
        $r.attr('data-bump-hidden', '1');
        $r.closest('.elOrderProductOptinProducts').attr('data-bump-hidden', '1');
      }
    }
  }
  
  /**
   * Apply hiding to all configured products
   */
  function applyAll() {
    FORCE_HIDE_PRODS.forEach(hideRowFor);
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // Initialization: Run now, then staggered passes
  // ─────────────────────────────────────────────────────────────────────────
  
  // DOM ready
  if (typeof jQuery !== 'undefined') {
    $(applyAll);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAll);
  } else {
    applyAll();
  }
  
  // After assets load
  window.addEventListener('load', applyAll);
  
  // Staggered paints in case CF paints late
  setTimeout(applyAll, 300);
  setTimeout(applyAll, 1000);
  setTimeout(applyAll, 2500);
  
  // ─────────────────────────────────────────────────────────────────────────
  // MutationObserver: Re-apply on any CF/CFPT rewrites
  // ─────────────────────────────────────────────────────────────────────────
  var container = document.querySelector('.elOrderProductOptions') || document.body;
  var mo = new MutationObserver(function () {
    applyAll();
  });
  mo.observe(container, { childList: true, subtree: true });
  
  // Mark as initialized
  window.PRODUCT_ROW_HIDER_INITIALIZED = true;
  console.log('Product Row Hider v1.0.0: Initialization complete');
  
})();
// End CF Classic — Robust Product Row Hider (CDN) v1.0.0