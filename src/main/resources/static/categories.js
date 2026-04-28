// ── categories.js ─────────────────────────────────────────────
// Håndterer al logik for kategorisiden.
// Indeholder modal til at oprette og redigere kategorier (navn, ikon, budget, type).
// filterCategories() filtrerer listen på type (fast, variabel, opsparing).
// addStandardCategories() tilføjer et sæt færdige standardkategorier med ét klik.
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
