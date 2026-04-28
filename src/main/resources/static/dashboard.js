// ── dashboard.js ──────────────────────────────────────────────
// Renderer forsiden (dashboard) med overblik over månedens økonomi.
// Viser overskud/underskud-banner, stat-kort (indkomst, faste, variable, opsparing)
// og progress bars per kategori der viser hvor meget af budgettet er brugt.
// ── Dashboard ──────────────────────────────────────────────────
function renderDashboard() {
    const inc = getIncome();
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
