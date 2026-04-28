// ── income.js ─────────────────────────────────────────────────
// Håndterer al logik for indkomstsiden.
// Indeholder modal til at tilføje indkomstkilder (løn, aktier, SU osv.).
// renderIncomePage() viser liste over indkomstkilder og en fordelingsbar
// der viser hvor stor en del af indkomsten der er fordelt til kategorier.
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
