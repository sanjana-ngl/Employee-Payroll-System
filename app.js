const OT_RATE = 200;
let wasmReady = false;
let outputBuffer = '';
var inputQueue = [];

window.prompt = function() {
  return inputQueue.length > 0 ? inputQueue.shift() : '';
};
function updateDashboard() {
  if (!wasmReady) return;
  const raw = runC(['7']);
  let count = 0, tGross = 0, tTax = 0, tNet = 0;

  raw.split('\n').forEach(line => {
    const m = line.trim().match(/^(\d+)\s+(\S.*?\S|\S+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*$/);
    if (m) {
      count++;
      tGross += +m[3];
      tTax   += +m[4];
      tNet   += +m[5];
    }
  });

  document.getElementById('dash-count').textContent   = count;
  document.getElementById('dash-payroll').textContent = count ? fmt(tGross) : '₹0';
  document.getElementById('dash-tax').textContent     = count ? fmt(tTax)   : '₹0';
  document.getElementById('dash-net').textContent     = count ? fmt(tNet)   : '₹0';
}
var Module = {
  print: function(...args) {
    const text = args.join(' ');
    outputBuffer += text + '\n';
    appendTerminal(text);
  },
  printErr: function() {},
  noInitialRun: true,
  onRuntimeInitialized: function() {
    wasmReady = true;
    appendTerminal('// C Payroll Engine initialized ✓');
    showToast('C Engine Ready', 'success');
    updateDashboard();
  }
};

function appendTerminal(text) {
  const out = document.getElementById('output');
  if (!out) return;
  out.value += text + '\n';
  out.scrollTop = out.scrollHeight;
}

function runC(inputs) {
  if (!wasmReady) return '';
  outputBuffer = '';
  inputQueue.length = 0;
  inputQueue.push(...inputs);

  try {
    Module._main(0, 0);
  } catch(e) {}

  return outputBuffer;
}

// ─── Navigation ──────────────────────
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector('[data-page="' + page + '"]').classList.add('active');
  document.getElementById('sidebar').classList.remove('open');

  document.querySelectorAll('.form-input').forEach(el => el.value = '');

  document.querySelectorAll('.result-box').forEach(el => {
    el.textContent = '';
    el.className = 'result-box';
  });

  const searchCard = document.getElementById('search-card');
  const payslipDoc = document.getElementById('payslip-doc');
  if (searchCard) searchCard.style.display = 'none';
  if (payslipDoc) payslipDoc.style.display = 'none';

  ['pv-id','pv-name','pv-pay','pv-ot','pv-gross','pv-tax','pv-net'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '—';
  });

  if (page === 'home')   updateDashboard();
  if (page === 'add')    setupAddPreview();
  if (page === 'view')   doViewEmployees();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

function showResult(id, msg, type = 'success') {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'result-box ' + type;
}

function calcGross(basic, ot) { return basic + ot * OT_RATE; }

function calcTax(gross) {
  if (gross <= 30000) return gross * 0.05;
  if (gross <= 60000) return gross * 0.10;
  return gross * 0.15;
}

function fmt(n) {
  return '₹' + parseFloat(n).toLocaleString('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });
}

// ─── Add Employee ─────────────────────
function updatePreview() {
  const id   = document.getElementById('add-id').value;
  const name = document.getElementById('add-name').value;
  const pay  = parseFloat(document.getElementById('add-pay').value);
  const ot   = parseInt(document.getElementById('add-ot').value);

  document.getElementById('pv-id').textContent   = id || '—';
  document.getElementById('pv-name').textContent =
    name && !/\d/.test(name) ? name : '—';
  document.getElementById('pv-pay').textContent  =
    !isNaN(pay) && pay >= 0 ? fmt(pay) : '—';
  document.getElementById('pv-ot').textContent   =
    !isNaN(ot) && ot >= 0 ? ot + ' hrs' : '—';

  if (!isNaN(pay) && pay > 0 && !isNaN(ot) && ot >= 0) {
    const gross = calcGross(pay, ot);
    const tax   = calcTax(gross);
    document.getElementById('pv-gross').textContent = fmt(gross);
    document.getElementById('pv-tax').textContent   = fmt(tax);
    document.getElementById('pv-net').textContent   = fmt(gross - tax);
  } else {
    ['pv-gross','pv-tax','pv-net'].forEach(i =>
      document.getElementById(i).textContent = '—');
  }
}

function setupAddPreview() {
  ['add-id','add-name','add-pay','add-ot'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.removeEventListener('input', updatePreview);
      el.addEventListener('input', updatePreview);
    }
  });
}

function doAddEmployee() {
  const id   = document.getElementById('add-id').value.trim();
  const name = document.getElementById('add-name').value.trim();
  const pay  = document.getElementById('add-pay').value.trim();
  const ot   = document.getElementById('add-ot').value.trim();

  if (!id || !name || !pay || !ot) {
    showResult('add-result', '⚠ Please fill all fields.', 'error');
    return;
  }

  if (parseInt(id) <= 0) {
    showResult('add-result', '⚠ Employee ID must be positive.', 'error');
    return;
  }

  if (/\d/.test(name)) {
    showResult('add-result', '⚠ Employee name cannot contain numbers.', 'error');
    return;
  }

  if (parseFloat(pay) < 0) {
    showResult('add-result', '⚠ Basic pay cannot be negative.', 'error');
    return;
  }

  if (parseInt(ot) < 0) {
    showResult('add-result', '⚠ OT hours cannot be negative.', 'error');
    return;
  }

  if (!wasmReady) {
    showResult('add-result', '⚠ C Engine not ready yet.', 'error');
    return;
  }

  const output = runC(['1', id, name, pay, ot]) || '';
  const lines = output
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const errorLine = lines.find(line =>
    line.includes('Duplicate Employee ID not allowed!') ||
    line.includes('Invalid ID!') ||
    line.includes('Invalid name!') ||
    line.includes('Invalid salary!') ||
    line.includes('Invalid OT Hours!') ||
    line.includes('Invalid input')
  );

  if (errorLine) {
    showResult('add-result', `⚠ ${errorLine}`, 'error');
    showToast(errorLine, 'error');
    return;
  }

  const successLine = lines.find(line =>
    line.includes('Employee added successfully.')
  );

  if (successLine) {
    showResult('add-result', `✓ Employee "${name}" (ID: ${id}) added!`, 'success');
    showToast('Employee added!', 'success');
    ['add-id','add-name','add-pay','add-ot'].forEach(i =>
      document.getElementById(i).value = '');
    updatePreview();
    return;
  }

  showResult('add-result', '⚠ Unexpected response from C program.', 'error');
}

// ─── View Employees ───────────────────
function doViewEmployees() {
  if (!wasmReady) {
    showResult('view-result', '⚠ C Engine not ready.', 'error'); return;
  }
  const raw = runC(['2']);
  renderViewTable(parseEmployeeList(raw));
}

function parseEmployeeList(raw) {
  return raw.split('\n').reduce((acc, line) => {
    const m = line.trim().match(/^(\d+)\s+(\S.*?\S|\S+)\s+([\d.]+)\s+(\d+)\s*$/);
    if (m) acc.push({ id: +m[1], name: m[2].trim(), basic: +m[3], ot: +m[4] });
    return acc;
  }, []);
}

function renderViewTable(employees) {
  const tbody = document.getElementById('emp-tbody');
  if (!employees.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No records found.</td></tr>';
    showResult('view-result', '⚠ No records found.', 'error');
    return;
  }
  tbody.innerHTML = employees.map(e => {
    const gross = calcGross(e.basic, e.ot);
    const tax   = calcTax(gross);
    return `<tr>
      <td class="td-id">${e.id}</td>
      <td>${e.name}</td>
      <td>${fmt(e.basic)}</td>
      <td>${e.ot}</td>
      <td>${fmt(gross)}</td>
      <td>${fmt(tax)}</td>
      <td class="td-net">${fmt(gross - tax)}</td>
    </tr>`;
  }).join('');
  showResult('view-result', `✓ Loaded ${employees.length} record(s).`, 'success');
}

// ─── Search ───────────────────────────
function doSearchEmployee() {
  const id = document.getElementById('search-id').value.trim();
  if (!id)        { showResult('search-result', '⚠ Enter an Employee ID.', 'error'); return; }
  if (!wasmReady) { showResult('search-result', '⚠ C Engine not ready.', 'error'); return; }

  const raw = runC(['3', id]);

  if (raw.includes('not found') || !raw.includes('Name')) {
    document.getElementById('search-card').style.display = 'none';
    showResult('search-result', `⚠ No employee found with ID ${id}.`, 'error');
    return;
  }

  const nameM  = raw.match(/Name\s*:\s*(.+)/);
  const payM   = raw.match(/Basic Pay\s*:\s*([\d.]+)/);
  const otM    = raw.match(/OT Hours\s*:\s*(\d+)/);
  if (!nameM) { showResult('search-result', '⚠ Could not parse data.', 'error'); return; }

  const name  = nameM[1].trim();
  const basic = parseFloat(payM?.[1] || 0);
  const ot    = parseInt(otM?.[1] || 0);
  const gross = calcGross(basic, ot);
  const tax   = calcTax(gross);

  document.getElementById('ec-avatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('ec-name').textContent   = name;
  document.getElementById('ec-id').textContent     = 'ID: ' + id;
  document.getElementById('ec-pay').textContent    = fmt(basic);
  document.getElementById('ec-ot').textContent     = ot + ' hrs';
  document.getElementById('ec-gross').textContent  = fmt(gross);
  document.getElementById('ec-tax').textContent    = fmt(tax);
  document.getElementById('ec-net').textContent    = fmt(gross - tax);

  document.getElementById('search-card').style.display = 'block';
  showResult('search-result', `✓ Found: ${name}`, 'success');
}

// ─── Update ───────────────────────────
function doUpdateEmployee() {
  const id  = document.getElementById('upd-id').value.trim();
  const pay = document.getElementById('upd-pay').value.trim();
  const ot  = document.getElementById('upd-ot').value.trim();

  if (!id || !pay || !ot) { showResult('upd-result', '⚠ Fill all fields.', 'error'); return; }
  if (!wasmReady)         { showResult('upd-result', '⚠ C Engine not ready.', 'error'); return; }

  const raw = runC(['4', id, pay, ot]);

  if (raw.includes('not found')) {
    showResult('upd-result', `⚠ No employee found with ID ${id}.`, 'error');
  } else {
    showResult('upd-result', `✓ Employee ID ${id} updated!`, 'success');
    showToast('Updated!', 'success');
  }
}

// ─── Delete ───────────────────────────
function doDeleteEmployee() {
  const id = document.getElementById('del-id').value.trim();
  if (!id)        { showResult('del-result', '⚠ Enter an Employee ID.', 'error'); return; }
  if (!wasmReady) { showResult('del-result', '⚠ C Engine not ready.', 'error'); return; }
  if (!confirm(`Delete Employee ID ${id}? This cannot be undone.`)) return;

  const raw = runC(['5', id]);

  if (raw.includes('not found')) {
    showResult('del-result', `⚠ No employee found with ID ${id}.`, 'error');
  } else {
    showResult('del-result', `✓ Employee ID ${id} deleted.`, 'success');
    showToast('Deleted.', 'success');
    document.getElementById('del-id').value = '';
  }
}

// ─── Payslip ──────────────────────────
function doPayslip() {
  const id = document.getElementById('slip-id').value.trim();
  if (!id)        { showResult('slip-result', '⚠ Enter an Employee ID.', 'error'); return; }
  if (!wasmReady) { showResult('slip-result', '⚠ C Engine not ready.', 'error'); return; }

  const raw = runC(['6', id]);

  if (raw.includes('not found') || !raw.includes('PAYSLIP')) {
    document.getElementById('payslip-doc').style.display = 'none';
    showResult('slip-result', `⚠ No employee found with ID ${id}.`, 'error');
    return;
  }

  // Use JS math directly — C output spacing is unreliable for gross/tax/net
  const nameM  = raw.match(/Name\s+:\s*(.+)/);
  const basicM = raw.match(/Basic Pay\s+:\s*([\d.]+)/);
  const otHM   = raw.match(/OT Hours\s+:\s*(\d+)/);

  if (!nameM) { showResult('slip-result', '⚠ Could not parse payslip.', 'error'); return; }

  const name  = nameM[1].trim();
  const basic = parseFloat(basicM?.[1] || 0);
  const otH   = parseInt(otHM?.[1] || 0);

  // Calculate in JS — same formula as C
  const gross = calcGross(basic, otH);
  const tax   = calcTax(gross);
  const net   = gross - tax;

  const now = new Date();
  document.getElementById('ps-period').textContent = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  document.getElementById('ps-id').textContent     = id;
  document.getElementById('ps-name').textContent   = name;
  document.getElementById('ps-basic').textContent  = fmt(basic);
  document.getElementById('ps-ot-h').textContent   = otH;
  document.getElementById('ps-ot').textContent     = fmt(otH * OT_RATE);
  document.getElementById('ps-gross').textContent  = fmt(gross);
  document.getElementById('ps-tax').textContent    = fmt(tax);
  document.getElementById('ps-net').textContent    = fmt(net);

  document.getElementById('payslip-doc').style.display = 'block';
  showResult('slip-result', `✓ Payslip for ${name}`, 'success');
}

function printPayslip() { window.print(); }

// ─── Report ───────────────────────────
function doPayrollReport() {
  if (!wasmReady) {
    showResult('report-result', '⚠ C Engine not ready.', 'error');
    return;
  }

  const raw = runC(['7']) || '';

  const rows = raw.split('\n').reduce((acc, line) => {
    const m = line.trim().match(/^(\d+)\s+(.+?)\s+([\d.]+)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)$/);
    if (m) {
      acc.push({
        id: +m[1],
        name: m[2].trim(),
        basic: +m[3],
        ot: +m[4],
        gross: +m[5],
        tax: +m[6],
        net: +m[7]
      });
    }
    return acc;
  }, []);

  const tbody = document.getElementById('report-tbody');

  if (!rows.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No records found.</td></tr>';
    document.getElementById('report-totals').style.display = 'none';
    showResult('report-result', '⚠ No records to show.', 'error');
    return;
  }

  let tGross = 0, tTax = 0, tNet = 0;

  tbody.innerHTML = rows.map(r => {
    tGross += r.gross;
    tTax += r.tax;
    tNet += r.net;

    return `<tr>
      <td class="td-id">${r.id}</td>
      <td>${r.name}</td>
      <td>${fmt(r.basic)}</td>
      <td>${r.ot} hrs</td>
      <td>${fmt(r.gross)}</td>
      <td>${fmt(r.tax)}</td>
      <td class="td-net">${fmt(r.net)}</td>
    </tr>`;
  }).join('');

  document.getElementById('rt-gross').textContent = fmt(tGross);
  document.getElementById('rt-tax').textContent   = fmt(tTax);
  document.getElementById('rt-net').textContent   = fmt(tNet);
  document.getElementById('report-totals').style.display = 'flex';

  showResult('report-result', `✓ Report for ${rows.length} employee(s).`, 'success');
}

// ─── Init ─────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  navigate('home');
  document.addEventListener('click', e => {
    const sidebar = document.getElementById('sidebar');
    const ham = document.getElementById('hamburger');
    if (window.innerWidth <= 900 &&
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !ham.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
});