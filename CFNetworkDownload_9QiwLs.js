let currentStep = 1;

// ========== AUDIT WIZARD FUNCTIONS ==========
function nextStep(step) {
    if (validateStep(step)) {
        currentStep = step + 1;
        updateWizard();
    }
}

function prevStep(step) {
    currentStep = step - 1;
    updateWizard();
}

function updateWizard() {
    document.querySelectorAll('.wizard').forEach(w => w.classList.remove('active'));
    document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
    window.scrollTo(0, 0);
}

function validateStep(step) {
    switch(step) {
        case 1:
            return !!document.getElementById('industry').value && 
                   !!document.getElementById('goal').value && 
                   !!document.getElementById('offering').value;
        case 2:
            return !!document.getElementById('audience').value && 
                   !!document.getElementById('websiteUrl').value;
        case 3: return true;
        case 4:
            return !!document.querySelector('input[name="style"]:checked');
        case 5:
            return !!document.querySelector('input[name="budget"]:checked');
        case 6: return true;
        case 7:
            return !!document.getElementById('name').value && 
                   !!document.getElementById('email').value && 
                   document.getElementById('consent').checked;
        default: return true;
    }
}

function generateReport() {
    if (!validateStep(7)) {
        showToast('Bitte fülle alle erforderlichen Felder aus', 'error');
        return;
    }

    const data = {
        industry: document.getElementById('industry').value,
        goal: document.getElementById('goal').value,
        style: document.querySelector('input[name="style"]:checked').value,
        budget: document.querySelector('input[name="budget"]:checked').value,
        painpoints: Array.from(document.querySelectorAll('input[name="painpoints"]:checked')).map(e => e.value)
    };

    const scores = generateScores(data);
    const overallScore = Math.round((scores.ux + scores.seo + scores.perf + scores.trust + scores.conv) / 5);

    document.getElementById('scoreUx').textContent = scores.ux;
    document.getElementById('scoreSeo').textContent = scores.seo;
    document.getElementById('scorePerf').textContent = scores.perf;
    document.getElementById('scoreTrust').textContent = scores.trust;
    document.getElementById('scoreConv').textContent = scores.conv;
    document.getElementById('overallScore').textContent = overallScore;

    const messages = {
        'E-Commerce': 'Dein E-Commerce-Shop hat großes Potenzial! Mit gezielten Optimierungen kannst du Conversions um 30-50% steigern.',
        'Lead Generation': 'Gute Grundlagen vorhanden! Fokus auf Lead Capture wird deine Konversionen stark erhöhen.',
        'Brand Awareness': 'Deine Brand-Präsenz ist vielversprechend. Content und SEO sollten Priorität sein.',
        'default': 'Es gibt großes Verbesserungspotenzial! Mit den Optimierungen in diesem Report erhöhst du deine Online-Erfolge deutlich.'
    };
    const message = messages[data.goal] || messages.default;
    document.getElementById('overallMessage').textContent = message;

    generateRecommendations(data);
    generateSitemap(data);
    generateUserFlow(data);
    generateCopy(data);
    generateRoadmap(data);

    document.getElementById('wizardContainer').style.display = 'none';
    document.getElementById('reportContainer').classList.add('active');

    showToast('✓ Audit generiert! Beratungstermin wird organisiert.', 'success');
}

function generateScores(data) {
    let ux = 70, seo = 60, perf = 65, trust = 75, conv = 60;

    if (data.painpoints.includes('Low Conversion')) conv -= 15;
    if (data.painpoints.includes('Poor Mobile')) ux -= 20;
    if (data.painpoints.includes('Slow Performance')) perf -= 20;
    if (data.painpoints.includes('Low SEO')) seo -= 20;
    if (data.painpoints.includes('Poor Design')) ux -= 15;
    if (data.painpoints.includes('Outdated Tech')) perf -= 15;

    if (data.goal === 'E-Commerce') conv += 10;
    if (data.goal === 'Lead Generation') conv += 15;

    if (data.style === 'Seriös') trust += 10;
    if (data.style === 'Cyber') perf += 5;
    if (data.style === 'Minimal') ux += 10;

    return {
        ux: Math.max(20, Math.min(100, ux)),
        seo: Math.max(20, Math.min(100, seo)),
        perf: Math.max(20, Math.min(100, perf)),
        trust: Math.max(20, Math.min(100, trust)),
        conv: Math.max(20, Math.min(100, conv))
    };
}

function generateRecommendations(data) {
    const quickWins = [
        { n: 1, t: 'Meta Tags & Schema Markup', d: 'Structured data für Google Rich Snippets (+20% CTR)' },
        { n: 2, t: 'Core Web Vitals', d: 'LCP, FID, CLS optimieren – direkte Ranking-Faktoren' },
        { n: 3, t: 'Mobile-First', d: '60%+ Traffic von Mobilgeräten – Fokus setzen' },
        { n: 4, t: 'CTA-Kontrast', d: 'Auffällige Buttons erhöhen Klickrate um 10-25%' },
        { n: 5, t: 'FAQ-Section', d: 'Reduziert Support-Tickets um 30%+ und boosted SEO' },
        { n: 6, t: 'Trust Elements', d: 'Badges, Bewertungen, Zertifikate sichtbar machen' },
        { n: 7, t: 'Page-Speed <2s', d: 'Image Lazy Loading, Caching, CDN nutzen' },
        { n: 8, t: 'Heading-Struktur', d: 'Eine H1 pro Seite, logische H2/H3-Hierarchie' },
        { n: 9, t: 'Internal Links', d: 'Verlinkung auf relevante Seiten – SEO & Engagement' },
        { n: 10, t: 'Form Validation', d: 'Real-time Feedback reduziert Abbrüche um ~15%' }
    ];

    const highImpact = [
        { p: 1, t: 'Konversionsfunnel', d: 'A/B-Tests von Headlines & CTAs (+25-40% Conversions)' },
        { p: 2, t: 'SEO-Strategie', d: 'Keyword Research, Content-Cluster, Backlinks (3-6 Monate ROI)' },
        { p: 3, t: 'E-Mail-Funnel', d: 'Welcome-Series, Re-Engagement, Upsell (+30-50% CLV)' },
        { p: 4, t: 'Content Hub', d: '20+ optimierte Artikel für Keywords (Organic +150-300%)' },
        { p: 5, t: 'Sales-Automation', d: 'Live Chat, Chatbot, Booking (-40% Support, +25% Conversion)' }
    ];

    let quickWinsHtml = '';
    quickWins.forEach(item => {
        quickWinsHtml += `
            <div class="list-item">
                <div class="list-number">${item.n}</div>
                <div class="list-content">
                    <p><strong>${item.t}</strong><br>${item.d}</p>
                </div>
            </div>
        `;
    });
    document.getElementById('quickWins').innerHTML = quickWinsHtml;

    let highImpactHtml = '';
    highImpact.forEach(item => {
        highImpactHtml += `
            <div class="list-item">
                <div class="list-number">${item.p}</div>
                <div class="list-content">
                    <p><strong>${item.t}</strong><br>${item.d}</p>
                </div>
            </div>
        `;
    });
    document.getElementById('highImpact').innerHTML = highImpactHtml;
}

function generateSitemap(data) {
    const sitemap = `Home
├── Über Uns
├── Services / Angebote
│   ├── Service 1
│   ├── Service 2
│   └── Service 3
├── Portfolio
├── Blog
├── Pricing
├── FAQ
├── Kontakt
├── Impressum
├── Datenschutz
└── AGB

Lead Magnet:
├── Free Audit
├── Whitepaper
└── E-Book`;
    document.getElementById('sitemap').textContent = sitemap;
}

function generateUserFlow(data) {
    const flow = `
        <div class="list-item" style="flex-direction: column;">
            <p><strong>Awareness:</strong> Traffic via Google, Ads, Social Media</p>
        </div>
        <div class="list-item" style="flex-direction: column;">
            <p><strong>Consideration:</strong> Landing Page → Trust Elements → Value Proposition</p>
        </div>
        <div class="list-item" style="flex-direction: column;">
            <p><strong>Decision:</strong> Lead Magnet → Email Capture → Follow-up Sequenz</p>
        </div>
        <div class="list-item" style="flex-direction: column;">
            <p><strong>Action:</strong> CTA → Formular / Booking → Conversion Tracking</p>
        </div>
    `;
    document.getElementById('userFlow').innerHTML = flow;
}

function generateCopy(data) {
    const headlines = [
        'Verbessere dein Geschäft in 3 Minuten – kostenlos',
        `${data.industry} optimieren? Wir zeigen dir genau, wie`,
        'Deine Website verdient mehr Traffic',
        `Von ${data.goal} zu echten Ergebnissen`,
        'Entdecke deine Website-Potenziale'
    ];

    const ctas = [
        'Kostenloses Audit starten',
        'Mein Potenzial entdecken',
        'Audit erhalten',
        'Strategie abholen',
        'Zum Plan'
    ];

    let headlinesHtml = '';
    headlines.forEach((h, i) => {
        headlinesHtml += `<div class="list-item" style="margin-bottom: 12px;"><div class="list-number">${i+1}</div><div class="list-content"><p>${h}</p></div></div>`;
    });
    document.getElementById('headlines').innerHTML = headlinesHtml;

    let ctasHtml = '';
    ctas.forEach((c, i) => {
        ctasHtml += `<div class="list-item" style="margin-bottom: 12px;"><div class="list-number">${i+1}</div><div class="list-content"><p>${c}</p></div></div>`;
    });
    document.getElementById('ctas').innerHTML = ctasHtml;
}

function generateRoadmap(data) {
    const mvp = '<ul style="color: var(--text-secondary); margin-left: 20px;"><li>Landing Page</li><li>Responsive Design</li><li>Performance Opt.</li><li>Analytics Setup</li><li>Basic SEO</li><li>Contact Form</li></ul>';
    const v2 = '<ul style="color: var(--text-secondary); margin-left: 20px;"><li>Content Hub</li><li>Advanced Funnel</li><li>Live Chat</li><li>Social Proof</li><li>Advanced Analytics</li><li>A/B Testing</li></ul>';
    const v3 = '<ul style="color: var(--text-secondary); margin-left: 20px;"><li>Sales Automation</li><li>Advanced SEO</li><li>Personalisierung</li><li>Paid Ads</li><li>API Integrations</li><li>Community</li></ul>';

    document.getElementById('mvp').innerHTML = mvp;
    document.getElementById('v2').innerHTML = v2;
    document.getElementById('v3').innerHTML = v3;
}

function contactConsultation() {
    showToast('✓ Beratungstermin wird organisiert...', 'success');
    setTimeout(() => {
        alert('Danke! Ein Koordinator meldet sich in 24h bei dir.');
    }, 1500);
}

// ========== PRICING CONFIGURATOR FUNCTIONS ==========
const packages = {
    startup: {
        basePrice: 5000,
        weeks: 4,
        features: [
            'Landing Page',
            'Responsive Design',
            'Performance Optimization',
            'Basic SEO',
            'Contact Form',
            '3 Monate Support'
        ]
    },
    growth: {
        basePrice: 15000,
        weeks: 9,
        features: [
            '8-10 Service Pages',
            'Advanced UX/UI',
            'E-Mail Funnel',
            'Analytics & Tracking',
            'Live Chat',
            'A/B Testing',
            '6 Monate Support'
        ]
    },
    enterprise: {
        basePrice: 75000,
        weeks: 14,
        features: [
            'Vollständige Custom Dev',
            'Security & Compliance',
            'API Integrations',
            'Sales Automation',
            'Personalisierung',
            'SEO Link Building',
            'Paid Ads Integration',
            '12 Monate Support'
        ]
    }
};

const addons = {
    'addon-seo': { name: '🔍 SEO Content Hub', price: 3000 },
    'addon-email': { name: '📧 E-Mail Marketing', price: 1500 },
    'addon-app': { name: '📱 Mobile App', price: 8000 },
    'addon-chatbot': { name: '🤖 AI Chatbot', price: 2000 },
    'addon-brand': { name: '🎨 Brand Identity', price: 2500 },
    'addon-analytics': { name: '📊 Advanced Analytics', price: 1000 }
};

function updateCalculation() {
    const selectedPackage = document.querySelector('input[name="package"]:checked').value;
    const packageData = packages[selectedPackage];

    let basePrice = packageData.basePrice;
    const pages = parseInt(document.getElementById('pages').value);
    const pageMultiplier = [1, 1.3, 1.6, 2][pages - 1];
    let price = Math.round(basePrice * pageMultiplier);

    const urgency = parseInt(document.getElementById('urgency').value);
    const urgencySurcharge = [0, 0.15, 0.35][urgency - 1];
    price = Math.round(price * (1 + urgencySurcharge));

    let addonsTotal = 0;
    let selectedAddons = [];
    Object.keys(addons).forEach(key => {
        if (document.getElementById(key).checked) {
            addonsTotal += addons[key].price;
            selectedAddons.push(addons[key].name);
        }
    });

    const finalPrice = price + addonsTotal;

    document.getElementById('totalPrice').textContent = formatPrice(finalPrice);
    document.getElementById('priceNote').textContent = selectedPackage === 'startup' ? 'Startup Paket' : selectedPackage === 'growth' ? 'Growth Paket' : 'Enterprise Lösung';

    let weeks = packageData.weeks + (urgency === 3 ? -2 : urgency === 2 ? -1 : 0);
    document.getElementById('timeline').textContent = `${weeks} Wochen`;

    const urgencyLabels = ['Normal', 'Express (+15%)', 'ASAP 🚨 (+35%)'];
    document.getElementById('urgencyLabel').textContent = urgencyLabels[urgency - 1];

    const pageLabels = ['5-8 Seiten', '10-15 Seiten', '20-30 Seiten', '50+ Seiten'];
    document.getElementById('pagesLabel').textContent = pageLabels[pages - 1];

    const featuresList = packageData.features.map(f => `<li>${f}</li>`).join('');
    document.getElementById('packageFeatures').innerHTML = featuresList;

    if (selectedAddons.length > 0) {
        document.getElementById('addonsSection').style.display = 'block';
        const addonsHtml = selectedAddons.map(addon => `
            <div class="summary-item">
                <span>${addon}</span>
                <span class="summary-item-price">${formatPrice(addons[Object.keys(addons).find(k => addons[k].name === addon)].price)}</span>
            </div>
        `).join('');
        document.getElementById('selectedAddons').innerHTML = addonsHtml;
    } else {
        document.getElementById('addonsSection').style.display = 'none';
    }

    const roiMultiplier = { startup: 45, growth: 120, enterprise: 350 };
    const baseLeads = roiMultiplier[selectedPackage];
    const leads = Math.round(baseLeads * pageMultiplier);
    const dealValue = 2500;
    const conversionRate = 0.04;
    const clients = Math.round(leads * conversionRate);
    const monthlyReturn = clients * dealValue;
    const paybackMonths = Math.round(finalPrice / monthlyReturn) || 1;

    document.getElementById('roiLeads').textContent = `+${leads}`;
    document.getElementById('roiDealValue').textContent = formatPrice(dealValue);
    document.getElementById('roiConversions').textContent = `+${clients} Clients`;
    document.getElementById('roiMonthly').textContent = formatPrice(monthlyReturn);
    document.getElementById('paybackMonths').textContent = paybackMonths === 1 ? '1 Monat' : `${paybackMonths} Monaten`;
}

function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
    }).format(price);
}

function requestQuote() {
    const selectedPackage = document.querySelector('input[name="package"]:checked').value;
    const price = document.getElementById('totalPrice').textContent;
    const timeline = document.getElementById('timeline').textContent;

    showToast('✓ Angebot wird verarbeitet...');

    setTimeout(() => {
        alert(`Danke für dein Interesse! 🎉\n\nPaket: ${selectedPackage.toUpperCase()}\nPreis: ${price}\nLieferzeit: ${timeline}\n\nEin Koordinator meldet sich in 24h.`);
    }, 1500);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.background = type === 'success'
        ? 'rgba(16, 185, 129, 0.9)'
        : type === 'error'
        ? 'rgba(239, 68, 68, 0.9)'
        : 'rgba(0, 217, 255, 0.9)';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}

// Initialize
updateCalculation();