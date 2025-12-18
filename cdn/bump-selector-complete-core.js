/**
 * BUMP SELECTOR COMPLETE CORE
 * Consolidated script combining product hiding and bump selector functionality
 * 
 * Configuration: window.BUMP_CONFIG
 * - Automatically extracts and hides all associatedIds on page load
 * - Renders bump selector dropdowns for each bump configuration
 * - No separate FORCE_HIDE_PRODS or product-row-hider.js needed
 * 
 * © 2025 Ace Media
 */

(function() {
  'use strict';

  // Guard against multiple initializations
  if (window.BUMP_SELECTOR_INITIALIZED) {
    console.warn('[Bump Selector] Already initialized. Skipping duplicate initialization.');
    return;
  }
  window.BUMP_SELECTOR_INITIALIZED = true;

  // ═══════════════════════════════════════════════════════════════════════════════
  // CONFIGURATION VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════════

  if (typeof window.BUMP_CONFIG === 'undefined') {
    console.error('[Bump Selector] window.BUMP_CONFIG is not defined. Aborting initialization.');
    return;
  }

  if (!Array.isArray(window.BUMP_CONFIG)) {
    console.error('[Bump Selector] window.BUMP_CONFIG must be an array. Aborting initialization.');
    return;
  }

  console.log('[Bump Selector] Initializing with ' + window.BUMP_CONFIG.length + ' bump configurations.');

  // ═══════════════════════════════════════════════════════════════════════════════
  // EXTRACT HIDE PRODUCTS FROM BUMP_CONFIG
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Extract all associatedIds from BUMP_CONFIG to create hide list
   * This replaces the need for separate FORCE_HIDE_PRODS configuration
   */
  function extractHideProducts() {
    var hideProducts = [];
    
    window.BUMP_CONFIG.forEach(function(bump) {
      if (bump.associatedIds && Array.isArray(bump.associatedIds)) {
        bump.associatedIds.forEach(function(productId) {
          if (hideProducts.indexOf(productId) === -1) {
            hideProducts.push(productId);
          }
        });
      }
    });

    console.log('[Bump Selector] Extracted ' + hideProducts.length + ' products to hide: ' + hideProducts.join(', '));
    return hideProducts;
  }

  var hideProducts = extractHideProducts();

  // ═══════════════════════════════════════════════════════════════════════════════
  // PRODUCT ROW HIDER FUNCTIONALITY
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Hide product rows from the main order form
   * Products are hidden so they can be re-rendered as bump selector dropdowns
   */
  function hideProductRows() {
    if (hideProducts.length === 0) {
      console.log('[Bump Selector] No products to hide.');
      return;
    }

    console.log('[Bump Selector] Hiding ' + hideProducts.length + ' product rows...');

    hideProducts.forEach(function(productId) {
      var $productRow = $('input:radio[value="' + productId + '"]').closest('.elOrderProductOptinProductName');
      
      if ($productRow.length) {
        $productRow.hide();
        console.log('[Bump Selector] Hidden product: ' + productId);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // BUMP SELECTOR CORE FUNCTIONALITY
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Initialize bump selector dropdowns
   * Creates and manages dropdown selections for bump products
   */
  function initializeBumpSelectors() {
    console.log('[Bump Selector] Initializing bump selectors...');

    var bumpIndex = 0;

    window.BUMP_CONFIG.forEach(function(bumpConfig, configIndex) {
      // Skip configurations with no mainProductId
      if (!bumpConfig.mainProductId || bumpConfig.mainProductId === 'null' || bumpConfig.mainProductId === '') {
        console.log('[Bump Selector] Skipping bump config ' + configIndex + ' (no mainProductId)');
        return;
      }

      bumpIndex++;
      console.log('[Bump Selector] Processing bump ' + bumpIndex + ' with mainProductId: ' + bumpConfig.mainProductId);
      
      // Find bump section by data-title attribute (cf-multi-bump-XXXXX)
      var $bumpSection = $('[data-title="cf-multi-bump-' + bumpConfig.mainProductId + '"]');
      
      // Try associated IDs if main product not found
      if ($bumpSection.length === 0 && Array.isArray(bumpConfig.associatedIds)) {
        console.log('[Bump Selector] Main product not found by data-title, trying associatedIds:', bumpConfig.associatedIds);
        for (var i = 0; i < bumpConfig.associatedIds.length; i++) {
          $bumpSection = $('[data-title="cf-multi-bump-' + bumpConfig.associatedIds[i] + '"]');
          if ($bumpSection.length) {
            console.log('[Bump Selector] Found bump section using associatedId: ' + bumpConfig.associatedIds[i]);
            break;
          }
        }
      }
      
      // Fallback to index-based selection
      if ($bumpSection.length === 0) {
        $bumpSection = $('.orderFormBump').eq(bumpIndex - 1);
        console.log('[Bump Selector] Using fallback index-based selection for bump ' + bumpIndex);
      }

      if ($bumpSection.length === 0) {
        console.warn('[Bump Selector] Could not find bump section for mainProductId: ' + bumpConfig.mainProductId);
        console.warn('[Bump Selector] Searched for: main=' + bumpConfig.mainProductId + ', associated=' + JSON.stringify(bumpConfig.associatedIds));
        return;
      }
      
      // Get the .orderFormBump element (might be child of data-title element)
      if (!$bumpSection.hasClass('orderFormBump')) {
        var $innerBump = $bumpSection.find('.orderFormBump').first();
        if ($innerBump.length) {
          $bumpSection = $innerBump;
        }
      }
      
      console.log('[Bump Selector] Found bump section for product: ' + bumpConfig.mainProductId);

      // Create dropdown options
      var dropdownOptions = [];

      if (bumpConfig.includeMainInDropdown) {
        // Add main product as first option
        var mainProductLabel = bumpConfig.featuredText ? bumpConfig.featuredText + ' ' + bumpConfig.mainProductId : bumpConfig.mainProductId;
        dropdownOptions.push({
          value: bumpConfig.mainProductId,
          label: mainProductLabel
        });
      }

      // Add associated products
      if (bumpConfig.associatedIds && Array.isArray(bumpConfig.associatedIds)) {
        bumpConfig.associatedIds.forEach(function(productId) {
          dropdownOptions.push({
            value: productId,
            label: productId
          });
        });
      }

      if (dropdownOptions.length === 0) {
        console.warn('[Bump Selector] No dropdown options for bump ' + bumpIndex);
        return;
      }

      console.log('[Bump Selector] Bump ' + bumpIndex + ' has ' + dropdownOptions.length + ' dropdown options');

      // Create dropdown element
      var $dropdown = createDropdownElement(dropdownOptions, bumpConfig, bumpIndex);

      // Insert dropdown into bump section
      var $bumpContent = $bumpSection.find('.sectioncontent').first();
      if ($bumpContent.length) {
        $bumpContent.append($dropdown);
        console.log('[Bump Selector] Inserted dropdown for bump ' + bumpIndex);
      }

      // Handle dropdown change
      $dropdown.find('select').on('change', function() {
        handleDropdownChange(this, bumpConfig, bumpIndex);
      });

      // Pre-select default option if configured
      if (bumpConfig.preSelected && bumpConfig.defaultIndex >= 0) {
        var $select = $dropdown.find('select');
        if ($select.length) {
          $select.prop('selectedIndex', bumpConfig.defaultIndex);
          console.log('[Bump Selector] Pre-selected option index ' + bumpConfig.defaultIndex + ' for bump ' + bumpIndex);
        }
      }
    });

    console.log('[Bump Selector] Bump selector initialization complete');
  }

  /**
   * Create dropdown element for bump
   */
  function createDropdownElement(options, bumpConfig, bumpIndex) {
    var $wrapper = $('<div class="bump-selector-wrapper bump-selector-wrapper-' + bumpIndex + '" style="margin-top: 15px; margin-bottom: 15px;"></div>');
    
    var $select = $('<select class="bump-selector-dropdown bump-selector-dropdown-' + bumpIndex + '" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;"></select>');
    
    // Add default empty option
    $select.append($('<option value="">-- Select Option --</option>'));
    
    // Add configured options
    options.forEach(function(option) {
      $select.append($('<option value="' + option.value + '">' + option.label + '</option>'));
    });

    $wrapper.append($select);
    return $wrapper;
  }

  /**
   * Handle dropdown change event
   */
  function handleDropdownChange(selectElement, bumpConfig, bumpIndex) {
    var selectedValue = $(selectElement).val();
    
    if (!selectedValue) {
      console.log('[Bump Selector] Dropdown ' + bumpIndex + ' cleared');
      return;
    }

    console.log('[Bump Selector] Dropdown ' + bumpIndex + ' selected: ' + selectedValue);

    // Check the corresponding radio button for the selected product
    var $radio = $('input:radio[value="' + selectedValue + '"]');
    if ($radio.length) {
      $radio.prop('checked', true).trigger('change');
      console.log('[Bump Selector] Selected radio button for product: ' + selectedValue);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Initialize when DOM is ready
   */
  function initialize() {
    console.log('[Bump Selector] DOM ready, starting initialization...');

    // Step 1: Hide product rows
    hideProductRows();

    // Step 2: Initialize bump selectors
    initializeBumpSelectors();

    console.log('[Bump Selector] Complete core initialization finished');
  }

  // Run initialization when jQuery and DOM are ready
  if (typeof jQuery !== 'undefined') {
    jQuery(document).ready(initialize);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded
    initialize();
  }

})();