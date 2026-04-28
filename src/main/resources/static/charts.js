// ── charts.js ─────────────────────────────────────────────────
// Renderer de to grafer på statistiksiden ved hjælp af Chart.js biblioteket.
// Doughnut-chart viser budgetfordeling per kategori.
// Bar-chart viser brugt vs. tilbage per kategori som et stacked søjlediagram.
// Eksisterende chart-instanser destrueres før nye oprettes for at undgå dobbelt-rendering.
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
