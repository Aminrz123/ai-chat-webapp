// ── Data ──────────────────────────────────────────────────────
let data = {
  income: {},
  incomeSources: [],
  categories: [],
  expenses: [],
  shoppingList: []
};

let currentMonth = new Date().toISOString().slice(0,7);
let editingCatId = null;
let doughnutInst = null;
let barInst = null;
let currentCatFilter = 'alle';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#3b82f6','#84cc16'];

function load() {
  const saved = localStorage.getItem('budgetData');
  if (saved) data = JSON.parse(saved);
  const mp = document.getElementById('monthPicker');
  mp.value = currentMonth;
}

function save() {
  localStorage.setItem('budgetData', JSON.stringify(data));
}

function changeMonth(val) {
  currentMonth = val;
  renderAll();
}

// ── Navigation ─────────────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  const navItems = document.querySelectorAll('.nav-item');
  const pages = ['dashboard','indkomst','kategorier','udgifter','statistik','indsigt','besparelser'];
  const idx = pages.indexOf(name);
  if (navItems[idx]) navItems[idx].classList.add('active');
  const mItems = document.querySelectorAll('.mobile-nav-item');
  const mPages = ['dashboard','kategorier','udgifter','statistik','indsigt','besparelser'];
  const mIdx = mPages.indexOf(name);
  if (mItems[mIdx]) mItems[mIdx].classList.add('active');

  if (name === 'statistik')   renderCharts();
  if (name === 'indsigt')     renderInsights();
  if (name === 'indkomst')    renderIncomePage();
  if (name === 'dashboard')   renderDashboard();
  if (name === 'besparelser') renderSavingsPage();
}

// ── Helpers ────────────────────────────────────────────────────
function fmt(n) {
  return Number(n).toLocaleString('da-DK') + ' kr.';
}

function getIncome() {
  const fromSources = (data.incomeSources || [])
    .filter(s => s.month === currentMonth)
    .reduce((sum, s) => sum + s.amount, 0);
  return fromSources > 0 ? fromSources : (data.income[currentMonth] || 0);
}

function getCategoryExpenses(catId) {
  return data.expenses
    .filter(e => e.categoryId === catId && e.month === currentMonth)
    .reduce((s, e) => s + e.amount, 0);
}

function getTotalBudget() {
  return data.categories.reduce((s, c) => s + (c.budget || 0), 0);
}

function getTotalSpent() {
  return data.expenses
    .filter(e => e.month === currentMonth)
    .reduce((s, e) => s + e.amount, 0);
}

function pctColor(pct) {
  if (pct >= 100) return '#ef4444';
  if (pct >= 80)  return '#f59e0b';
  return '#10b981';
}

// ── Income ─────────────────────────────────────────────────────
const INCOME_ICONS = { løn:'💼', aktier:'📈', freelance:'💻', leje:'🏠', su:'🎓', pension:'🏦', andet:'💵' };
const INCOME_LABELS = { løn:'Løn / Arbejde', aktier:'Aktieudbytte', freelance:'Freelance / Bijob', leje:'Lejeindtægt', su:'SU / Stipendium', pension:'Pension / Dagpenge', andet:'Andet' };

function openIncomeModal() {
  document.getElementById('incomeType').value = 'løn';
  document.getElementById('incomeDesc').value = '';
  document.getElementById('incomeAmount').value = '';
  document.getElementById('incomeModal').classList.add('open');
}
function closeIncomeModal() {
  document.getElementById('incomeModal').classList.remove('open');
}
function updateIncomeIcon() {}

function saveIncomeSource() {
  const type = document.getElementById('incomeType').value;
  const desc = document.getElementById('incomeDesc').value.trim() || INCOME_LABELS[type];
  const amount = parseFloat(document.getElementById('incomeAmount').value);
  if (!amount || amount <= 0) { alert('Indtast et gyldigt beløb'); return; }
  if (!data.incomeSources) data.incomeSources = [];
  data.incomeSources.push({ id: Date.now(), type, desc, amount, month: currentMonth, icon: INCOME_ICONS[type] || '💵' });
  save();
  closeIncomeModal();
  renderAll();
}

function deleteIncomeSource(id) {
  data.incomeSources = (data.incomeSources || []).filter(s => s.id !== id);
  save();
  renderAll();
}

function saveIncome() {} // kept for backwards compat

function renderIncomePage() {
  const inc = getIncome();
  document.getElementById('incomeValue').textContent = fmt(inc);

  const totalBudget = getTotalBudget();
  const unallocated = inc - totalBudget;
  const allocPct = inc > 0 ? Math.min((totalBudget / inc) * 100, 100).toFixed(0) : 0;
  document.getElementById('incomeAllocInfo').textContent =
    inc > 0 ? `${allocPct}% fordelt til kategorier · ${fmt(unallocated)} til overs` : '';

  // Income sources list
  const sources = (data.incomeSources || []).filter(s => s.month === currentMonth);
  const srcEl = document.getElementById('incomeSourceList');
  if (sources.length === 0) {
    srcEl.innerHTML = '<div class="empty" style="padding:24px 0"><div class="empty-icon" style="font-size:36px">💰</div><p>Ingen indkomst registreret endnu.</p><p class="empty-hint">Klik "+ Tilføj indkomst" for at tilføje løn, aktieudbytte m.m.</p></div>';
  } else {
    srcEl.innerHTML = sources.map(s => `
      <div style="display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid var(--border)">
        <div style="width:40px;height:40px;border-radius:10px;background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${s.icon}</div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:600">${s.desc}</div>
          <div style="font-size:12px;color:var(--muted)">${INCOME_LABELS[s.type] || s.type}</div>
        </div>
        <div style="font-size:16px;font-weight:800;color:var(--green)">+ ${fmt(s.amount)}</div>
        <button class="btn btn-danger btn-icon btn-sm" onclick="deleteIncomeSource(${s.id})">🗑️</button>
      </div>`).join('');
  }

  // Budget allocation bar
  let html = '';
  if (inc > 0 && data.categories.length > 0) {
    const barPct = Math.min((totalBudget / inc) * 100, 100);
    const color = unallocated < 0 ? 'var(--danger)' : unallocated / inc < 0.05 ? 'var(--warning)' : 'var(--accent)';
    html += `
      <div style="margin-bottom:18px">
        <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:8px">
          <span style="color:var(--muted)">Fordelt til kategorier</span>
          <span style="color:${color}">${fmt(totalBudget)} / ${fmt(inc)}</span>
        </div>
        <div class="progress-bar-bg" style="height:10px">
          <div class="progress-bar-fill" style="width:${barPct}%;background:${color}"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-top:5px">
          <span>${allocPct}% fordelt</span>
          <span style="color:${unallocated<0?'var(--danger)':'var(--green)'};font-weight:600">${unallocated >= 0 ? fmt(unallocated) + ' til overs' : fmt(Math.abs(unallocated)) + ' for meget fordelt'}</span>
        </div>
      </div>`;
    const typeOrder2 = { fast: 0, variabel: 1, opsparing: 2 };
    const sorted2 = [...data.categories].sort((a,b) => (typeOrder2[a.type??'variabel']??1) - (typeOrder2[b.type??'variabel']??1));
    const typeLabels2 = { fast:'🔒 Faste', variabel:'🔄 Variable', opsparing:'🐷 Opsparing' };
    let lastType2 = null;
    sorted2.forEach(c => {
      const t = c.type || 'variabel';
      if (t !== lastType2) {
        html += `<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.8px;padding:10px 0 6px;border-top:1px solid var(--border);margin-top:4px">${typeLabels2[t]||''}</div>`;
        lastType2 = t;
      }
      const pct2 = inc > 0 ? ((c.budget / inc) * 100).toFixed(1) : 0;
      html += `<div style="display:flex;align-items:center;gap:10px;padding:7px 0">
        <span style="font-size:18px;width:26px;text-align:center">${c.icon}</span>
        <span style="flex:1;font-size:14px;font-weight:500">${c.name}</span>
        <span style="font-size:13px;color:var(--muted);min-width:38px;text-align:right">${pct2}%</span>
        <span style="font-size:14px;font-weight:700;min-width:90px;text-align:right">${fmt(c.budget)}</span>
      </div>`;
    });
  } else if (inc === 0) {
    html = '<p style="color:var(--muted);font-size:14px">Tilføj indkomst ovenfor for at se fordelingen.</p>';
  } else {
    html = '<p style="color:var(--muted);font-size:14px">Opret kategorier for at se fordelingen af din indkomst.</p>';
  }
  document.getElementById('budgetSplit').innerHTML = html;
}

// ── Dashboard ──────────────────────────────────────────────────
function renderDashboard() {
  const inc = getIncome();
  const totalBudget = getTotalBudget();
  const totalSpent = getTotalSpent();
  const surplus = inc - totalSpent;

  const fixedBudget   = data.categories.filter(c => c.type === 'fast').reduce((s,c) => s + c.budget, 0);
  const varBudget     = data.categories.filter(c => c.type === 'variabel').reduce((s,c) => s + c.budget, 0);
  const savingBudget  = data.categories.filter(c => c.type === 'opsparing').reduce((s,c) => s + c.budget, 0);
  const fixedSpent    = data.categories.filter(c => c.type === 'fast').reduce((s,c) => s + getCategoryExpenses(c.id), 0);
  const varSpent      = data.categories.filter(c => c.type === 'variabel').reduce((s,c) => s + getCategoryExpenses(c.id), 0);

  const months = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'];
  const [y, m] = currentMonth.split('-');
  document.getElementById('dashSubtitle').textContent = `${months[parseInt(m)-1]} ${y}`;

  // Surplus/deficit banner
  const dashPage = document.getElementById('page-dashboard');
  let banner = document.getElementById('surplusBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'surplusBanner';
    const statsGrid = document.getElementById('statsGrid');
    dashPage.insertBefore(banner, statsGrid);
  }
  if (inc > 0) {
    const isPositive = surplus >= 0;
    banner.className = `surplus-banner ${isPositive ? 'green' : 'red'}`;
    banner.innerHTML = `
      <div>
        <div class="sb-label">${isPositive ? '✅ Overskud denne måned' : '⚠️ Underskud denne måned'}</div>
        <div class="sb-value">${isPositive ? '+' : ''}${fmt(surplus)}</div>
        <div class="sb-sub">
          Indkomst ${fmt(inc)} &nbsp;·&nbsp; Forbrug ${fmt(totalSpent)} &nbsp;·&nbsp;
          ${inc > 0 ? Math.abs((surplus/inc)*100).toFixed(0) : 0}% ${isPositive ? 'til overs' : 'over indkomst'}
        </div>
      </div>
      <div class="sb-emoji">${isPositive ? '📈' : '📉'}</div>`;
  } else {
    banner.className = '';
    banner.innerHTML = '';
  }

  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card indigo">
      <div class="sc-icon">💵</div>
      <div class="sc-label">Månedlig indkomst</div>
      <div class="sc-value">${fmt(inc)}</div>
      <div class="sc-sub">Aktiv måned</div>
    </div>
    <div class="stat-card blue">
      <div class="sc-icon">🔒</div>
      <div class="sc-label">Faste udgifter</div>
      <div class="sc-value">${fmt(fixedSpent)}</div>
      <div class="sc-sub">Budget: ${fmt(fixedBudget)}</div>
    </div>
    <div class="stat-card ${varSpent > varBudget ? 'red' : 'orange'}">
      <div class="sc-icon">🔄</div>
      <div class="sc-label">Variable udgifter</div>
      <div class="sc-value">${fmt(varSpent)}</div>
      <div class="sc-sub">Budget: ${fmt(varBudget)}</div>
    </div>
    <div class="stat-card purple">
      <div class="sc-icon">🐷</div>
      <div class="sc-label">Opsparing</div>
      <div class="sc-value">${fmt(savingBudget)}</div>
      <div class="sc-sub">${inc > 0 ? ((savingBudget/inc)*100).toFixed(0) : 0}% af indkomst</div>
    </div>`;

  // Progress bars
  let html = '';
  if (data.categories.length === 0) {
    html = '<div class="empty"><div class="empty-icon">📂</div><p>Ingen kategorier endnu.</p><p class="empty-hint">Brug "⚡ Standardkategorier" for at komme hurtigt i gang.</p></div>';
  } else {
    const typeOrder = { fast: 0, variabel: 1, opsparing: 2 };
    const sorted = [...data.categories].sort((a,b) => (typeOrder[a.type??'variabel']??1) - (typeOrder[b.type??'variabel']??1));
    let lastType = null;
    const typeTitles = { fast: '🔒 Faste udgifter', variabel: '🔄 Variable udgifter', opsparing: '🐷 Opsparing' };
    sorted.forEach(c => {
      const t = c.type || 'variabel';
      if (t !== lastType) {
        html += `<div class="progress-section-title">${typeTitles[t] || ''}</div>`;
        lastType = t;
      }
      const spent = getCategoryExpenses(c.id);
      const pct = c.budget > 0 ? Math.min((spent / c.budget) * 100, 100) : 0;
      const over = spent > c.budget;
      const color = pctColor((spent/c.budget)*100);
      html += `<div class="progress-item">
        <div class="progress-header">
          <div class="name"><span>${c.icon}</span> ${c.name}</div>
          <div class="amounts">${fmt(spent)} / ${fmt(c.budget)}</div>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <div class="progress-pct" style="color:${color}">
          ${pct.toFixed(0)}% brugt ${over ? '⚠️ Over budget!' : ''}
        </div>
      </div>`;
    });
  }
  document.getElementById('progressOverview').innerHTML = html;
}

// ── Categories ─────────────────────────────────────────────────
function openCatModal(id) {
  editingCatId = id || null;
  document.getElementById('catModalTitle').textContent = id ? 'Redigér kategori' : 'Tilføj kategori';
  if (id) {
    const c = data.categories.find(x => x.id === id);
    document.getElementById('catName').value = c.name;
    document.getElementById('catIcon').value = c.icon;
    document.getElementById('catBudget').value = c.budget;
    document.getElementById('catColor').value = c.color;
    document.getElementById('catType').value = c.type || 'variabel';
  } else {
    document.getElementById('catName').value = '';
    document.getElementById('catIcon').value = '';
    document.getElementById('catBudget').value = '';
    document.getElementById('catColor').value = COLORS[data.categories.length % COLORS.length];
    document.getElementById('catType').value = 'variabel';
  }
  document.getElementById('catModal').classList.add('open');
}

function closeCatModal() {
  document.getElementById('catModal').classList.remove('open');
}

function saveCategory() {
  const name = document.getElementById('catName').value.trim();
  const icon = document.getElementById('catIcon').value.trim() || '📁';
  const budget = parseFloat(document.getElementById('catBudget').value);
  const color = document.getElementById('catColor').value;
  const type = document.getElementById('catType').value;
  if (!name) { alert('Indtast et navn'); return; }
  if (!budget || budget <= 0) { alert('Indtast et gyldigt budget'); return; }

  if (editingCatId) {
    const c = data.categories.find(x => x.id === editingCatId);
    c.name = name; c.icon = icon; c.budget = budget; c.color = color; c.type = type;
  } else {
    data.categories.push({ id: Date.now(), name, icon, budget, color, type });
  }
  save();
  closeCatModal();
  renderCategoryList();
  renderDashboard();
}

function deleteCategory(id) {
  if (!confirm('Slet kategori og alle tilhørende udgifter?')) return;
  data.categories = data.categories.filter(c => c.id !== id);
  data.expenses = data.expenses.filter(e => e.categoryId !== id);
  save();
  renderCategoryList();
  renderDashboard();
}

function renderCategoryList() {
  const el = document.getElementById('categoryList');
  const filtered = currentCatFilter === 'alle'
    ? data.categories
    : data.categories.filter(c => (c.type || 'variabel') === currentCatFilter);

  if (data.categories.length === 0) {
    el.innerHTML = '<div class="empty"><div class="empty-icon">📂</div><p>Ingen kategorier endnu.</p><p class="empty-hint">Klik "+ Ny kategori" eller brug "⚡ Standardkategorier".</p></div>';
    return;
  }
  if (filtered.length === 0) {
    el.innerHTML = '<div class="empty"><div class="empty-icon">🔍</div><p>Ingen kategorier i dette filter.</p></div>';
    return;
  }

  const typeLabels = { fast: '🔒 Fast', variabel: '🔄 Variabel', opsparing: '🐷 Opsparing' };
  el.innerHTML = filtered.map(c => {
    const spent = getCategoryExpenses(c.id);
    const pct = c.budget > 0 ? ((spent/c.budget)*100).toFixed(0) : 0;
    const statusTag = spent > c.budget
      ? `<span class="tag tag-red">Over budget</span>`
      : spent / c.budget > 0.8
      ? `<span class="tag tag-orange">${pct}% brugt</span>`
      : `<span class="tag tag-green">${pct}% brugt</span>`;
    const typeClass = c.type === 'fast' ? 'type-fast' : c.type === 'opsparing' ? 'type-opsparing' : 'type-variabel';
    const typeLabel = typeLabels[c.type || 'variabel'] || '🔄 Variabel';
    return `<div class="category-item">
      <div class="cat-dot" style="background:${c.color}"></div>
      <div class="cat-emoji">${c.icon}</div>
      <div class="cat-info">
        <div class="cat-name">${c.name} <span class="type-badge ${typeClass}">${typeLabel}</span></div>
        <div class="cat-meta">Budget: ${fmt(c.budget)} &nbsp;·&nbsp; Brugt: ${fmt(spent)}</div>
      </div>
      ${statusTag}
      <div class="cat-actions">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="openCatModal(${c.id})" title="Redigér">✏️</button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="deleteCategory(${c.id})" title="Slet">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function filterCategories(type) {
  currentCatFilter = type;
  document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.cat-filter-btn').forEach(b => {
    const onclick = b.getAttribute('onclick') || '';
    if (onclick.includes(`'${type}'`)) b.classList.add('active');
  });
  renderCategoryList();
}

function addStandardCategories() {
  const standards = [
    { name: 'Bolig',             icon: '🏠', budget: 8000, color: '#6366f1', type: 'fast'      },
    { name: 'Transport',         icon: '🚗', budget: 1500, color: '#3b82f6', type: 'fast'      },
    { name: 'Mad & Dagligvarer', icon: '🍕', budget: 3000, color: '#f97316', type: 'variabel'  },
    { name: 'Abonnementer',      icon: '📱', budget: 500,  color: '#8b5cf6', type: 'fast'      },
    { name: 'Fritid',            icon: '🎮', budget: 1000, color: '#ec4899', type: 'variabel'  },
    { name: 'Opsparing',         icon: '🐷', budget: 2000, color: '#10b981', type: 'opsparing' }
  ];
  let added = 0;
  standards.forEach((s, i) => {
    if (!data.categories.find(c => c.name === s.name)) {
      data.categories.push({ id: Date.now() + i, ...s });
      added++;
    }
  });
  save();
  renderCategoryList();
  renderDashboard();
  if (added > 0) alert(`✅ ${added} standardkategorier tilføjet!`);
  else alert('Alle standardkategorier findes allerede.');
}

// ── Expenses ───────────────────────────────────────────────────
function openExpModal() {
  if (data.categories.length === 0) { alert('Opret mindst én kategori først'); return; }
  const sel = document.getElementById('expCategory');
  sel.innerHTML = data.categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  document.getElementById('expDesc').value = '';
  document.getElementById('expAmount').value = '';
  document.getElementById('expDate').value = new Date().toISOString().slice(0,10);
  document.getElementById('expModal').classList.add('open');
}

function closeExpModal() {
  document.getElementById('expModal').classList.remove('open');
}

function saveExpense() {
  const desc = document.getElementById('expDesc').value.trim();
  const amount = parseFloat(document.getElementById('expAmount').value);
  const catId = parseInt(document.getElementById('expCategory').value);
  const date = document.getElementById('expDate').value;
  if (!desc) { alert('Indtast en beskrivelse'); return; }
  if (!amount || amount <= 0) { alert('Indtast et gyldigt beløb'); return; }

  data.expenses.push({ id: Date.now(), categoryId: catId, amount, description: desc, date, month: date.slice(0,7) });
  save();
  closeExpModal();
  renderExpenseList();
  renderDashboard();
}

function deleteExpense(id) {
  data.expenses = data.expenses.filter(e => e.id !== id);
  save();
  renderExpenseList();
  renderDashboard();
}

function renderExpenseList() {
  const el = document.getElementById('expenseList');
  const monthExp = data.expenses
    .filter(e => e.month === currentMonth)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (monthExp.length === 0) {
    el.innerHTML = '<div class="empty"><div class="empty-icon">🧾</div><p>Ingen udgifter registreret denne måned.</p><p class="empty-hint">Klik "+ Tilføj udgift" for at registrere dine udgifter.</p></div>';
    return;
  }
  el.innerHTML = monthExp.map(e => {
    const cat = data.categories.find(c => c.id === e.categoryId) || { icon: '?', name: 'Ukendt', color: '#ccc' };
    return `<div class="expense-item">
      <div class="exp-dot" style="background:${cat.color}"></div>
      <div class="exp-emoji">${cat.icon}</div>
      <div class="exp-info">
        <div class="exp-desc">${e.description}</div>
        <div class="exp-meta">${cat.name} &nbsp;·&nbsp; ${e.date}</div>
      </div>
      <div class="exp-amount">- ${fmt(e.amount)}</div>
      <button class="btn btn-danger btn-icon btn-sm" onclick="deleteExpense(${e.id})" title="Slet">🗑️</button>
    </div>`;
  }).join('');
}

// ── Charts ─────────────────────────────────────────────────────
function renderCharts() {
  if (data.categories.length === 0) return;

  const dCtx = document.getElementById('doughnutChart').getContext('2d');
  if (doughnutInst) doughnutInst.destroy();
  doughnutInst = new Chart(dCtx, {
    type: 'doughnut',
    data: {
      labels: data.categories.map(c => `${c.icon} ${c.name}`),
      datasets: [{ data: data.categories.map(c => c.budget), backgroundColor: data.categories.map(c => c.color), borderWidth: 3, borderColor: '#fff' }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 }, padding: 14 } } },
      cutout: '65%'
    }
  });

  const bCtx = document.getElementById('barChart').getContext('2d');
  if (barInst) barInst.destroy();
  const cats = data.categories;
  document.getElementById('barChartWrap').style.setProperty('--bar-count', cats.length);

  // Stacked: Brugt + Tilbage = Budget (én søjle pr. kategori)
  const spentData   = cats.map(c => Math.min(getCategoryExpenses(c.id), c.budget));
  const leftData    = cats.map(c => Math.max(c.budget - getCategoryExpenses(c.id), 0));
  const overData    = cats.map(c => Math.max(getCategoryExpenses(c.id) - c.budget, 0));

  const spentColors = cats.map(c => {
    const s = getCategoryExpenses(c.id);
    if (s > c.budget)        return '#ef4444cc';
    if (s / c.budget >= 0.8) return '#f59e0bcc';
    return c.color + 'dd';
  });

  barInst = new Chart(bCtx, {
    type: 'bar',
    data: {
      labels: cats.map(c => c.icon + ' ' + c.name),
      datasets: [
        {
          label: 'Brugt',
          data: spentData,
          backgroundColor: spentColors,
          borderRadius: { topLeft: 6, bottomLeft: 6 },
          borderSkipped: false,
          stack: 'budget'
        },
        {
          label: 'Tilbage',
          data: leftData,
          backgroundColor: cats.map(c => c.color + '22'),
          borderRadius: { topRight: 6, bottomRight: 6 },
          borderSkipped: false,
          stack: 'budget'
        },
        {
          label: 'Over budget',
          data: overData,
          backgroundColor: '#ef444488',
          borderRadius: 6,
          borderSkipped: false,
          stack: 'budget'
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => cats[ctx[0].dataIndex].icon + ' ' + cats[ctx[0].dataIndex].name,
            label: ctx => {
              const cat = cats[ctx.dataIndex];
              const s = getCategoryExpenses(cat.id);
              const pct = cat.budget > 0 ? ((s / cat.budget) * 100).toFixed(0) : 0;
              const left = Math.max(cat.budget - s, 0);
              return [
                ` Brugt: ${s.toLocaleString('da-DK')} kr. (${pct}%)`,
                ` Budget: ${cat.budget.toLocaleString('da-DK')} kr.`,
                ` Tilbage: ${left.toLocaleString('da-DK')} kr.`
              ];
            },
            filter: ctx => ctx.datasetIndex === 0
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          stacked: true,
          grid: { color: '#f0f2f8' },
          ticks: { callback: v => v.toLocaleString('da-DK') + ' kr.', font: { size: 11 } }
        },
        y: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { size: 13 }, color: '#0f172a' }
        }
      }
    }
  });
}

// ── AI Chat ────────────────────────────────────────────────────
function buildBudgetContext() {
  const inc = getIncome();
  const totalSpent = getTotalSpent();
  const months = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'];
  const [y, m] = currentMonth.split('-');
  const månedNavn = months[parseInt(m)-1] + ' ' + y;

  const fixedBudget  = data.categories.filter(c => c.type === 'fast').reduce((s,c) => s + c.budget, 0);
  const varBudget    = data.categories.filter(c => c.type === 'variabel').reduce((s,c) => s + c.budget, 0);
  const savingBudget = data.categories.filter(c => c.type === 'opsparing').reduce((s,c) => s + c.budget, 0);

  let ctx = `Du er en kort og præcis dansk finansrådgiver i en chat-app. Svar ALTID på max 4-5 linjer. Ingen lange introduktioner eller opsummeringer. Gå direkte til sagen. Du kan svare på alt inden for økonomi og finans: aktier, investeringer, opsparing, budget, pension, skat osv. Brug brugerens budgetdata som kontekst når det er relevant.\n\n`;

  ctx += `HANDLINGER DU KAN UDFØRE – MEN KUN HVIS BRUGEREN EKSPLICIT BEDER OM DET:\n`;
  ctx += `Brug KUN disse tags hvis brugeren tydeligt beder dig om at "oprette en kategori" eller "tilføje en udgift". Opret IKKE kategorier eller udgifter blot fordi emnet nævnes.\n\n`;
  ctx += `1. Opret kategori (kun hvis brugeren beder om det):\n`;
  ctx += `[OPRET_KATEGORI:{"name":"Kategorinavn","icon":"🏠","budget":1000,"type":"fast"}]\n`;
  ctx += `Type kan være: fast, variabel eller opsparing.\n\n`;
  ctx += `2. Registrér udgift (kun hvis brugeren beder om det):\n`;
  ctx += `[OPRET_UDGIFT:{"description":"Beskrivelse","amount":500,"categoryName":"Kategorinavn","date":"${new Date().toISOString().slice(0,10)}"}]\n`;
  ctx += `categoryName skal matche et eksisterende kategorinavn fra listen nedenfor.\n\n`;

  ctx += `BRUGERENS BUDGETDATA FOR ${månedNavn.toUpperCase()}:\n`;
  ctx += `- Månedlig indkomst: ${fmt(inc)}\n`;
  ctx += `- Samlet forbrug: ${fmt(totalSpent)}\n`;
  ctx += `- Overskud/underskud: ${fmt(inc - totalSpent)}\n`;
  ctx += `- Faste udgifter (budget): ${fmt(fixedBudget)}\n`;
  ctx += `- Variable udgifter (budget): ${fmt(varBudget)}\n`;
  ctx += `- Opsparing (budget): ${fmt(savingBudget)}\n\n`;

  ctx += `KATEGORIER:\n`;
  data.categories.forEach(c => {
    const spent = getCategoryExpenses(c.id);
    const pct = c.budget > 0 ? ((spent/c.budget)*100).toFixed(0) : 0;
    ctx += `- ${c.icon} ${c.name} [${c.type || 'variabel'}]: budget ${fmt(c.budget)}, brugt ${fmt(spent)} (${pct}%)\n`;
  });

  if (data.expenses.filter(e => e.month === currentMonth).length > 0) {
    ctx += `\nSENESTE UDGIFTER:\n`;
    data.expenses.filter(e => e.month === currentMonth).slice(-8).forEach(e => {
      const cat = data.categories.find(c => c.id === e.categoryId);
      ctx += `- ${e.description}: ${fmt(e.amount)} (${cat ? cat.name : 'Ukendt'})\n`;
    });
  }
  return ctx;
}

function parseAndExecuteAIActions(text) {
  let cleanText = text;
  const notifications = [];

  // ── Opret kategorier ──────────────────────────────────────────
  const catRegex = /\[OPRET_KATEGORI:(\{[^}]+\})\]/g;
  let match;
  let createdCats = [];
  while ((match = catRegex.exec(text)) !== null) {
    try {
      const p = JSON.parse(match[1]);
      if (p.name) {
        const exists = data.categories.find(c => c.name.toLowerCase() === p.name.toLowerCase());
        if (!exists) {
          data.categories.push({
            id: Date.now() + Math.round(Math.random() * 1000),
            name: p.name,
            icon: p.icon || '📁',
            budget: p.budget || 0,
            color: COLORS[data.categories.length % COLORS.length],
            type: p.type || 'variabel'
          });
          createdCats.push(p.name);
        }
      }
      cleanText = cleanText.replace(match[0], '');
    } catch(e) {}
  }
  if (createdCats.length > 0) {
    notifications.push(`🗂️ Kategori oprettet: ${createdCats.join(', ')}`);
  }

  // ── Opret udgifter ────────────────────────────────────────────
  const expRegex = /\[OPRET_UDGIFT:(\{[^}]+\})\]/g;
  let createdExps = [];
  while ((match = expRegex.exec(text)) !== null) {
    try {
      const p = JSON.parse(match[1]);
      if (p.description && p.amount && p.categoryName) {
        // Find kategori — prøv eksakt match, derefter delvis match
        let cat = data.categories.find(c => c.name.toLowerCase() === p.categoryName.toLowerCase());
        if (!cat) cat = data.categories.find(c => c.name.toLowerCase().includes(p.categoryName.toLowerCase()) || p.categoryName.toLowerCase().includes(c.name.toLowerCase()));
        if (cat) {
          const date = p.date || new Date().toISOString().slice(0, 10);
          data.expenses.push({
            id: Date.now() + Math.round(Math.random() * 1000),
            categoryId: cat.id,
            amount: parseFloat(p.amount),
            description: p.description,
            date: date,
            month: date.slice(0, 7)
          });
          createdExps.push(`${p.description} (${Number(p.amount).toLocaleString('da-DK')} kr.)`);
        }
      }
      cleanText = cleanText.replace(match[0], '');
    } catch(e) {}
  }
  if (createdExps.length > 0) {
    notifications.push(`🧾 Udgift registreret: ${createdExps.join(', ')}`);
  }

  // ── Gem og opdatér UI ─────────────────────────────────────────
  if (createdCats.length > 0 || createdExps.length > 0) {
    save();
    renderCategoryList();
    renderExpenseList();
    renderDashboard();
  }

  // Vis notifikationer
  notifications.forEach(msg => {
    const note = document.createElement('div');
    note.style.cssText = 'background:var(--green-light);border:1px solid #a7f3d0;border-radius:8px;padding:10px 14px;font-size:13px;color:#065f46;font-weight:600;margin-top:8px';
    note.textContent = '✅ ' + msg;
    document.getElementById('aiMessages').appendChild(note);
  });

  return cleanText.trim();
}

async function askAI() {
  const input = document.getElementById('aiInput');
  const sendBtn = document.getElementById('aiSendBtn');
  const userText = input.value.trim();
  if (!userText) return;

  const messagesEl = document.getElementById('aiMessages');

  // Fjern velkomst-skærm første gang
  const welcome = document.getElementById('aiWelcome');
  if (welcome) welcome.remove();

  input.value = '';
  sendBtn.disabled = true;

  // Bruger-boble
  const userBubble = document.createElement('div');
  userBubble.className = 'ai-bubble-user';
  userBubble.textContent = userText;
  messagesEl.appendChild(userBubble);

  // Loading-boble med pulserende prikker
  const loadingBubble = document.createElement('div');
  loadingBubble.className = 'ai-bubble-loading';
  loadingBubble.innerHTML = '<div class="dot-pulse"><span></span><span></span><span></span></div>';
  messagesEl.appendChild(loadingBubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  const prompt = buildBudgetContext() + `\nBRUGERENS SPØRGSMÅL: ${userText}`;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt })
    });
    const data2 = await res.json();
    const cleanReply = parseAndExecuteAIActions(data2.reply);
    loadingBubble.className = 'ai-bubble-bot';
    loadingBubble.innerHTML = marked.parse(cleanReply);
  } catch (e) {
    loadingBubble.className = 'ai-bubble-bot';
    loadingBubble.textContent = '❌ Kunne ikke kontakte AI. Er serveren kørende?';
  }

  sendBtn.disabled = false;
  messagesEl.scrollTop = messagesEl.scrollHeight;
  input.focus();
}

// ── AI Insights ────────────────────────────────────────────────
function renderInsights() {
  const inc = getIncome();
  const totalSpent = getTotalSpent();
  const totalBudget = getTotalBudget();
  const insights = [];

  if (inc === 0) {
    insights.push({ type:'blue', icon:'💡', title:'Kom i gang', desc:'Indtast din månedlige indkomst og opret budgetkategorier for at modtage personlige anbefalinger.' });
  }

  data.categories.forEach(c => {
    const spent = getCategoryExpenses(c.id);
    if (spent > c.budget) {
      insights.push({ type:'red', icon:'⚠️', title:`Over budget: ${c.icon} ${c.name}`, desc:`Du har brugt ${fmt(spent)} ud af ${fmt(c.budget)} – det er ${fmt(spent - c.budget)} over budget (${(((spent-c.budget)/c.budget)*100).toFixed(0)}%). Overvej at reducere udgifterne i denne kategori.` });
    } else if (c.budget > 0 && spent / c.budget >= 0.85) {
      insights.push({ type:'orange', icon:'📢', title:`Tæt på grænse: ${c.icon} ${c.name}`, desc:`Du har brugt ${((spent/c.budget)*100).toFixed(0)}% af dit budget for ${c.name}. Der er kun ${fmt(c.budget - spent)} tilbage.` });
    }
  });

  const savings = data.categories.find(c => c.type === 'opsparing' || c.name.toLowerCase().includes('opsparing') || c.name.toLowerCase().includes('spare'));
  if (inc > 0 && !savings) {
    insights.push({ type:'orange', icon:'🐷', title:'Ingen opsparingskategori', desc:'Det anbefales at spare mindst 10-20% af din indkomst. Opret en "Opsparing"-kategori for at holde styr på det.' });
  } else if (savings && inc > 0) {
    const savingsPct = (savings.budget / inc) * 100;
    if (savingsPct < 10) {
      insights.push({ type:'orange', icon:'🐷', title:'Lav opsparing', desc:`Din opsparingskategori udgør kun ${savingsPct.toFixed(0)}% af din indkomst. Finanseksperter anbefaler mindst 10-20%.` });
    } else {
      insights.push({ type:'green', icon:'🐷', title:'God opsparing!', desc:`Du sparer ${savingsPct.toFixed(0)}% af din indkomst – det er ${savingsPct >= 20 ? 'fremragende' : 'godt'}! Fortsæt det gode arbejde.` });
    }
  }

  if (inc > 0 && totalSpent > 0) {
    const spentPct = (totalSpent / inc) * 100;
    if (spentPct > 90) {
      insights.push({ type:'red', icon:'🔥', title:'Højt forbrug denne måned', desc:`Du har allerede brugt ${spentPct.toFixed(0)}% af din indkomst (${fmt(totalSpent)} af ${fmt(inc)}). Der er kun ${fmt(inc - totalSpent)} tilbage.` });
    } else if (spentPct < 50) {
      insights.push({ type:'green', icon:'✅', title:'Godt styr på budgettet', desc:`Du har brugt ${spentPct.toFixed(0)}% af din indkomst denne måned. Du er godt på vej til at holde budgettet.` });
    }
  }

  if (inc > 0 && totalBudget < inc) {
    const unalloc = inc - totalBudget;
    insights.push({ type:'blue', icon:'💡', title:'Ufordelt indkomst', desc:`Du har ${fmt(unalloc)} (${((unalloc/inc)*100).toFixed(0)}%) af din indkomst som ikke er tildelt nogen kategori. Overvej at fordele det til opsparing eller andre kategorier.` });
  }

  if (inc > 0 && data.categories.length > 0) {
    insights.push({ type:'blue', icon:'📐', title:'50/30/20-reglen', desc:`En populær budgetregel: 50% til faste udgifter (${fmt(inc*0.5)}), 30% til livsstil (${fmt(inc*0.3)}), 20% til opsparing og gæld (${fmt(inc*0.2)}).` });
  }

  if (insights.length === 0) {
    insights.push({ type:'green', icon:'🎉', title:'Alt ser fint ud!', desc:'Du holder dig inden for budget i alle kategorier. Fortsæt det gode arbejde!' });
  }

  document.getElementById('insightsList').innerHTML = insights.map(i =>
    `<div class="insight-card ${i.type}">
      <div class="insight-icon">${i.icon}</div>
      <div class="insight-text">
        <div class="title">${i.title}</div>
        <div class="desc">${i.desc}</div>
      </div>
    </div>`
  ).join('');
}

// ── Savings page ───────────────────────────────────────────────
const TAKEAWAY_KEYWORDS = ['takeaway','pizza','mcdonalds','mcdonald','burger king','just eat','wolt','foodora','thai','sushi','kebab','burger','kfc','subway','domino'];
const IMPULSE_KEYWORDS  = ['amazon','zalando','shein','h&m','zara','asos','wish','temu','ebay','online','shopping'];

function renderSavingsPage() {
  renderSavingSummary();
  renderSpendingAlerts();
  renderSubList();
  renderShopList();
}

function renderSavingSummary() {
  const inc = getIncome();
  const monthExp = data.expenses.filter(e => e.month === currentMonth);

  // Takeaway beløb
  const takeawayTotal = monthExp.filter(e =>
    TAKEAWAY_KEYWORDS.some(k => e.description.toLowerCase().includes(k))
  ).reduce((s,e) => s+e.amount, 0);

  // Abonnement beløb
  const subCats = data.categories.filter(c => c.type === 'fast' || c.name.toLowerCase().includes('abonnement') || c.name.toLowerCase().includes('abonnementer'));
  const subTotal = subCats.reduce((s,c) => s + getCategoryExpenses(c.id), 0);

  // Potentiel besparelse (10% af variabel forbrug)
  const varSpent = data.categories.filter(c => c.type === 'variabel').reduce((s,c) => s + getCategoryExpenses(c.id), 0);
  const potential = Math.round(varSpent * 0.1);

  document.getElementById('savingSummary').innerHTML = `
    <div class="saving-stat">
      <div class="ss-val" style="color:var(--danger)">🍔 ${fmt(takeawayTotal)}</div>
      <div class="ss-lbl">Takeaway denne måned</div>
    </div>
    <div class="saving-stat">
      <div class="ss-val" style="color:var(--purple)">📱 ${fmt(subTotal)}</div>
      <div class="ss-lbl">Abonnementer</div>
    </div>
    <div class="saving-stat">
      <div class="ss-val" style="color:var(--green)">💡 ${fmt(potential)}</div>
      <div class="ss-lbl">Potentiel besparelse</div>
    </div>
    <div class="saving-stat">
      <div class="ss-val" style="color:var(--accent)">${data.shoppingList.filter(i=>!i.checked).length}</div>
      <div class="ss-lbl">Varer på indkøbsliste</div>
    </div>`;
}

function renderSpendingAlerts() {
  const monthExp = data.expenses.filter(e => e.month === currentMonth);
  const alerts = [];

  // Takeaway-check
  const takeawayExp = monthExp.filter(e => TAKEAWAY_KEYWORDS.some(k => e.description.toLowerCase().includes(k)));
  if (takeawayExp.length >= 3) {
    const total = takeawayExp.reduce((s,e) => s+e.amount, 0);
    alerts.push({ type:'red', icon:'🍔', title:`Meget takeaway (${takeawayExp.length} gange)`,
      desc:`Du har brugt ${fmt(total)} på takeaway denne måned. Laver du blot 2 hjemmelavede aftensmader ekstra om ugen kan du spare ${fmt(Math.round(total*0.4))}.` });
  } else if (takeawayExp.length > 0) {
    alerts.push({ type:'orange', icon:'🍔', title:`Takeaway registreret (${takeawayExp.length} gang${takeawayExp.length>1?'e':''})`,
      desc:`Du har brugt ${fmt(takeawayExp.reduce((s,e)=>s+e.amount,0))} på takeaway. Hold øje med at det ikke løber løbsk.` });
  }

  // Impulskøb-check (samme kategori købt mange gange)
  const impulsExp = monthExp.filter(e => IMPULSE_KEYWORDS.some(k => e.description.toLowerCase().includes(k)));
  if (impulsExp.length >= 2) {
    const total = impulsExp.reduce((s,e) => s+e.amount, 0);
    alerts.push({ type:'orange', icon:'🛍️', title:`Gentagne onlinekøb (${impulsExp.length} gange)`,
      desc:`Du har foretaget ${impulsExp.length} online-/impulskøb for i alt ${fmt(total)}. Prøv at vente 24 timer før du køber noget ikke-planlagt.` });
  }

  // Mange små udgifter (over 8 udgifter på variabel kategori)
  const varCatIds = data.categories.filter(c => c.type === 'variabel').map(c => c.id);
  const smallExp = monthExp.filter(e => varCatIds.includes(e.categoryId) && e.amount < 150);
  if (smallExp.length >= 5) {
    const total = smallExp.reduce((s,e) => s+e.amount, 0);
    alerts.push({ type:'orange', icon:'💸', title:`${smallExp.length} små udgifter under 150 kr.`,
      desc:`Mange små køb kan hurtigt løbe op. Disse udgifter beløber sig til ${fmt(total)} i alt. Overvej om alle er nødvendige.` });
  }

  // Dyre abonnementer (over 200 kr pr stk)
  const subCat = data.categories.find(c => c.name.toLowerCase().includes('abonnement'));
  if (subCat) {
    const subExp = monthExp.filter(e => e.categoryId === subCat.id && e.amount > 200);
    subExp.forEach(e => {
      alerts.push({ type:'blue', icon:'📱', title:`Dyrt abonnement: ${e.description}`,
        desc:`${fmt(e.amount)}/md. — Det svarer til ${fmt(e.amount*12)}/år. Er dette abonnement stadig nødvendigt? Tjek om der er billigere alternativer.` });
    });
  }

  if (alerts.length === 0) {
    alerts.push({ type:'green', icon:'✅', title:'Ingen alarmer denne måned',
      desc:'Du har ikke registreret usædvanlige forbrugsmønstre. Godt gået! Tilføj udgifter løbende for at holde styr på det.' });
  }

  document.getElementById('spendingAlerts').innerHTML = alerts.map(a =>
    `<div class="alert-card ${a.type}">
      <div class="alert-icon">${a.icon}</div>
      <div><div class="alert-title">${a.title}</div><div class="alert-desc">${a.desc}</div></div>
    </div>`
  ).join('');
}

function renderSubList() {
  const monthExp = data.expenses.filter(e => e.month === currentMonth);
  const subCats = data.categories.filter(c =>
    c.type === 'fast' ||
    c.name.toLowerCase().includes('abonnement') ||
    c.name.toLowerCase().includes('forsikring') ||
    c.name.toLowerCase().includes('el') ||
    c.name.toLowerCase().includes('varme')
  );

  const subs = [];
  subCats.forEach(c => {
    monthExp.filter(e => e.categoryId === c.id).forEach(e => {
      subs.push({ ...e, catColor: c.color, catIcon: c.icon });
    });
  });

  const total = subs.reduce((s,e) => s+e.amount, 0);
  document.getElementById('subTotal').textContent = subs.length > 0 ? `I alt: ${fmt(total)}` : '';

  if (subs.length === 0) {
    document.getElementById('subList').innerHTML =
      '<div class="empty" style="padding:20px"><div class="empty-icon" style="font-size:32px">📱</div><p>Ingen faste udgifter registreret endnu.</p></div>';
    return;
  }

  document.getElementById('subList').innerHTML = subs.map(e => {
    const isExpensive = e.amount > 200;
    return `<div class="sub-item">
      <div class="sub-dot" style="background:${e.catColor}"></div>
      <div class="sub-info">
        <div class="sub-name">${e.catIcon} ${e.description}</div>
        <div class="sub-date">${e.date}</div>
      </div>
      ${isExpensive ? '<span class="tag tag-orange">Dyr</span>' : '<span class="tag tag-green">OK</span>'}
      <div class="sub-amount" style="color:${isExpensive?'var(--warning)':'var(--text)'}">${fmt(e.amount)}</div>
    </div>`;
  }).join('');
}

// ── Shopping list ───────────────────────────────────────────────
function addShopItem() {
  const name = document.getElementById('shopName').value.trim();
  if (!name) return;
  const price = parseFloat(document.getElementById('shopPrice').value) || 0;
  if (!data.shoppingList) data.shoppingList = [];
  data.shoppingList.push({ id: Date.now(), name, price, checked: false });
  document.getElementById('shopName').value = '';
  document.getElementById('shopPrice').value = '';
  document.getElementById('shopName').focus();
  save();
  renderShopList();
  renderSavingSummary();
}

function toggleShopItem(id) {
  const item = data.shoppingList.find(i => i.id === id);
  if (item) item.checked = !item.checked;
  save();
  renderShopList();
  renderSavingSummary();
}

function deleteShopItem(id) {
  data.shoppingList = data.shoppingList.filter(i => i.id !== id);
  save();
  renderShopList();
  renderSavingSummary();
}

function clearDoneItems() {
  data.shoppingList = (data.shoppingList || []).filter(i => !i.checked);
  save();
  renderShopList();
  renderSavingSummary();
}

function renderShopList() {
  if (!data.shoppingList) data.shoppingList = [];
  const el = document.getElementById('shopList');
  const totalEl = document.getElementById('shopTotal');

  if (data.shoppingList.length === 0) {
    el.innerHTML = '<p style="font-size:14px;color:var(--muted);padding:8px 0">Ingen varer endnu. Tilføj varer ovenfor.</p>';
    totalEl.style.display = 'none';
    return;
  }

  el.innerHTML = data.shoppingList.map(item =>
    `<div class="shop-item">
      <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleShopItem(${item.id})">
      <span class="si-name ${item.checked ? 'done' : ''}">${item.name}</span>
      <span class="si-price">${item.price > 0 ? fmt(item.price) : ''}</span>
      <button class="si-del" onclick="deleteShopItem(${item.id})">✕</button>
    </div>`
  ).join('');

  const total = data.shoppingList.filter(i => !i.checked && i.price > 0).reduce((s,i) => s+i.price, 0);
  if (total > 0) {
    totalEl.style.display = 'block';
    totalEl.textContent = `Estimeret total: ${fmt(total)}`;
  } else {
    totalEl.style.display = 'none';
  }
}

// ── AI Savings tip ──────────────────────────────────────────────
let selectedPrefs = [];

function togglePref(el, pref) {
  el.classList.toggle('selected');
  if (selectedPrefs.includes(pref)) {
    selectedPrefs = selectedPrefs.filter(p => p !== pref);
  } else {
    selectedPrefs.push(pref);
  }
}

async function getAISavingsTip() {
  const resultEl = document.getElementById('aiTipResult');
  if (selectedPrefs.length === 0) {
    resultEl.innerHTML = '<p style="color:var(--muted);font-size:13px">Vælg mindst ét område ovenfor.</p>';
    return;
  }
  resultEl.innerHTML = '<div class="dot-pulse" style="padding:10px 0"><span></span><span></span><span></span></div>';

  const inc = getIncome();
  const totalSpent = getTotalSpent();
  const prefList = selectedPrefs.join(', ');
  const catSummary = data.categories.map(c => {
    const spent = getCategoryExpenses(c.id);
    return `${c.name}: brugt ${fmt(spent)} af ${fmt(c.budget)}`;
  }).join('; ');

  const prompt = `Du er en kort og præcis dansk finansrådgiver. Giv 3 konkrete og praktiske sparetips på max 6 linjer i alt.
Brugerens indkomst: ${fmt(inc)}, forbrug: ${fmt(totalSpent)}.
Kategorier: ${catSummary || 'ingen endnu'}.
Brugeren vil spare på: ${prefList}.
Vær specifik og brug tal. Ingen lange introduktioner.`;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt })
    });
    const d = await res.json();
    resultEl.style.cssText = 'background:var(--accent-light);border:1px solid #c7d2fe;border-radius:10px;padding:14px 16px;font-size:14px;line-height:1.6;margin-top:4px';
    resultEl.innerHTML = marked.parse(d.reply);
  } catch(e) {
    resultEl.textContent = '❌ Kunne ikke hente sparetips.';
  }
}

// ── Render all ─────────────────────────────────────────────────
function renderAll() {
  renderDashboard();
  renderCategoryList();
  renderExpenseList();
  renderIncomePage();
}

// ── Init ───────────────────────────────────────────────────────
load();
renderAll();

document.getElementById('catModal').addEventListener('click', function(e) { if (e.target === this) closeCatModal(); });
document.getElementById('expModal').addEventListener('click', function(e) { if (e.target === this) closeExpModal(); });
document.getElementById('incomeModal').addEventListener('click', function(e) { if (e.target === this) closeIncomeModal(); });
