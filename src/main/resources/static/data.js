// ── data.js ───────────────────────────────────────────────────
// Indeholder al global state (brugerens data, aktiv måned, chart-referencer).
// Håndterer load() og save() mod localStorage, samt skift af måned.
// Alle andre filer læser og skriver til variablerne defineret her.
// ── Data ──────────────────────────────────────────────────────
// Hovedobjektet der indeholder al brugerens data — gemmes i localStorage
let data = {
    income: {},         // gammel fallback til indkomst
    incomeSources: [],  // liste af indkomstkilder (løn, aktier osv.)
    categories: [],     // budgetkategorier
    expenses: [],       // udgifter
    shoppingList: []    // indkøbsliste
};

let currentMonth = new Date().toISOString().slice(0,7); // aktiv måned, fx "2026-04"
let editingCatId = null;   // ID på kategori der redigeres — null hvis ny
let doughnutInst = null;   // reference til doughnut-chart så vi kan slette den før vi laver en ny
let barInst = null;        // reference til bar-chart (samme årsag)
let currentCatFilter = 'alle'; // aktivt filter på kategorisiden

// Farvepalette der bruges automatisk til nye kategorier
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
