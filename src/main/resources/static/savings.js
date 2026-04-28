// ── savings.js ────────────────────────────────────────────────
// Håndterer al logik for besparelsessiden.
// renderSavingSummary() viser totaler for takeaway, abonnementer og potentiel besparelse.
// renderSpendingAlerts() analyserer udgifter og viser advarsler (takeaway, impulskøb, små køb).
// renderSubList() viser liste over faste udgifter/abonnementer.
// addShopItem/toggleShopItem/deleteShopItem/renderShopList() styrer indkøbslisten.
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
