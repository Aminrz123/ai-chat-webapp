// ── helpers.js ────────────────────────────────────────────────
// Indeholder genbrugelige hjælpefunktioner brugt på tværs af hele appen.
// fmt() formaterer tal til dansk valuta.
// getIncome(), getTotalSpent(), getTotalBudget() beregner månedlige totaler.
// getCategoryExpenses() og pctColor() bruges til progress bars og kategorioversigt.
// ── Helpers ────────────────────────────────────────────────────
// fmt() formaterer et tal til dansk valuta, fx 5000 → "5.000 kr."
function fmt(n) {
    return Number(n).toLocaleString('da-DK') + ' kr.';
}

function getIncome() {
    // Summerer alle indkomstkilder for den aktive måned
    const fromSources = (data.incomeSources || [])
        .filter(s => s.month === currentMonth)
        .reduce((sum, s) => sum + s.amount, 0);
    // Bruger nye indkomstkilder hvis de findes, ellers den gamle enkelt-værdi
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
