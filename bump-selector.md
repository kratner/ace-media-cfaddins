# Bump Selector Documentation

**Version:** 1.3.0  
**Last Updated:** December 17, 2025  
**Repository:** [kratner/ace-media-cfaddins](https://github.com/kratner/ace-media-cfaddins)

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [File Descriptions](#file-descriptions)
4. [Implementation Approaches](#implementation-approaches)
5. [Configuration Reference](#configuration-reference)
6. [Usage Examples](#usage-examples)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Bump Selector system is a JavaScript-based solution for ClickFunnels order forms that transforms static bump offer checkboxes into dynamic dropdown selectors. This allows customers to select from multiple product variants (e.g., different quantities or price points) within a single bump offer section.

### Key Features

- **Dynamic Dropdown Selection**: Convert bump offers into interactive dropdowns with multiple product variants
- **Automatic Product Hiding**: Hide variant products from main product selection to prevent duplication
- **Featured Text Badges**: Add visual emphasis to specific options (e.g., "*BONUS!*", "*HOT!*")
- **Default Pre-selection**: Automatically select recommended options
- **ClickFunnels Integration**: Seamlessly integrates with existing ClickFunnels order forms
- **jQuery Compatible**: Works with jQuery already loaded by ClickFunnels
- **Validation Support**: Prevents form submission if bump is checked but no variant is selected

### Use Cases

- **Quantity Selectors**: Offer 1x, 3x, 5x, or 10x quantity options
- **Package Tiers**: Basic, Standard, Premium, or VIP packages
- **Add-on Variants**: Different sizes, colors, or configurations
- **Upsell Options**: Multiple price points for the same product category

---

## System Architecture

The Bump Selector system consists of two implementation approaches:

### 1. Modular Approach (Separate Files)

```
┌─────────────────────────────────────┐
│  ClickFunnels Order Form Footer     │
├─────────────────────────────────────┤
│                                     │
│  1. Configuration Scripts           │
│     ├── window.FORCE_HIDE_PRODS     │
│     └── window.BUMP_CONFIG          │
│                                     │
│  2. Product Row Hider               │
│     └── product-row-hider.js        │
│                                     │
│  3. Bump Selector Core              │
│     ├── bump-selector-styles.css    │
│     ├── bump-selector-fx.css        │
│     └── bump-selector-core.js       │
│                                     │
└─────────────────────────────────────┘
```

**Files:**
- `product-row-hider.js` - Hides variant products from main selection
- `bump-selector-core.js` - Creates and manages bump dropdown selectors
- `bump-selector-styles.css` - Styling for dropdown interface
- `bump-selector-fx.css` - Visual effects and animations

### 2. Consolidated Approach (Single File)

```
┌─────────────────────────────────────┐
│  ClickFunnels Order Form Footer     │
├─────────────────────────────────────┤
│                                     │
│  1. Configuration Script            │
│     └── window.BUMP_CONFIG          │
│                                     │
│  2. Bump Selector Complete Core     │
│     ├── bump-selector-styles.css    │
│     ├── bump-selector-fx.css        │
│     └── bump-selector-complete-     │
│         core.js (includes hiding)   │
│                                     │
└─────────────────────────────────────┘
```

**Files:**
- `bump-selector-complete-core.js` - All-in-one solution with integrated product hiding
- `bump-selector-styles.css` - Styling for dropdown interface
- `bump-selector-fx.css` - Visual effects and animations

---

## File Descriptions

### product-row-hider.js

**Purpose:** Hides specific product rows from the main order form to prevent them from appearing as standalone options.

**Functionality:**
- Accepts `window.FORCE_HIDE_PRODS` array of product IDs
- Injects CSS to force-hide tagged product rows
- Tags hidden rows with `data-bump-hidden="1"` attribute
- Uses MutationObserver to re-apply hiding if ClickFunnels re-renders the form
- Runs multiple times at staggered intervals (300ms, 1000ms, 2500ms) to catch late renders
- Works with or without jQuery (vanilla JS fallback)

**Configuration:**
```javascript
window.FORCE_HIDE_PRODS = [
  '5023738', '5023739',  // Product variant IDs to hide
  '5023740', '5023741'
];
```

**Key Features:**
- Prevents "flickering" where hidden products briefly appear
- Handles ClickFunnels DOM mutations
- Dual tagging (row + input) for maximum reliability
- Console logging for debugging

---

### bump-selector-core.js

**Purpose:** Transforms bump offer checkboxes into dropdown selectors with multiple product variants.

**Functionality:**

#### 1. **Configuration Processing**
- Validates `window.BUMP_CONFIG` array
- Derives runtime fields for each bump configuration
- Prevents multiple initializations

#### 2. **Dropdown Construction**
- Builds `<select>` elements with product variant options
- Retrieves product names from ClickFunnels DOM
- Applies default selections based on `defaultIndex` or `defaultId`
- Creates wrapper divs with labels

#### 3. **DOM Integration**
- Locates bump containers using product IDs
- Finds or creates checkbox controllers
- Injects dropdown wrappers into `.sectioncontent` elements
- Maintains proper DOM hierarchy

#### 4. **Event Management**
- **Checkbox Toggle**: Shows/hides dropdowns when bump is checked/unchecked
- **Dropdown Selection**: Updates hidden ClickFunnels product radio inputs
- **Core Product Changes**: Saves and restores bump selections when main product changes
- **Form Validation**: Prevents submission if bump is checked but no variant is selected

#### 5. **State Management**
- Tracks current selection for each bump
- Saves selections when user changes core products
- Restores selections after core product switches
- Prevents recursive updates with `isUpdatingBumpSelector` flag

#### 6. **Visual Enhancement**
- Adds featured text badges (e.g., "*BONUS!*") to specific options
- Applies `.default-option-selected` class for styling
- Shows/hides dropdowns with smooth transitions

#### 7. **ClickFunnels Compatibility**
- Works with ClickFunnels product radio inputs: `input[type="radio"][name="purchase[product_id]"]`
- Updates hidden product checkboxes: `input[name="purchase[product_ids][]"]`
- Integrates with order summary updates via `rebuildOrderSummary()`
- Handles form submission via `a[href="#submit-form"]` links

**Key Functions:**

| Function | Description |
|----------|-------------|
| `combinedIds(cfg)` | Returns all product IDs (main + associated) for a bump |
| `resolveDefaultIndex(cfg, ids)` | Determines which option should be selected by default |
| `findBumpContainerByCfg(cfg)` | Locates the bump's `.orderFormBump` container in DOM |
| `getProductOptionText(productId)` | Extracts product name from ClickFunnels labels |
| `uncheckAllVariantIds(cfg, exceptId)` | Ensures only one variant is selected at a time |
| `activateBump(cfg)` | Shows dropdown and selects default option |
| `deactivateBump(cfg)` | Hides dropdown and unchecks all variants |
| `saveCurrentSelections()` | Stores bump states before core product change |
| `restoreSelections()` | Restores bump states after core product change |

**Initialization Sequence:**
1. Wait for jQuery ready
2. Delay 3 seconds for ClickFunnels to render
3. Derive runtime fields for all bumps
4. Build dropdown HTML for each bump
5. Bind to visible checkboxes
6. Inject wrappers into DOM
7. Attach event listeners
8. Initialize from current state
9. Mark as initialized

---

### bump-selector-complete-core.js

**Purpose:** Consolidated all-in-one solution combining product hiding and bump selector functionality.

**Advantages:**
- **Simplified Configuration**: Only need `window.BUMP_CONFIG` (no separate `FORCE_HIDE_PRODS`)
- **Automatic Product Extraction**: Automatically extracts `associatedIds` from bump configs to hide
- **Single Script Load**: Reduces HTTP requests and script load order dependencies
- **Streamlined Maintenance**: Updates only needed in one file

**How It Works:**

1. **Extract Hide List**: Scans all `BUMP_CONFIG` entries and collects all `associatedIds`
2. **Hide Products**: Uses collected IDs to hide product rows from main form
3. **Initialize Selectors**: Runs full bump selector initialization
4. **Combined Logging**: Unified console output for easier debugging

**Key Difference from Modular Approach:**

```javascript
// Modular approach requires two configurations:
window.FORCE_HIDE_PRODS = ['5023738', '5023739'];
window.BUMP_CONFIG = [{
  mainProductId: '5023729',
  associatedIds: ['5023738', '5023739']  // Duplicated IDs
}];

// Complete core only needs one:
window.BUMP_CONFIG = [{
  mainProductId: '5023729',
  associatedIds: ['5023738', '5023739']  // Automatically hidden
}];
```

**Trade-offs:**
- ✅ **Pro**: Simpler configuration, fewer files
- ✅ **Pro**: No duplicate ID lists
- ❌ **Con**: Less modular if you only need hiding or only need selectors
- ❌ **Con**: Slightly larger file size

---

### bump-selector-styles.css

**Purpose:** Core styling for dropdown selectors and bump offer presentation.

**Styling Includes:**
- Dropdown `<select>` element appearance
- Label positioning and typography
- Wrapper container layout
- Option styling and hover states
- Responsive design considerations
- Integration with ClickFunnels default styles

---

### bump-selector-fx.css

**Purpose:** Visual effects and animations for enhanced user experience.

**Effects Include:**
- Smooth show/hide transitions for dropdowns
- Hover effects on options
- Featured badge styling (e.g., "*BONUS!*" text)
- Selection state animations
- Focus states for accessibility

---

## Implementation Approaches

### Approach 1: Modular Implementation

**When to Use:**
- You need flexibility to use product hiding without bump selectors (or vice versa)
- You have complex customizations that benefit from separation
- You want to load scripts conditionally based on page type

**Implementation:**

```html
<!-- Step 1: Hide products that will become dropdown options -->
<script>
window.FORCE_HIDE_PRODS = [
  '5023738', '5023739',  // Gift Set variants
  '5023740', '5023741',  // Gold Coin variants
  '5023743', '5023744'   // VIP Pack variants
];
</script>
<script src="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/product-row-hider.js"></script>

<!-- Step 2: Configure and load bump selectors -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-styles.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-fx.css">

<script>
window.BUMP_CONFIG = [
  {
    mainProductId: '5023729',
    associatedIds: ['5023738', '5023739'],
    includeMainInDropdown: true,
    defaultIndex: 2,
    featuredText: '*BONUS!*',
    preSelected: false
  }
  // ... more bumps
];
</script>
<script src="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-core.js"></script>
```

**File Structure:**
```
testform.html
├── window.FORCE_HIDE_PRODS configuration
├── product-row-hider.js
├── bump-selector-styles.css
├── bump-selector-fx.css
├── window.BUMP_CONFIG configuration
└── bump-selector-core.js
```

---

### Approach 2: Consolidated Implementation

**When to Use:**
- You always need both product hiding and bump selectors together
- You want simplified configuration with no duplicate IDs
- You prefer fewer script loads for better performance
- You want easier maintenance with a single source file

**Implementation:**

```html
<!-- Single configuration + single script -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-styles.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-fx.css">

<script>
// Configuration with automatic product hiding from associatedIds
window.BUMP_CONFIG = [
  {
    mainProductId: '5023729',
    associatedIds: ['5023738', '5023739'],  // Auto-hidden
    includeMainInDropdown: true,
    defaultIndex: 2,
    featuredText: '*BONUS!*',
    preSelected: false
  }
  // ... more bumps
];
</script>
<script src="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-complete-core.js"></script>
```

**File Structure:**
```
testform-bump-selector-complete-core.html
├── bump-selector-styles.css
├── bump-selector-fx.css
├── window.BUMP_CONFIG configuration
└── bump-selector-complete-core.js (includes hiding)
```

---

## Configuration Reference

### BUMP_CONFIG Object Structure

Each bump configuration object supports the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `mainProductId` | String/null | Yes | ClickFunnels product ID for the main bump offer. Use `null` for simple checkbox bumps without dropdowns. |
| `associatedIds` | Array | Yes | Array of product IDs that become dropdown options. Empty array `[]` for simple bumps. |
| `includeMainInDropdown` | Boolean | No | If `true`, includes `mainProductId` as an option in the dropdown. Default: `false` |
| `defaultId` | String | No | Specific product ID to select by default. Overrides `defaultIndex`. |
| `defaultIndex` | Number | No | Zero-based index of which option to select by default. Default: `0` |
| `featuredText` | String | No | Badge text to append to the default option (e.g., `"*BONUS!*"`, `"*HOT!*"`). Default: `''` |
| `preSelected` | Boolean | No | If `true`, automatically checks the bump checkbox on page load. Default: `false` |

### Configuration Examples

#### Simple Checkbox Bump (No Dropdown)

```javascript
{
  mainProductId: null,
  associatedIds: [],
  includeMainInDropdown: false,
  defaultIndex: 0,
  featuredText: '',
  preSelected: false
}
```

#### Dropdown with 2 Variants (Not Including Main)

```javascript
{
  mainProductId: '5023729',
  associatedIds: ['5023738', '5023739'],
  includeMainInDropdown: false,
  defaultIndex: 1,
  featuredText: '*BEST VALUE*',
  preSelected: false
}
```

#### Dropdown Including Main Product as Option

```javascript
{
  mainProductId: '5023731',
  associatedIds: ['5023740', '5023741'],
  includeMainInDropdown: true,  // Main becomes first option
  defaultIndex: 2,               // Selects 3rd option (after main)
  featuredText: '*MOST POPULAR*',
  preSelected: false
}
```

#### Pre-Selected Bump with Featured Badge

```javascript
{
  mainProductId: '5023733',
  associatedIds: ['5023743', '5023744', '5023745'],
  includeMainInDropdown: true,
  defaultIndex: 3,
  featuredText: '*VIP BONUS!*',
  preSelected: true  // Automatically checked on load
}
```

---

## Usage Examples

### Example 1: Basic 3-Option Quantity Selector

**Scenario:** Offer customers 1x, 3x, or 5x quantities of a product.

```javascript
window.BUMP_CONFIG = [
  {
    mainProductId: '1001',        // 1x quantity
    associatedIds: ['1002', '1003'], // 3x and 5x
    includeMainInDropdown: true,  // Include 1x in dropdown
    defaultIndex: 1,              // Pre-select 3x (middle option)
    featuredText: '*MOST POPULAR*',
    preSelected: false
  }
];
```

**Result:** Dropdown shows:
- 1x Product Name - $29
- 3x Product Name - $67 *MOST POPULAR* ← Pre-selected
- 5x Product Name - $99

---

### Example 2: Multiple Bump Offers

**Scenario:** Three different bump offers on the same order form.

```javascript
window.BUMP_CONFIG = [
  // Bump 1: Rush Processing
  {
    mainProductId: null,
    associatedIds: [],
    includeMainInDropdown: false,
    defaultIndex: 0,
    featuredText: '',
    preSelected: false
  },
  
  // Bump 2: Premium Package with 4 tiers
  {
    mainProductId: '2001',
    associatedIds: ['2002', '2003', '2004'],
    includeMainInDropdown: true,
    defaultIndex: 2,
    featuredText: '*BEST VALUE*',
    preSelected: false
  },
  
  // Bump 3: VIP Add-on with 2 options
  {
    mainProductId: '3001',
    associatedIds: ['3002'],
    includeMainInDropdown: true,
    defaultIndex: 0,
    featuredText: '*LIMITED TIME*',
    preSelected: true  // Auto-checked
  }
];
```

---

### Example 3: Using defaultId Instead of defaultIndex

**Scenario:** You want to select a specific product by ID regardless of order.

```javascript
window.BUMP_CONFIG = [
  {
    mainProductId: '4001',
    associatedIds: ['4002', '4003', '4004', '4005'],
    includeMainInDropdown: true,
    defaultId: '4004',  // Select this specific product
    featuredText: '*RECOMMENDED*',
    preSelected: false
  }
];
```

---

## API Reference

### Global Variables

#### window.BUMP_CONFIG
- **Type:** `Array<Object>`
- **Required:** Yes
- **Description:** Configuration array defining all bump selector behaviors
- **Must be defined:** Before loading `bump-selector-core.js` or `bump-selector-complete-core.js`

#### window.FORCE_HIDE_PRODS
- **Type:** `Array<String>`
- **Required:** Only for modular approach
- **Description:** Array of product IDs to hide from main order form
- **Must be defined:** Before loading `product-row-hider.js`
- **Not needed:** When using `bump-selector-complete-core.js`

#### window.BUMP_SELECTOR_INITIALIZED
- **Type:** `Boolean`
- **Set by:** Bump selector scripts
- **Description:** Flag indicating bump selector has been initialized (prevents double initialization)

#### window.PRODUCT_ROW_HIDER_INITIALIZED
- **Type:** `Boolean`
- **Set by:** `product-row-hider.js`
- **Description:** Flag indicating product row hider has been initialized

---

### CSS Classes

#### .bump-selector-wrap
- **Applied to:** Dropdown wrapper `<div>`
- **Purpose:** Container for label and `<select>` element
- **Default state:** Hidden until bump checkbox is checked

#### .quantity-selector-label
- **Applied to:** Label above dropdown
- **Default text:** "Select Quantity:"
- **Can be customized:** Via CSS overrides

#### [data-bump-hidden="1"]
- **Applied to:** Hidden product rows and radio inputs
- **Purpose:** CSS targeting for force-hidden products
- **Styling:** `display: none !important;`

#### .default-option
- **Applied to:** Default `<option>` element in dropdown
- **Purpose:** Identifies which option is the recommended default

#### .default-option-selected
- **Applied to:** Currently selected default option
- **Purpose:** Visual styling for selected state

---

### Events

The bump selector system listens to and triggers various events:

#### Listened Events

| Event | Target | Purpose |
|-------|--------|---------|
| `click` | Bump checkbox | Show/hide dropdown when bump is toggled |
| `change` | Dropdown `<select>` | Update ClickFunnels product selection |
| `change` | `[name="purchase[product_id]"]` | Save/restore bump selections when core product changes |
| `click` | `a[href="#submit-form"]` | Validate bump selections before form submission |

#### Triggered Events

The system updates the ClickFunnels form state, which may trigger:
- Order summary recalculation
- Price updates
- Cart modifications

---

### Helper Functions (Internal)

These functions are not exposed publicly but are documented for understanding:

#### combinedIds(cfg)
```javascript
function combinedIds(cfg)
```
- **Returns:** Array of all product IDs for a bump (main + associated)
- **Used for:** Determining which products belong to a bump

#### resolveDefaultIndex(cfg, ids)
```javascript
function resolveDefaultIndex(cfg, ids)
```
- **Returns:** Zero-based index of default option
- **Priority:** `defaultId` > `defaultIndex` > 0

#### findBumpContainerByCfg(cfg)
```javascript
function findBumpContainerByCfg(cfg)
```
- **Returns:** jQuery object of `.orderFormBump` container
- **Fallback strategy:**
  1. Find by `mainProductId`
  2. Find by first `associatedId`
  3. Use bump `index` position

#### getProductOptionText(productId)
```javascript
function getProductOptionText(productId)
```
- **Returns:** Product name string from ClickFunnels label
- **Used for:** Populating dropdown option text

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Dropdowns Not Appearing

**Symptoms:** Bump checkboxes show but no dropdowns render

**Possible Causes:**
- `window.BUMP_CONFIG` not defined before script loads
- Product IDs don't match ClickFunnels product IDs
- jQuery not loaded
- Timing issue (script runs before ClickFunnels renders bumps)

**Solutions:**
```javascript
// Check console for errors:
// "Bump Selector: window.BUMP_CONFIG must be defined before loading this script"

// Verify configuration is defined BEFORE script tag:
<script>
window.BUMP_CONFIG = [ /* config */ ];
</script>
<script src="bump-selector-core.js"></script>  // AFTER config

// Check product IDs match exactly:
console.log($('input[type="radio"][value="YOUR_PRODUCT_ID"]').length);
// Should return > 0 if product exists

// Verify jQuery is loaded:
console.log(typeof jQuery);  // Should return "function"
```

---

#### 2. Products Still Visible in Main Form

**Symptoms:** Variant products appear both in main form and bump dropdowns

**Possible Causes:**
- `window.FORCE_HIDE_PRODS` not defined (modular approach)
- `associatedIds` not defined (complete core approach)
- Product IDs don't match
- Script timing issue

**Solutions:**
```javascript
// For modular approach - verify FORCE_HIDE_PRODS defined:
console.log(window.FORCE_HIDE_PRODS);

// For complete core - verify associatedIds in BUMP_CONFIG:
console.log(window.BUMP_CONFIG[0].associatedIds);

// Check if products are being hidden:
setTimeout(() => {
  console.log($('[data-bump-hidden="1"]').length);
  // Should match number of products to hide
}, 3000);

// Force manual hiding test:
$('input[type="radio"][value="PRODUCT_ID"]')
  .closest('.elOrderProductOptinProducts')
  .hide();
```

---

#### 3. Featured Text Not Showing

**Symptoms:** `featuredText` configured but doesn't appear on options

**Possible Causes:**
- Dropdown not activated (bump not checked)
- CSS hiding the featured text
- Text getting stripped by sanitization

**Solutions:**
```javascript
// Check if featured text is in DOM:
console.log($('select option:contains("*BONUS!*")').length);

// Verify activation:
$('#bump-select-checker-1').prop('checked', true).trigger('click');

// Check option HTML:
$('select option').each(function() {
  console.log($(this).text());
});
```

---

#### 4. Form Submits Without Selection

**Symptoms:** Form submits even though bump is checked but no dropdown selection made

**Possible Causes:**
- Validation not attached to submit button
- Submit button selector doesn't match
- JavaScript error preventing validation

**Solutions:**
```javascript
// Verify submit button selector:
console.log($('a[href="#submit-form"]').length);
// Should return > 0

// Manually trigger validation:
$('a[href="#submit-form"]').trigger('click');

// Check for JavaScript errors in console
```

---

#### 5. Selections Lost on Product Change

**Symptoms:** Bump selections reset when customer changes main product

**Possible Causes:**
- Save/restore functions not working
- Core product selector doesn't match expected format

**Solutions:**
```javascript
// Verify core product selector:
console.log($('[name="purchase[product_id]"]').length);

// Test save/restore manually:
// Make selections, then:
$('[name="purchase[product_id]"]').eq(1).prop('checked', true).trigger('change');
// Selections should restore after 500ms delay
```

---

### Debug Mode

Enable verbose console logging by adding this before loading scripts:

```javascript
window.BUMP_SELECTOR_DEBUG = true;
```

This will output detailed information about:
- Configuration validation
- Dropdown building process
- DOM element discovery
- Event firing
- State changes

---

### Browser Compatibility

**Tested and Working:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Requirements:**
- jQuery (loaded by ClickFunnels)
- ES5+ JavaScript support
- CSS3 support

---

## Advanced Customization

### Custom Styling

Override default styles by adding CSS after the bump selector stylesheets:

```css
/* Custom dropdown styling */
.bump-selector-wrap select {
  border: 2px solid #007bff;
  border-radius: 8px;
  font-size: 16px;
  padding: 12px;
}

/* Custom label styling */
.quantity-selector-label {
  color: #333;
  font-weight: bold;
  font-size: 14px;
}

/* Featured badge styling */
.default-option-selected {
  background-color: #ffc107;
  font-weight: bold;
}
```

---

### Custom Featured Text Positioning

Modify how featured text appears in options:

```javascript
// In bump-selector-core.js, locate the featured text insertion:
// Around line 315-330

if (cfg.featuredText && $opt.length) {
  var origText = $opt.attr('data-original-text');
  // Customize format here:
  $opt.text(origText + ' ' + cfg.featuredText);  // Append
  // OR
  $opt.text(cfg.featuredText + ' ' + origText);  // Prepend
}
```

---

### Custom Validation Messages

Modify the validation alert message:

```javascript
// In bump-selector-core.js, locate validation section:
// Around line 415-430

alert("You must select an option");  // Change this text
```

---

## CDN Delivery

### jsDelivr CDN URLs

All files are served via jsDelivr's global CDN:

```
https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/
```

### Version Management

**Latest (Main Branch):**
```html
<script src="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-core.js"></script>
```
- Updates automatically when you push to `main` branch
- Cache refreshes within minutes
- Good for development/testing

**Tagged Version:**
```html
<script src="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@v1.3.0/cdn/bump-selector-core.js"></script>
```
- Locked to specific release version
- Cached permanently
- Good for production (stable)

### Creating Version Tags

```bash
# Tag a release
git tag v1.3.0
git push origin v1.3.0

# CDN URL becomes available:
# https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@v1.3.0/cdn/...
```

---

## Migration Guide

### Migrating from Modular to Complete Core

**Before:**
```html
<script>
window.FORCE_HIDE_PRODS = ['5023738', '5023739'];
</script>
<script src="product-row-hider.js"></script>

<script>
window.BUMP_CONFIG = [{
  mainProductId: '5023729',
  associatedIds: ['5023738', '5023739']
}];
</script>
<script src="bump-selector-core.js"></script>
```

**After:**
```html
<script>
window.BUMP_CONFIG = [{
  mainProductId: '5023729',
  associatedIds: ['5023738', '5023739']  // Auto-hidden
}];
</script>
<script src="bump-selector-complete-core.js"></script>
```

**Steps:**
1. Remove `window.FORCE_HIDE_PRODS` configuration
2. Remove `product-row-hider.js` script tag
3. Replace `bump-selector-core.js` with `bump-selector-complete-core.js`
4. Keep `window.BUMP_CONFIG` exactly as-is (no changes needed)

---

## Support and Contributing

### Repository
[https://github.com/kratner/ace-media-cfaddins](https://github.com/kratner/ace-media-cfaddins)

### Issues
Report bugs or request features via GitHub Issues

### Contributing
Pull requests welcome for:
- Bug fixes
- Performance improvements
- Documentation enhancements
- New features (please discuss first in Issues)

---

## License

© 2025 Ace Media  
All rights reserved.

---

## Changelog

### Version 1.3.0 (2025-12-16)
- Added `bump-selector-complete-core.js` for consolidated implementation
- Enhanced console logging for debugging
- Improved documentation
- Added MutationObserver for robust product hiding

### Version 1.2.5 (2025-12-15)
- Refactored for CDN distribution
- Added external configuration support
- Improved error handling
- IIFE namespace isolation

### Version 1.0.0 (2024-12-01)
- Initial release
- Basic bump selector functionality
- Product row hiding
- ClickFunnels integration

---

**End of Documentation**
