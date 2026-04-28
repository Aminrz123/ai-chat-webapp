// ── navigation.js ─────────────────────────────────────────────
// Styrer navigation mellem siderne i appen (SPA — Single Page Application).
// showPage() skjuler alle sider og viser kun den valgte ved at toggle CSS-klassen "active".
// Kalder også den relevante render-funktion når en side åbnes.
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
