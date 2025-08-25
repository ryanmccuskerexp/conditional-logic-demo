<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Confirmation Logic Builder</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>

  <div id="modal-overlay" class="modal-overlay open">
    <div class="modal-container">

      <header class="modal-header">
        <h2>Form Details Renderer</h2>
        <button id="close-modal-btn" class="close-btn">✕</button>
      </header>

      <div class="modal-body">

        <!-- TABS -->
        <nav class="tabs">
          <button class="tab"       data-target="details-content">Details</button>
          <button class="tab"       data-target="form-content">Form</button>
          <button class="tab"       data-target="design-content">Design</button>
          <button class="tab active" data-target="confirmation-content">Confirmation</button>
          <button class="tab"       data-target="hidden-content">Additional Hidden Fields</button>
        </nav>

        <!-- DETAILS PANEL -->
        <div id="details-content" class="tab-content" style="display:none;">
          <!-- … -->
        </div>

        <!-- FORM PANEL -->
        <div id="form-content" class="tab-content" style="display:none;">
          <div class="field-group">
            <p>Are you a current Experian Customer?*</p>
            <label><input type="radio" name="experianCustomer" value="yes"> Yes</label>
            <label><input type="radio" name="experianCustomer" value="no"> No</label>
          </div>
          <div class="field-group">
            <p>How many employees does your company have?*</p>
            <label><input type="radio" name="employeesCount" value="≤100"> 100 employees or less</label>
            <label><input type="radio" name="employeesCount" value=">100"> 100 employees or more</label>
          </div>
          <div class="field-group">
            <p>Do you have permissible purpose?*</p>
            <label><input type="radio" name="permissiblePurpose" value="yes"> Yes</label>
            <label><input type="radio" name="permissiblePurpose" value="no"> No</label>
          </div>
          <div class="field-group">
            <label>Country *</label>
            <select name="country">
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>Germany</option>
              <option>France</option>
              <option>India</option>
              <option>Brazil</option>
              <option>Japan</option>
              <option>Mexico</option>
              <!-- add more here if you like -->
            </select>
          </div>
          <div class="field-group"><label>Email *</label><input type="email"></div>
          <div class="field-group"><label>First Name *</label><input type="text"></div>
          <div class="field-group"><label>Last Name *</label><input type="text"></div>
          <div class="field-group"><label>Company *</label><input type="text"></div>
          <div class="field-group"><label>Phone *</label><input type="tel"></div>
        </div>

        <!-- DESIGN PANEL -->
        <div id="design-content" class="tab-content" style="display:none;">
          <!-- … -->
        </div>

        <!-- CONFIRMATION PANEL -->
        <div id="confirmation-content" class="tab-content" style="display:block;">
          <!-- CONFIRMATION TARGET -->
          <div class="field-group">
            <label for="confirmation-target">Confirmation target *</label>
            <select id="confirmation-target">
              <option value="redirect">Redirect</option>
              <option value="modal">Modal</option>
              <option value="download">Download</option>
            </select>
          </div>

          <!-- DEFAULT PAGE (dynamic) -->
          <div class="field-group" id="default-page-group">
            <label for="default-input" id="default-label">Choose default confirmation page *</label>
            <input type="text" id="default-input" placeholder="https://">
          </div>

          <!-- CONDITIONAL LOGIC TOGGLE -->
          <label class="switch">
            <input type="checkbox" id="toggle-conditional">
            <span class="slider"></span>
            <span class="label">Conditional Logic</span>
          </label>

          <!-- CONDITIONAL BUILDER (hidden until toggle) -->
          <div id="conditional-builder">
            <div id="builder-container"></div>
            <button id="add-rule-btn" class="add-btn">+ Add New Rule</button>
          </div>
        </div>

        <!-- ADDITIONAL HIDDEN FIELDS PANEL -->
        <div id="hidden-content" class="tab-content" style="display:none;">
          <!-- … -->
        </div>

      </div>

      <footer class="modal-footer">
        <button id="cancel-btn">Cancel</button>
        <button id="save-btn">Save</button>
      </footer>

    </div>
  </div>

  <!-- quick diagnostics to confirm script load/parse -->
  <script>
    console.log('[page] inline BEFORE app.js');
    // show whether console is filtered
    console.log('[page] console levels test: debug/info/warn/error');
    console.debug('[page-debug] debug message');
  </script>

  <!-- load app.js with onload/onerror hooks so we know if it loaded or failed -->
  <script src="js/app.js"
          onload="console.log('[page] app.js loaded successfully')"
          onerror="console.error('[page] app.js failed to load (network or parse error)')"></script>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      console.log('[page] DOMContentLoaded fired (inline script)');
      // Tab switching logic (unchanged)...
      document.querySelectorAll('.tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
          console.log('[page] tab click:', tab.getAttribute('data-target'));
          // Remove active from all tabs
          document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          // Hide all tab panels
          document.querySelectorAll('.tab-content').forEach(panel => panel.style.display = 'none');
          // Show the selected panel
          const target = tab.getAttribute('data-target');
          document.getElementById(target).style.display = 'block';
          // If switching to Confirmation tab, ensure builder and toggle are visible/enabled
          if (target === 'confirmation-content') {
            var toggle = document.getElementById('toggle-conditional');
            var builder = document.getElementById('conditional-builder');
            var builderContainer = document.getElementById('builder-container');
            if (toggle && builder) {
              toggle.checked = true;
              builder.style.display = 'block';
              // If no rule block exists, add one using app.js logic
              if (builderContainer && builderContainer.children.length === 0 && typeof window.addRule === 'function') {
                window.addRule();
              }
            }
          }
        });
      });
    });
  </script>
</body>
</html>
