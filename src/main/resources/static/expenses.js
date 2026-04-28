// ── expenses.js ───────────────────────────────────────────────
// Håndterer al logik for udgiftssiden.
// Indeholder modal til at registrere udgifter med beskrivelse, beløb, kategori og dato.
// renderExpenseList() viser alle udgifter for den aktive måned sorteret efter dato.
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
