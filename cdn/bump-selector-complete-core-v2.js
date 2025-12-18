/**
 * BUMP SELECTOR COMPLETE CORE v2.0
 * Based on original working Bump Selector v1.2.5
 * Consolidated script combining product hiding and bump selector functionality
 * 
 * Configuration: window.BUMP_CONFIG
 * - Automatically extracts and hides all associatedIds on page load
 * - Renders bump selector dropdowns for each bump configuration
 * - Dropdowns only visible when bump checkbox is checked
 * - No separate FORCE_HIDE_PRODS or product-row-hider.js needed
 * 
 * © 2025 Ace Media
 */

(function($) {
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
  // EXTRACT AND HIDE PRODUCTS
  // ═══════════════════════════════════════════════════════════════════════════════

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

  function hideProductRows(hideProducts) {
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
  // BUMP SELECTOR CORE (Based on original v1.2.5)
  // ═══════════════════════════════════════════════════════════════════════════════

  $(function() {
    setTimeout(function() {
      var isUpdatingBumpSelector = false;
      var currentSelections = {};

      // Derive runtime fields
      window.BUMP_CONFIG.forEach(function(cfg, i) {
        cfg.index = i;
        cfg.wrapClass = 'bump-selector-wrap';
        cfg.currentValue = '';
        cfg.$wrap = $();
        cfg.$bump = $();
        cfg.$visibleChk = $();
        cfg.checkerId = '';
        cfg.originalInput = null;
      });

      // Helpers
      function combinedIds(cfg) {
        var ids = [];
        if (cfg.includeMainInDropdown && cfg.mainProductId) ids.push(cfg.mainProductId);
        if (Array.isArray(cfg.associatedIds) && cfg.associatedIds.length) ids = ids.concat(cfg.associatedIds);
        return ids;
      }

      function resolveDefaultIndex(cfg, ids) {
        if (cfg.defaultId) {
          var idx = ids.indexOf(cfg.defaultId);
          if (idx >= 0) return idx;
        }
        if (typeof cfg.defaultIndex === 'number') {
          return Math.max(0, Math.min(cfg.defaultIndex, Math.max(ids.length - 1, 0)));
        }
        return 0;
      }

      function escapeHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

      function escapeHtmlAttr(str) {
        return escapeHtml(str).replace(/"/g, '&quot;');
      }

      // Find bump container using data-title attribute
      function findBumpContainerByCfg(cfg) {
        var $b = $('[data-title="cf-multi-bump-' + cfg.mainProductId + '"]');
        
        // Get .orderFormBump child if data-title is on wrapper
        if ($b.length && !$b.hasClass('orderFormBump')) {
          var $inner = $b.find('.orderFormBump').first();
          if ($inner.length) $b = $inner;
        }
        
        // Fallback to index
        if (!$b.length) $b = $('.orderFormBump').eq(cfg.index);
        
        return $b;
      }

      // Pull CF product text from hidden radio buttons
      function getProductOptionText(productId) {
        var $r = $('input[type="radio"][value="' + productId + '"]'), txt = '';
        if ($r.length) {
          var $l = $r.siblings('label').first();
          if (!$l.length) $l = $r.closest('.elOrderProductOptinProducts').find('label').first();
          txt = $l.text().trim();
        }
        if (!txt) {
          var $h = $('#cfAR input[value="' + productId + '"]').siblings('label');
          if ($h.length) txt = $h.text().trim();
        }
        return txt || ('Product ' + productId);
      }

      // Ensure only ONE product_ids[] checked per bump
      function uncheckAllVariantIds(cfg, exceptId) {
        var ids = combinedIds(cfg);
        ids.forEach(function(id) {
          if (!id) return;
          if (exceptId && id === exceptId) return;
          $('#cfAR [name="purchase[product_ids][]"][value="' + id + '"]').prop('checked', false);
        });
      }

      // Build dropdowns ONLY when there are ids
      window.BUMP_CONFIG.forEach(function(cfg) {
        var ids = combinedIds(cfg);
        if (!ids.length) return;

        var defIdx = resolveDefaultIndex(cfg, ids);
        var selectHtml = '<select data-title="bump-selector">';
        ids.forEach(function(id, idx) {
          var txt = getProductOptionText(id);
          var cls = (idx === defIdx) ? ' class="default-option"' : '';
          selectHtml +=
            '<option value="' + id + '" data-original-text="' + escapeHtmlAttr(txt) + '"' + cls + '>' +
            escapeHtml(txt) +
            '</option>';
        });
        selectHtml += '</select>';

        var $label = $('<label class="quantity-selector-label">Select Quantity:</label>');
        cfg.$wrap = $('<div class="' + cfg.wrapClass + '"></div>')
          .append($label)
          .append($(selectHtml))
          .hide(); // IMPORTANT: Start hidden
      });

      // Bind to visible checkbox (controller)
      window.BUMP_CONFIG.forEach(function(cfg) {
        cfg.$bump = findBumpContainerByCfg(cfg);
        var $vis = cfg.$bump.find('input[type="checkbox"]').first();
        if (!$vis.length) {
          $vis = $('<input type="checkbox" value="1" />').prependTo(cfg.$bump);
        }
        cfg.$visibleChk = $vis;
        cfg.checkerId = 'bump-select-checker-' + (cfg.index + 1);
        cfg.$visibleChk.attr('id', cfg.checkerId);
        cfg.originalInput = cfg.mainProductId ? ('#bump_offer_' + cfg.mainProductId) : null;
      });

      // Inject wrappers in bump box (only if built)
      window.BUMP_CONFIG.forEach(function(cfg) {
        if (!cfg.$wrap || !cfg.$wrap.length) return;
        var $bump = cfg.$bump && cfg.$bump.length ? cfg.$bump : findBumpContainerByCfg(cfg);
        var $first = $bump.find('.sectioncontent').children().first();
        $first.after(cfg.$wrap);
      });

      // Update order summary
      function updateOrderSummary() {
        setTimeout(function() {
          if (typeof rebuildOrderSummary === 'function') rebuildOrderSummary();
        }, 50);
      }

      // Activate bump: show dropdown, select default, check product
      function activateBump(cfg) {
        var ids = combinedIds(cfg);

        if (cfg.$wrap && cfg.$wrap.length) {
          cfg.$wrap.show();

          // Clear previous selections
          uncheckAllVariantIds(cfg);
          if (cfg.currentValue) {
            $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.currentValue + '"]').prop('checked', false);
            cfg.currentValue = '';
          }

          // Reset option texts
          cfg.$wrap.find('select option').each(function() {
            var $o = $(this), orig = $o.attr('data-original-text');
            if (orig) $o.text(orig);
          });

          // Select default and apply badge
          var defIdx = resolveDefaultIndex(cfg, ids);
          var $opt = cfg.$wrap.find('select option').eq(defIdx);
          var val = $opt.val() || '';

          cfg.$wrap.find('select option').removeClass('default-option-selected');
          if (cfg.featuredText && $opt.length) {
            var orig = $opt.attr('data-original-text') || $opt.text();
            $opt.text(orig + ' ' + cfg.featuredText);
          }
          $opt.addClass('default-option-selected');

          if (val) {
            cfg.$wrap.find('select').val(val);
            cfg.currentValue = val;

            uncheckAllVariantIds(cfg, val);
            $('#cfAR [name="purchase[product_ids][]"][value="' + val + '"]').prop('checked', true);
          }
        }

        updateOrderSummary();
      }

      // Deactivate bump: hide dropdown, uncheck all
      function deactivateBump(cfg) {
        uncheckAllVariantIds(cfg);
        if (cfg.currentValue) {
          $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.currentValue + '"]').prop('checked', false);
          cfg.currentValue = '';
        }
        if (cfg.$wrap && cfg.$wrap.length) cfg.$wrap.hide();
        updateOrderSummary();
      }

      // Checkbox click toggles (DEFERRED)
      window.BUMP_CONFIG.forEach(function(cfg) {
        cfg.$visibleChk.on('click', function() {
          if (isUpdatingBumpSelector) return;
          setTimeout(function() {
            var checked = cfg.$visibleChk.is(':checked');
            if (checked) activateBump(cfg);
            else deactivateBump(cfg);
          }, 0);
        });
      });

      // Dropdown change handler
      window.BUMP_CONFIG.forEach(function(cfg) {
        if (!cfg.$wrap || !cfg.$wrap.length) return;
        cfg.$wrap.find('select').on('change', function() {
          if (isUpdatingBumpSelector) return;

          $(this).find('option').removeClass('default-option-selected');
          var v = this.value;

          uncheckAllVariantIds(cfg, v);

          if (cfg.currentValue) {
            $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.currentValue + '"]').prop('checked', false);
          }
          cfg.currentValue = v;
          if (v) $('#cfAR [name="purchase[product_ids][]"][value="' + v + '"]').prop('checked', true);
          updateOrderSummary();
        });
      });

      // Validation
      $('a[href="#submit-form"]').on('click', function(ev) {
        for (var i = 0; i < window.BUMP_CONFIG.length; i++) {
          var cfg = window.BUMP_CONFIG[i];
          var $chk = $('#' + cfg.checkerId);
          var $sel = (cfg.$wrap && cfg.$wrap.length) ? cfg.$wrap.find('select') : $();
          if ($chk.is(':checked') && $sel.length && $sel.val() === '') {
            ev.preventDefault();
            $sel.addClass('elInputError');
            alert("You must select an option");
            var $b = $chk.closest('.orderFormBump');
            if ($b.length) {
              var off = $b.offset();
              $('html,body').animate({ scrollTop: off.top - 10, scrollLeft: off.left });
            }
            return false;
          }
        }
      });

      // Save/restore on main product changes
      function saveCurrentSelections() {
        window.BUMP_CONFIG.forEach(function(cfg) {
          var $chk = $('#' + cfg.checkerId);
          var $sel = (cfg.$wrap && cfg.$wrap.length) ? cfg.$wrap.find('select') : $();
          currentSelections[cfg.checkerId] = {
            checked: $chk.is(':checked'),
            value: $sel.val(),
            visible: cfg.$wrap && cfg.$wrap.is(':visible')
          };
        });
      }

      function restoreSelections() {
        isUpdatingBumpSelector = true;
        window.BUMP_CONFIG.forEach(function(cfg) {
          var saved = currentSelections[cfg.checkerId];
          if (!saved) return;

          var $chk = $('#' + cfg.checkerId);
          var $sel = (cfg.$wrap && cfg.$wrap.length) ? cfg.$wrap.find('select') : $();

          $chk.prop('checked', saved.checked);
          if (saved.checked) {
            if (cfg.$wrap && cfg.$wrap.length) {
              cfg.$wrap.show();
              $sel.val(saved.value);
            }
            if (saved.value) {
              $('#cfAR [name="purchase[product_ids][]"][value="' + saved.value + '"]').prop('checked', true);
            }
          } else {
            if (cfg.$wrap && cfg.$wrap.length) cfg.$wrap.hide();
          }
          cfg.currentValue = saved.value || '';
        });
        setTimeout(function() {
          isUpdatingBumpSelector = false;
          updateOrderSummary();
        }, 100);
      }

      $(document).on('change', '[name="purchase[product_id]"]', function() {
        saveCurrentSelections();
        setTimeout(restoreSelections, 500);
      });

      // Initialize from current state
      window.BUMP_CONFIG.forEach(function(cfg) {
        if (cfg.preSelected && cfg.$visibleChk && cfg.$visibleChk.length && !cfg.$visibleChk.is(':checked')) {
          cfg.$visibleChk.prop('checked', true);
        }
      });

      window.BUMP_CONFIG.forEach(function(cfg) {
        if (!cfg.$visibleChk || !cfg.$visibleChk.length) return;
        if (cfg.$visibleChk.is(':checked')) activateBump(cfg);
        else deactivateBump(cfg);
      });

    }, 3000);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════════

  $(document).ready(function() {
    console.log('[Bump Selector] DOM ready, starting product hiding...');
    var hideProducts = extractHideProducts();
    hideProductRows(hideProducts);
    console.log('[Bump Selector] Product hiding complete. Bump selectors will initialize in 3 seconds.');
  });

})(jQuery);
