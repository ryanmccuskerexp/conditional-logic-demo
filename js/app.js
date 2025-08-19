document.addEventListener('DOMContentLoaded', () => {
  // 1. Toggle builder visibility with the correct ID
  const toggle = document.getElementById('toggle-conditional');
  const builder = document.getElementById('conditional-builder');
  if (toggle && builder) {
    // Show builder and enable toggle by default
    toggle.checked = true;
    builder.style.display = 'block';
    toggle.addEventListener('change', () => {
      builder.style.display = toggle.checked ? 'block' : 'none';
    });
    // Add a default rule block on load
    const builderContainer = document.getElementById('builder-container');
    if (builderContainer && builderContainer.children.length === 0) {
      addRule();
    }
  }

  // --- only these types are eligible for conditional logic ---
  const formFields = [
    { name:'experianCustomer',
      label:'Are you a current Experian Customer?',
      type:'radio',
      values:['yes','no']
    },
    { name:'employeesCount',
      label:'How many employees does your company have?',
      type:'radio',
      values:['≤100','>100']
    },
    { name:'permissiblePurpose',
      label:'Do you have permissible purpose?',
      type:'radio',
      values:['yes','no']
    },
    { name:'country',
      label:'Country',
      type:'select',
      values:['United States']
    },
    { name:'email',       label:'Email',       type:'text', values:[] },
    { name:'firstName',   label:'First Name',  type:'text', values:[] },
    { name:'lastName',    label:'Last Name',   type:'text', values:[] },
    { name:'company',     label:'Company',     type:'text', values:[] },
    { name:'phone',       label:'Phone',       type:'text', values:[] }
  ];

  // only keep non‐open‐text fields
  const fields = formFields.filter(f =>
    ['radio','select','checkbox','multiselect'].includes(f.type)
  );

  const actions = [
    { value:'redirect', label:'Redirect URL' },
    { value:'message',  label:'Display Message' }
  ];

  function createCondition(host, withOperator = false) {
    const block = host.closest('.rule-block');
    const conditionRows = host.querySelectorAll('.row');
    // Limit number of conditions
    if (conditionRows.length >= 5) {
      let err = block.querySelector('.condition-limit-error');
      if (!err) {
        err = document.createElement('div');
        err.className = 'condition-limit-error';
        err.textContent = 'You cannot add more than 5 conditions';
        err.style.color = '#c00';
        err.style.fontSize = '0.95em';
        err.style.marginTop = '0.5em';
        host.after(err);
        setTimeout(() => { if (err) err.remove(); }, 2500);
      }
      return;
    }

    const row = document.createElement('div');
    row.className = 'row condition-inline';

    // optional AND/OR dropdown
    if (withOperator) {
      const op = document.createElement('select');
      op.className = 'operator-select';
      ['AND','OR'].forEach(v => {
        const o = document.createElement('option');
        o.value = v.toLowerCase();
        o.textContent = v;
        op.appendChild(o);
      });
      row.appendChild(op);
    }


    // Inline field and value selection
    const fieldWrap = document.createElement('div');
    fieldWrap.style.display = 'inline-flex';
    fieldWrap.style.alignItems = 'center';
    fieldWrap.style.gap = '0.5em';
    fieldWrap.style.flex = '1 1 220px';
    // No extra background here; let .row CSS handle it

    const fld = document.createElement('select');
    fld.className = 'field-select';
    fld.style.flex = '1 1 120px';
    fld.innerHTML = '<option value="">Choose field</option>' +
                    fields.map(f => `<option value="${f.name}">${f.label}</option>`).join('');
    fieldWrap.appendChild(fld);

    const val = document.createElement('select');
    val.className = 'value-select';
    val.style.flex = '1 1 120px';
    val.innerHTML = '<option value="">Choose value</option>';
    // Always attach listeners before adding to DOM
    fld.onchange = function() {
      val.innerHTML = '<option value="">Choose value</option>';
      const sel = fields.find(x => x.name === fld.value);
      if (sel && sel.values) {
        sel.values.forEach(v => {
          const o = document.createElement('option');
          o.value = v; o.textContent = v;
          val.appendChild(o);
        });
      }
      updateDisabledOptions();
    };
    val.onchange = updateDisabledOptions;
    fieldWrap.appendChild(val);

    row.appendChild(fieldWrap);

    // remove‐condition button (hide for first condition, always update after add/remove)
    const rem = document.createElement('button');
    rem.className = 'remove-btn';
    rem.textContent = '–';
    rem.type = 'button';
    rem.style.marginLeft = '0.5em';
    rem.style.zIndex = '10';
    rem.addEventListener('click', function(e) {
      e.preventDefault();
      let err = row.nextSibling;
      if (err && err.classList && err.classList.contains('conflict-error')) {
        err.remove();
      }
      row.remove();
      updateRemoveButtons(host);
      updateDisabledOptions();
    });
    row.appendChild(rem);

    // For subsequent rows, make them wider
    if (withOperator) {
      row.style.maxWidth = '100%';
      row.style.flexWrap = 'nowrap';
      fieldWrap.style.flex = '2 1 320px';
      fld.style.flex = '1 1 160px';
      val.style.flex = '1 1 160px';
    }

    host.appendChild(row);
    updateRemoveButtons(host);
    updateDisabledOptions();

    // Helper to update remove button visibility for all condition rows
    function updateRemoveButtons(container) {
      const rows = container.querySelectorAll('.row');
      rows.forEach((r, idx) => {
        const btn = r.querySelector('.remove-btn');
        if (btn) {
          btn.style.display = (idx === 0) ? 'none' : '';
          btn.style.pointerEvents = (idx === 0) ? 'none' : 'auto';
        }
      });
    }

    // After creating the row, add event listener for AND/OR change
    const lastRow = host.querySelector('.row:last-child');
    if (lastRow) {
      const opSel = lastRow.querySelector('.operator-select');
      if (opSel) {
        opSel.addEventListener('change', function() {
          // Check for conflicting logic immediately
          const fieldValues = {};
          const rows = host.querySelectorAll('.row');
          rows.forEach(row => {
            const fieldSel = row.querySelector('.field-select');
            const valueSel = row.querySelector('.value-select');
            const opSel2 = row.querySelector('.operator-select');
            if (fieldSel && valueSel && fieldSel.value && valueSel.value) {
              if (!fieldValues[fieldSel.value]) fieldValues[fieldSel.value] = [];
              fieldValues[fieldSel.value].push({ value: valueSel.value, op: opSel2 ? opSel2.value : null });
            }
          });
          Object.keys(fieldValues).forEach(field => {
            const vals = fieldValues[field];
            if (vals.length > 1 && vals.every(v => v.op === 'and' || v.op === null)) {
              const uniqueVals = [...new Set(vals.map(v => v.value))];
              let err = block.querySelector('.conflict-error');
              if (uniqueVals.length > 1) {
                if (!err) {
                  err = document.createElement('div');
                  err.className = 'conflict-error';
                  err.textContent = 'This rule contains conflicting conditions.';
                  err.style.color = '#c00';
                  err.style.fontSize = '0.95em';
                  err.style.marginTop = '0.5em';
                  host.after(err);
                }
              } else {
                if (err) err.remove();
              }
            } else {
              let err = block.querySelector('.conflict-error');
              if (err) err.remove();
            }
          });
        });
      }
    }
  }

  function makePathChooser(accept, placeholder) {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex'; wrap.style.gap = '.5em';
    const txt = document.createElement('input');
    txt.type = 'text'; txt.readOnly = true;
    txt.placeholder = placeholder; txt.style.flex = '1';
    const btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = '📁';
    btn.onclick = () => hid.click();
    btn.className = 'browse-btn';
    const hid = document.createElement('input');
    hid.type = 'file'; hid.accept = accept; hid.style.display = 'none';
    hid.onchange = () => txt.value = hid.files[0]?.name || '';
    wrap.append(txt, btn, hid);
    return wrap;
  }

  function createAction(host) {
    const row = document.createElement('div');
    row.className = 'row';

    const topSelect   = document.getElementById('confirmation-target');
    const type        = topSelect.value;
    const label       = topSelect.selectedOptions[0].text;

    const act = document.createElement('select');
    act.disabled = true; act.className = 'action-select';
    act.innerHTML = `<option value="${type}">${label}</option>`;

    let widget;
    if (type === 'redirect') {
      widget = document.createElement('input');
      widget.type = 'text';
      widget.placeholder = 'Enter redirect URL…';
      widget.style.flex = '1';
    }
    else if (type === 'modal') {
      widget = makePathChooser('.html','Select .html file…');
    }
    else { // download
      widget = makePathChooser('.zip','Select .zip file…');
    }

    const rem = document.createElement('button');
    rem.className = 'remove-btn'; rem.textContent = '–';
    // Only show remove button if this is not the first action
    if (host.querySelectorAll('.row').length > 0) {
      rem.style.display = '';
      rem.onclick = () => row.remove();
      row.append(act, widget, rem);
    } else {
      rem.style.display = 'none';
      row.append(act, widget, rem);
    }
    host.appendChild(row);
  }

  // update all rows if top-level changes
  const topSelect = document.getElementById('confirmation-target');
  topSelect.addEventListener('change', () => {
    document.querySelectorAll('.row').forEach(row => {
      const oldInput = row.querySelector('input');
      if (!oldInput) return;
      // rebuild the input just like createAction does
      let newInput;
      if (topSelect.value === 'redirect') {
        newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.placeholder = 'Enter redirect URL…';
      } else if (topSelect.value === 'modal') {
        newInput = document.createElement('input');
        newInput.type   = 'file';
        newInput.accept = '.html';
      } else {
        newInput = document.createElement('input');
        newInput.type   = 'file';
        newInput.accept = '.zip';
      }
      newInput.style.flex = '1';
      row.replaceChild(newInput, oldInput);
    });

    // also refresh the locked select options
    const label = topSelect.selectedOptions[0].text;
    const val   = topSelect.value;
    document.querySelectorAll('select.action-select')
      .forEach(s => s.innerHTML = `<option value="${val}">${label}</option>`);
  });

  function addRule() {
    const builder = document.getElementById('builder-container');
    const block   = document.createElement('div');
    block.className = 'rule-block';

    // remove rule
    const x = document.createElement('button');
    x.className = 'remove-rule'; x.textContent = '✕';
    x.onclick = () => {
      block.remove();
      checkRuleConflicts();
    };
    block.appendChild(x);

    const sec = document.createElement('div');
    sec.className = 'sections';

    // IF section
    const ifS = document.createElement('div');
    ifS.className = 'section';
    ifS.innerHTML = '<h3>If…</h3>';
    const ifC = document.createElement('div');
    ifC.className = 'conditions';
    ifS.append(ifC, (() => {
      const b = document.createElement('button');
      b.className = 'add-btn'; b.textContent = '+ Condition';
      // pass true to get AND/OR on additional rows
      b.onclick = () => { createCondition(ifC, true); checkRuleConflicts(); };
      return b;
    })());

    // THEN section
    const thenS = document.createElement('div');
    thenS.className = 'section';
    thenS.innerHTML = '<h3>Then…</h3>';
    const thenC = document.createElement('div');
    thenC.className = 'actions';
    thenS.append(thenC);

    // one action per block
    createAction(thenC);

    sec.append(ifS, thenS);
    block.appendChild(sec);

    // init first condition (no operator)
    createCondition(ifC);
    // ensure disabling is enforced on new rule
    updateDisabledOptions();

    builder.appendChild(block);
    checkRuleConflicts();

    // Re-check conflicts whenever a field/value/operator/action changes
    block.addEventListener('change', checkRuleConflicts, true);
  }

  // Helper: get conditions and action for a rule block
  function getRuleData(block) {
    const conds = [];
    block.querySelectorAll('.conditions .row').forEach(row => {
      const field = row.querySelector('.field-select')?.value;
      const value = row.querySelector('.value-select')?.value;
      const op = row.querySelector('.operator-select')?.value || null;
      if (field && value) conds.push({ field, value, op });
    });
    // Only one action per rule
    const actionRow = block.querySelector('.actions .row');
    let actionType = null, actionValue = null;
    if (actionRow) {
      const sel = actionRow.querySelector('.action-select');
      if (sel) actionType = sel.value;
      const input = actionRow.querySelector('input[type="text"]');
      if (input) actionValue = input.value;
    }
    return { conds, actionType, actionValue };
  }

  // Helper: compare two rules for identical conditions
  function conditionsMatch(a, b) {
    if (a.conds.length !== b.conds.length) return false;
    for (let i = 0; i < a.conds.length; ++i) {
      if (a.conds[i].field !== b.conds[i].field ||
          a.conds[i].value !== b.conds[i].value ||
          a.conds[i].op !== b.conds[i].op) return false;
    }
    return true;
  }

  // Helper: check for conflicting rules
  function checkRuleConflicts() {
    const builder = document.getElementById('builder-container');
    const blocks = Array.from(builder.querySelectorAll('.rule-block'));
    // Remove all previous conflict errors
    blocks.forEach(b => {
      let err = b.querySelector('.conflicting-rules-error');
      if (err) err.remove();
    });
    // Compare each pair of rules
    for (let i = 0; i < blocks.length; ++i) {
      const a = getRuleData(blocks[i]);
      for (let j = i + 1; j < blocks.length; ++j) {
        const b = getRuleData(blocks[j]);
        if (conditionsMatch(a, b)) {
          // If actions differ, show error
          if (a.actionType !== b.actionType || a.actionValue !== b.actionValue) {
            [blocks[i], blocks[j]].forEach(block => {
              let err = block.querySelector('.conflicting-rules-error');
              if (!err) {
                err = document.createElement('div');
                err.className = 'conflicting-rules-error';
                err.textContent = 'Conflicting rules: identical conditions but different actions.';
                err.style.color = '#c00';
                err.style.fontSize = '0.95em';
                err.style.marginTop = '0.5em';
                block.appendChild(err);
              }
            });
          }
        }
      }
    }
  }

  // 2. Bind the “+ Add New Rule” button
  const addRuleBtn = document.getElementById('add-rule-btn');
  if (addRuleBtn) {
    addRuleBtn.addEventListener('click', function() {
      const builder = document.getElementById('builder-container');
      const ruleCount = builder.querySelectorAll('.rule-block').length;
      // Limit number of rules
      if (ruleCount >= 3) {
        // Show error below add button
        let err = document.getElementById('rule-limit-error');
        if (!err) {
          err = document.createElement('div');
          err.id = 'rule-limit-error';
          err.textContent = 'You cannot add more than 3 rules';
          err.style.color = '#c00';
          err.style.fontSize = '0.95em';
          err.style.marginTop = '0.5em';
          addRuleBtn.after(err);
        }
        return;
      } else {
        const err = document.getElementById('rule-limit-error');
        if (err) err.remove();
      }
        addRule();
        checkRuleConflicts();
    });
  }

  // 3. Save button logic with error message
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      let hasError = false;
      // Remove previous global error
      let globalErr = document.getElementById('global-error');
      if (globalErr) globalErr.remove();
      // Check if conditional logic is enabled
      const condToggle = document.getElementById('toggle-conditional');
      const builder = document.getElementById('builder-container');
      const ruleBlocks = builder.querySelectorAll('.rule-block');
      if (condToggle.checked && ruleBlocks.length === 0) {
        globalErr = document.createElement('div');
        globalErr.id = 'global-error';
        globalErr.textContent = 'Please add at least one rule if conditional logic is enabled.';
        globalErr.style.color = '#c00';
        globalErr.style.fontSize = '0.95em';
        globalErr.style.marginTop = '0.5em';
        builder.before(globalErr);
        hasError = true;
      }
      // Cross-rule conflict validation
      // Remove previous cross-rule error
      let crossRuleErr = document.getElementById('cross-rule-error');
      if (crossRuleErr) crossRuleErr.remove();
      // Gather all rule data
      const ruleDatas = Array.from(ruleBlocks).map(getRuleData);
      let crossConflict = false;
      let duplicateConflict = false;
      for (let i = 0; i < ruleDatas.length; ++i) {
        for (let j = i + 1; j < ruleDatas.length; ++j) {
          if (conditionsMatch(ruleDatas[i], ruleDatas[j])) {
            if (ruleDatas[i].actionType !== ruleDatas[j].actionType || ruleDatas[i].actionValue !== ruleDatas[j].actionValue) {
              crossConflict = true;
            } else {
              // If both conditions and actions are identical, it's a duplicate rule
              duplicateConflict = true;
            }
          }
        }
      }
      if (crossConflict || duplicateConflict) {
        hasError = true;
        crossRuleErr = document.createElement('div');
        crossRuleErr.id = 'cross-rule-error';
        crossRuleErr.style.color = '#c00';
        crossRuleErr.style.fontSize = '1em';
        crossRuleErr.style.marginBottom = '1em';
        if (crossConflict && duplicateConflict) {
          crossRuleErr.textContent = 'Conflicting rules detected: Two rules have identical conditions but different actions, and duplicate rules with identical conditions and actions.';
        } else if (crossConflict) {
          crossRuleErr.textContent = 'Conflicting rules detected: Two rules have identical conditions but different actions.';
        } else {
          crossRuleErr.textContent = 'Duplicate rules detected: Two rules have identical conditions and actions.';
        }
        builder.before(crossRuleErr);
      }

      ruleBlocks.forEach(block => {
        // Remove previous errors
        block.querySelectorAll('.action-error, .condition-error, .conflict-error, .min-condition-error').forEach(e => e.remove());
        // ...existing code...
        // Check action
        const actionRow = block.querySelector('.actions .row');
        let validAction = false;
        if (actionRow) {
          const input = actionRow.querySelector('input[type="text"], input[type="file"]');
          if (input) {
            if (input.type === 'text' && input.value.trim()) validAction = true;
            if (input.type === 'file' && input.files && input.files.length > 0) validAction = true;
          }
        }
        if (!validAction) {
          hasError = true;
          const error = document.createElement('div');
          error.className = 'action-error';
          error.textContent = 'You must enter an action for this rule.';
          error.style.color = '#c00';
          error.style.fontSize = '0.95em';
          error.style.marginTop = '0.5em';
          actionRow.after(error);
          actionRow.style.border = '2px solid #c00';
        } else {
          actionRow.style.border = '';
        }
        // Check conditions
        const conditionRows = block.querySelectorAll('.conditions .row');
        if (conditionRows.length === 0) {
          hasError = true;
          const error = document.createElement('div');
          error.className = 'min-condition-error';
          error.textContent = 'Each rule must have at least one condition.';
          error.style.color = '#c00';
          error.style.fontSize = '0.95em';
          error.style.marginTop = '0.5em';
          block.querySelector('.conditions').after(error);
        }
        if (conditionRows.length > 5) {
          hasError = true;
          const error = document.createElement('div');
          error.className = 'condition-error';
          error.textContent = 'You cannot add more than 5 conditions';
          error.style.color = '#c00';
          error.style.fontSize = '0.95em';
          error.style.marginTop = '0.5em';
          block.querySelector('.conditions').after(error);
        }
        // Check all fields/values selected
        conditionRows.forEach(row => {
          const fieldSel = row.querySelector('.field-select');
          const valueSel = row.querySelector('.value-select');
          if (!fieldSel.value || !valueSel.value) {
            hasError = true;
            const error = document.createElement('div');
            error.className = 'condition-error';
            error.textContent = 'Please select both a field and a value for every condition.';
            error.style.color = '#c00';
            error.style.fontSize = '0.95em';
            error.style.marginTop = '0.5em';
            row.after(error);
          }
        });
        // Check for conflicting logic (same field, AND, different values)
        const fieldValues = {};
        conditionRows.forEach(row => {
          const fieldSel = row.querySelector('.field-select');
          const valueSel = row.querySelector('.value-select');
          const opSel = row.querySelector('.operator-select');
          if (fieldSel.value && valueSel.value) {
            if (!fieldValues[fieldSel.value]) fieldValues[fieldSel.value] = [];
            fieldValues[fieldSel.value].push({ value: valueSel.value, op: opSel ? opSel.value : null });
          }
        });
        Object.keys(fieldValues).forEach(field => {
          const vals = fieldValues[field];
          // If more than one value for same field and all ops are AND, and values are different, it's a conflict
          if (vals.length > 1 && vals.every(v => v.op === 'and' || v.op === null)) {
            const uniqueVals = [...new Set(vals.map(v => v.value))];
            if (uniqueVals.length > 1) {
              hasError = true;
              const error = document.createElement('div');
              error.className = 'conflict-error';
              error.textContent = 'This rule contains conflicting conditions.';
              error.style.color = '#c00';
              error.style.fontSize = '0.95em';
              error.style.marginTop = '0.5em';
              block.querySelector('.conditions').after(error);
            }
          }
        });
      });
      if (hasError) {
        // Prevent save/submit
        return;
      }
      // ...proceed with save logic here...
    });
  }

  function updateDisabledOptions() {
    // For each rule block, only disable values within that block
    document.querySelectorAll('.rule-block').forEach(block => {
      // Gather selected field/value pairs in this block
      const selected = [];
      block.querySelectorAll('.conditions .row').forEach(row => {
        const fieldSel = row.querySelector('.field-select');
        const valueSel = row.querySelector('.value-select');
        if (fieldSel && valueSel && fieldSel.value && valueSel.value) {
          selected.push({ field: fieldSel.value, value: valueSel.value, sel: valueSel });
        }
      });
      // For each value-select in this block, disable options already chosen in this block (except itself)
      block.querySelectorAll('.conditions .row .value-select').forEach(sel => {
        const fieldSel = sel.closest('.row').querySelector('.field-select');
        if (!fieldSel || !fieldSel.value) return;
        Array.from(sel.options).forEach(opt => {
          if (!opt.value) return;
          // If this value is selected in another row in this block for the same field, disable it
          const isUsed = selected.some(s => s.field === fieldSel.value && s.value === opt.value && s.sel !== sel);
          opt.disabled = isUsed;
        });
      });
    });
  }
});
