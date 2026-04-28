// ── ai.js ─────────────────────────────────────────────────────
// Indeholder al AI-logik i appen — tre funktioner:
// buildBudgetContext() bygger den prompt der sendes til Groq med brugerens budgetdata.
// parseAndExecuteAIActions() scanner AI-svaret for handlings-tags og opretter kategorier/udgifter.
// askAI() sender brugerens spørgsmål til /api/chat og viser svaret i chatboblen.
// renderInsights() genererer automatiske budgetanbefalinger uden AI (ren logik).
// getAISavingsTip() sender en sparetips-prompt til AI'en baseret på brugerens præferencer.
// ── AI Chat ────────────────────────────────────────────────────
// Bygger den prompt der sendes til Groq — indeholder al brugerens budgetdata som kontekst
function buildBudgetContext() {
    const inc = getIncome();           // samlet indkomst denne måned
    const totalSpent = getTotalSpent(); // samlet forbrug denne måned
    const months = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'];
    const [y, m] = currentMonth.split('-');
    const månedNavn = months[parseInt(m)-1] + ' ' + y; // fx "april 2026"

    // Budgettotaler opdelt på type
    const fixedBudget  = data.categories.filter(c => c.type === 'fast').reduce((s,c) => s + c.budget, 0);
    const varBudget    = data.categories.filter(c => c.type === 'variabel').reduce((s,c) => s + c.budget, 0);
    const savingBudget = data.categories.filter(c => c.type === 'opsparing').reduce((s,c) => s + c.budget, 0);

    // ctx er den samlede tekststreng vi sender til AI'en som system-prompt + brugerdata
    let ctx = `Du er en kort og præcis dansk finansrådgiver i en chat-app. Svar ALTID på max 4-5 linjer. Ingen lange introduktioner eller opsummeringer. Gå direkte til sagen. Du kan svare på alt inden for økonomi og finans: aktier, investeringer, opsparing, budget, pension, skat osv. Brug brugerens budgetdata som kontekst når det er relevant.\n\n`;

    // Fortæller AI'en hvilke handlinger den kan udføre — men kun hvis brugeren eksplicit beder om det
    ctx += `HANDLINGER DU KAN UDFØRE – MEN KUN HVIS BRUGEREN EKSPLICIT BEDER OM DET:\n`;
    ctx += `Brug KUN disse tags hvis brugeren tydeligt beder dig om at "oprette en kategori" eller "tilføje en udgift". Opret IKKE kategorier eller udgifter blot fordi emnet nævnes.\n\n`;
    ctx += `1. Opret kategori (kun hvis brugeren beder om det):\n`;
    ctx += `[OPRET_KATEGORI:{"name":"Kategorinavn","icon":"🏠","budget":1000,"type":"fast"}]\n`;
    ctx += `Type kan være: fast, variabel eller opsparing.\n\n`;
    ctx += `2. Registrér udgift (kun hvis brugeren beder om det):\n`;
    ctx += `[OPRET_UDGIFT:{"description":"Beskrivelse","amount":500,"categoryName":"Kategorinavn","date":"${new Date().toISOString().slice(0,10)}"}]\n`;
    ctx += `categoryName skal matche et eksisterende kategorinavn fra listen nedenfor.\n\n`;

    // Pakker brugerens faktiske budgettal ind i prompten
    ctx += `BRUGERENS BUDGETDATA FOR ${månedNavn.toUpperCase()}:\n`;
    ctx += `- Månedlig indkomst: ${fmt(inc)}\n`;
    ctx += `- Samlet forbrug: ${fmt(totalSpent)}\n`;
    ctx += `- Overskud/underskud: ${fmt(inc - totalSpent)}\n`;
    ctx += `- Faste udgifter (budget): ${fmt(fixedBudget)}\n`;
    ctx += `- Variable udgifter (budget): ${fmt(varBudget)}\n`;
    ctx += `- Opsparing (budget): ${fmt(savingBudget)}\n\n`;

    // Tilføjer alle kategorier med budget og forbrug
    ctx += `KATEGORIER:\n`;
    data.categories.forEach(c => {
        const spent = getCategoryExpenses(c.id);
        const pct = c.budget > 0 ? ((spent/c.budget)*100).toFixed(0) : 0;
        ctx += `- ${c.icon} ${c.name} [${c.type || 'variabel'}]: budget ${fmt(c.budget)}, brugt ${fmt(spent)} (${pct}%)\n`;
    });

    // Tilføjer de seneste 8 udgifter som ekstra kontekst
    if (data.expenses.filter(e => e.month === currentMonth).length > 0) {
        ctx += `\nSENESTE UDGIFTER:\n`;
        data.expenses.filter(e => e.month === currentMonth).slice(-8).forEach(e => {
            const cat = data.categories.find(c => c.id === e.categoryId);
            ctx += `- ${e.description}: ${fmt(e.amount)} (${cat ? cat.name : 'Ukendt'})\n`;
        });
    }
    return ctx;
}

// parseAndExecuteAIActions() scanner AI-svaret for handlings-tags og udfører dem
// text = det rå svar fra AI'en, kan indeholde tags som [OPRET_KATEGORI:{...}]
function parseAndExecuteAIActions(text) {
    // cleanText = AI-svaret uden handlings-tags — det er det der vises til brugeren
    let cleanText = text;
    const notifications = [];

    // ── Opret kategorier ──────────────────────────────────────────
    // catRegex finder alle [OPRET_KATEGORI:{...}] tags i AI-svaret med regex
    const catRegex = /\[OPRET_KATEGORI:(\{[^}]+\})\]/g;
    // match = det aktuelle fund fra regex — bruges i while-løkken til at hente ét tag ad gangen
    let match;
    let createdCats = [];
    while ((match = catRegex.exec(text)) !== null) {
        try {
            const p = JSON.parse(match[1]);
            if (p.name) {
                const exists = data.categories.find(c => c.name.toLowerCase() === p.name.toLowerCase());
                if (!exists) {
                    data.categories.push({
                        id: Date.now() + Math.round(Math.random() * 1000),
                        name: p.name,
                        icon: p.icon || '📁',
                        budget: p.budget || 0,
                        color: COLORS[data.categories.length % COLORS.length],
                        type: p.type || 'variabel'
                    });
                    createdCats.push(p.name);
                }
            }
            cleanText = cleanText.replace(match[0], '');
        } catch(e) {}
    }
    if (createdCats.length > 0) {
        notifications.push(`🗂️ Kategori oprettet: ${createdCats.join(', ')}`);
    }

    // ── Opret udgifter ────────────────────────────────────────────
    const expRegex = /\[OPRET_UDGIFT:(\{[^}]+\})\]/g;
    let createdExps = [];
    while ((match = expRegex.exec(text)) !== null) {
        try {
            const p = JSON.parse(match[1]);
            if (p.description && p.amount && p.categoryName) {
                // Find kategori — prøv eksakt match, derefter delvis match
                let cat = data.categories.find(c => c.name.toLowerCase() === p.categoryName.toLowerCase());
                if (!cat) cat = data.categories.find(c => c.name.toLowerCase().includes(p.categoryName.toLowerCase()) || p.categoryName.toLowerCase().includes(c.name.toLowerCase()));
                if (cat) {
                    const date = p.date || new Date().toISOString().slice(0, 10);
                    data.expenses.push({
                        id: Date.now() + Math.round(Math.random() * 1000),
                        categoryId: cat.id,
                        amount: parseFloat(p.amount),
                        description: p.description,
                        date: date,
                        month: date.slice(0, 7)
                    });
                    createdExps.push(`${p.description} (${Number(p.amount).toLocaleString('da-DK')} kr.)`);
                }
            }
            cleanText = cleanText.replace(match[0], '');
        } catch(e) {}
    }
    if (createdExps.length > 0) {
        notifications.push(`🧾 Udgift registreret: ${createdExps.join(', ')}`);
    }

    // ── Gem og opdatér UI ─────────────────────────────────────────
    if (createdCats.length > 0 || createdExps.length > 0) {
        save();
        renderCategoryList();
        renderExpenseList();
        renderDashboard();
    }

    // Vis notifikationer
    notifications.forEach(msg => {
        const note = document.createElement('div');
        note.style.cssText = 'background:var(--green-light);border:1px solid #a7f3d0;border-radius:8px;padding:10px 14px;font-size:13px;color:#065f46;font-weight:600;margin-top:8px';
        note.textContent = '✅ ' + msg;
        document.getElementById('aiMessages').appendChild(note);
    });

    return cleanText.trim();
}

// askAI() kaldes når brugeren sender en besked i AI-chatten
async function askAI() {
    const input = document.getElementById('aiInput');
    const sendBtn = document.getElementById('aiSendBtn');
    const userText = input.value.trim();
    if (!userText) return;

    const messagesEl = document.getElementById('aiMessages');

    // Fjern velkomst-skærm første gang
    const welcome = document.getElementById('aiWelcome');
    if (welcome) welcome.remove();

    input.value = '';
    sendBtn.disabled = true;

    // Bruger-boble
    const userBubble = document.createElement('div');
    userBubble.className = 'ai-bubble-user';
    userBubble.textContent = userText;
    messagesEl.appendChild(userBubble);

    // Loading-boble med pulserende prikker
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'ai-bubble-loading';
    loadingBubble.innerHTML = '<div class="dot-pulse"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(loadingBubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // prompt = hele konteksten (brugerens budgetdata) + brugerens spørgsmål — sendes som én samlet streng til AI'en
    const prompt = buildBudgetContext() + `\nBRUGERENS SPØRGSMÅL: ${userText}`;

    try {
        // fetch() sender prompt til vores Spring Boot backend, som videresender til Groq API
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt })
        });
        const data2 = await res.json();
        const cleanReply = parseAndExecuteAIActions(data2.reply);
        loadingBubble.className = 'ai-bubble-bot';
        // marked.parse() konverterer AI'ens markdown-svar til HTML, fx **fed** → <strong>fed</strong>
        loadingBubble.innerHTML = marked.parse(cleanReply);
    } catch (e) {
        loadingBubble.className = 'ai-bubble-bot';
        loadingBubble.textContent = '❌ Kunne ikke kontakte AI. Er serveren kørende?';
    }

    sendBtn.disabled = false;
    messagesEl.scrollTop = messagesEl.scrollHeight;
    input.focus();
}

// ── AI Insights ────────────────────────────────────────────────
function renderInsights() {
    const inc = getIncome();
    const totalSpent = getTotalSpent();
    const totalBudget = getTotalBudget();
    const insights = [];

    if (inc === 0) {
        insights.push({ type:'blue', icon:'💡', title:'Kom i gang', desc:'Indtast din månedlige indkomst og opret budgetkategorier for at modtage personlige anbefalinger.' });
    }

    data.categories.forEach(c => {
        const spent = getCategoryExpenses(c.id);
        if (spent > c.budget) {
            insights.push({ type:'red', icon:'⚠️', title:`Over budget: ${c.icon} ${c.name}`, desc:`Du har brugt ${fmt(spent)} ud af ${fmt(c.budget)} – det er ${fmt(spent - c.budget)} over budget (${(((spent-c.budget)/c.budget)*100).toFixed(0)}%). Overvej at reducere udgifterne i denne kategori.` });
        } else if (c.budget > 0 && spent / c.budget >= 0.85) {
            insights.push({ type:'orange', icon:'📢', title:`Tæt på grænse: ${c.icon} ${c.name}`, desc:`Du har brugt ${((spent/c.budget)*100).toFixed(0)}% af dit budget for ${c.name}. Der er kun ${fmt(c.budget - spent)} tilbage.` });
        }
    });

    const savings = data.categories.find(c => c.type === 'opsparing' || c.name.toLowerCase().includes('opsparing') || c.name.toLowerCase().includes('spare'));
    if (inc > 0 && !savings) {
        insights.push({ type:'orange', icon:'🐷', title:'Ingen opsparingskategori', desc:'Det anbefales at spare mindst 10-20% af din indkomst. Opret en "Opsparing"-kategori for at holde styr på det.' });
    } else if (savings && inc > 0) {
        const savingsPct = (savings.budget / inc) * 100;
        if (savingsPct < 10) {
            insights.push({ type:'orange', icon:'🐷', title:'Lav opsparing', desc:`Din opsparingskategori udgør kun ${savingsPct.toFixed(0)}% af din indkomst. Finanseksperter anbefaler mindst 10-20%.` });
        } else {
            insights.push({ type:'green', icon:'🐷', title:'God opsparing!', desc:`Du sparer ${savingsPct.toFixed(0)}% af din indkomst – det er ${savingsPct >= 20 ? 'fremragende' : 'godt'}! Fortsæt det gode arbejde.` });
        }
    }

    if (inc > 0 && totalSpent > 0) {
        const spentPct = (totalSpent / inc) * 100;
        if (spentPct > 90) {
            insights.push({ type:'red', icon:'🔥', title:'Højt forbrug denne måned', desc:`Du har allerede brugt ${spentPct.toFixed(0)}% af din indkomst (${fmt(totalSpent)} af ${fmt(inc)}). Der er kun ${fmt(inc - totalSpent)} tilbage.` });
        } else if (spentPct < 50) {
            insights.push({ type:'green', icon:'✅', title:'Godt styr på budgettet', desc:`Du har brugt ${spentPct.toFixed(0)}% af din indkomst denne måned. Du er godt på vej til at holde budgettet.` });
        }
    }

    if (inc > 0 && totalBudget < inc) {
        const unalloc = inc - totalBudget;
        insights.push({ type:'blue', icon:'💡', title:'Ufordelt indkomst', desc:`Du har ${fmt(unalloc)} (${((unalloc/inc)*100).toFixed(0)}%) af din indkomst som ikke er tildelt nogen kategori. Overvej at fordele det til opsparing eller andre kategorier.` });
    }

    if (inc > 0 && data.categories.length > 0) {
        insights.push({ type:'blue', icon:'📐', title:'50/30/20-reglen', desc:`En populær budgetregel: 50% til faste udgifter (${fmt(inc*0.5)}), 30% til livsstil (${fmt(inc*0.3)}), 20% til opsparing og gæld (${fmt(inc*0.2)}).` });
    }

    if (insights.length === 0) {
        insights.push({ type:'green', icon:'🎉', title:'Alt ser fint ud!', desc:'Du holder dig inden for budget i alle kategorier. Fortsæt det gode arbejde!' });
    }

    document.getElementById('insightsList').innerHTML = insights.map(i =>
        `<div class="insight-card ${i.type}">
      <div class="insight-icon">${i.icon}</div>
      <div class="insight-text">
        <div class="title">${i.title}</div>
        <div class="desc">${i.desc}</div>
      </div>
    </div>`
    ).join('');
}

// ── AI Savings tip ──────────────────────────────────────────────
let selectedPrefs = [];

function togglePref(el, pref) {
    el.classList.toggle('selected');
    if (selectedPrefs.includes(pref)) {
        selectedPrefs = selectedPrefs.filter(p => p !== pref);
    } else {
        selectedPrefs.push(pref);
    }
}

// getAISavingsTip() henter AI-sparetips baseret på brugerens valgte præferencer
async function getAISavingsTip() {
    const resultEl = document.getElementById('aiTipResult');
    if (selectedPrefs.length === 0) {
        resultEl.innerHTML = '<p style="color:var(--muted);font-size:13px">Vælg mindst ét område ovenfor.</p>';
        return;
    }
    resultEl.innerHTML = '<div class="dot-pulse" style="padding:10px 0"><span></span><span></span><span></span></div>';

    const inc = getIncome();
    const totalSpent = getTotalSpent();
    const prefList = selectedPrefs.join(', ');
    const catSummary = data.categories.map(c => {
        const spent = getCategoryExpenses(c.id);
        return `${c.name}: brugt ${fmt(spent)} af ${fmt(c.budget)}`;
    }).join('; ');

    // prompt = instruktion til AI'en med brugerens tal og ønsker — sendes direkte til /api/chat
    const prompt = `Du er en kort og præcis dansk finansrådgiver. Giv 3 konkrete og praktiske sparetips på max 6 linjer i alt.
Brugerens indkomst: ${fmt(inc)}, forbrug: ${fmt(totalSpent)}.
Kategorier: ${catSummary || 'ingen endnu'}.
Brugeren vil spare på: ${prefList}.
Vær specifik og brug tal. Ingen lange introduktioner.`;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt })
        });
        const d = await res.json();
        resultEl.style.cssText = 'background:var(--accent-light);border:1px solid #c7d2fe;border-radius:10px;padding:14px 16px;font-size:14px;line-height:1.6;margin-top:4px';
        // marked.parse() gør AI-svaret om til formateret HTML med lister og fed tekst
        resultEl.innerHTML = marked.parse(d.reply);
    } catch(e) {
        resultEl.textContent = '❌ Kunne ikke hente sparetips.';
    }
}
