// ── app.js ────────────────────────────────────────────────────
// Appens indgangspunkt — køres sidst efter alle andre filer er loadet.
// renderAll() kalder alle render-funktioner på én gang (bruges ved månedsskift osv.).
// Init-blokken starter appen: loader data fra localStorage og sætter event listeners på modaler.
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
