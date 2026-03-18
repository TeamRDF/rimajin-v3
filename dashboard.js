/* ============================================
   RIMAJIN — Dashboard Logic
   ============================================ */

// ── Auth Guard ──
(function () {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Populate user info
    const avatar = document.getElementById('dashAvatar');
    const userName = document.getElementById('dashUserName');
    const userEmail = document.getElementById('dashUserEmail');
    const welcomeName = document.getElementById('welcomeName');
    const userNameBtn = document.getElementById('userNameBtn');

    if (avatar) avatar.textContent = (user.firstName[0] + user.lastName[0]).toUpperCase();
    if (userName) userName.textContent = user.firstName + ' ' + user.lastName;
    if (userEmail) userEmail.textContent = user.email;
    if (welcomeName) welcomeName.textContent = user.firstName;
    if (userNameBtn) userNameBtn.textContent = user.firstName;

    // Set min date for booking
    const bookDate = document.getElementById('bookDate');
    if (bookDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        bookDate.min = tomorrow.toISOString().split('T')[0];
    }

    // Populate settings
    const sf = document.getElementById('settingsFirstName');
    const sl = document.getElementById('settingsLastName');
    const se = document.getElementById('settingsEmail');
    const sp = document.getElementById('settingsPhone');
    if (sf) sf.value = user.firstName;
    if (sl) sl.value = user.lastName;
    if (se) se.value = user.email;
    if (sp) sp.value = user.phone || '';

    // Load data
    loadOverviewStats();
    loadBookings();
    loadQuotes();
    loadInvoices();
})();

// ── Data Helpers ──
function getPrefix() {
    const u = getCurrentUser();
    return u ? `rimajin_${u.email}_` : '';
}

function getData(key) {
    return JSON.parse(localStorage.getItem(getPrefix() + key) || '[]');
}

function setData(key, data) {
    localStorage.setItem(getPrefix() + key, JSON.stringify(data));
}

// ── Panel Switching ──
function switchPanel(panel) {
    document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.dash-nav-item').forEach(n => n.classList.remove('active'));

    const el = document.getElementById('panel-' + panel);
    const nav = document.querySelector(`[data-panel="${panel}"]`);
    if (el) el.classList.add('active');
    if (nav) nav.classList.add('active');
}

// ── Overview Stats ──
function loadOverviewStats() {
    const bookings = getData('bookings');
    const quotes = getData('quotes');
    const invoices = getData('invoices');

    const upcoming = bookings.filter(b => new Date(b.date) >= new Date()).length;
    const pendingQuotes = quotes.filter(q => q.status === 'submitted').length;
    const outstanding = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
    const completed = invoices.filter(i => i.status === 'paid').length;

    const el1 = document.getElementById('statBookings');
    const el2 = document.getElementById('statQuotes');
    const el3 = document.getElementById('statInvoices');
    const el4 = document.getElementById('statCompleted');
    if (el1) el1.textContent = upcoming;
    if (el2) el2.textContent = pendingQuotes;
    if (el3) el3.textContent = '$' + outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 });
    if (el4) el4.textContent = completed;

    loadActivity();
}

function loadActivity() {
    const container = document.getElementById('activityList');
    if (!container) return;
    const bookings = getData('bookings');
    const quotes = getData('quotes');
    const invoices = getData('invoices');

    const all = [
        ...bookings.map(b => ({ icon: '📅', title: 'Service Booked', desc: b.service, time: b.createdAt, type: 'booking' })),
        ...quotes.map(q => ({ icon: '📝', title: 'Quote Requested', desc: q.service, time: q.createdAt, type: 'quote' })),
        ...invoices.filter(i => i.status === 'paid').map(i => ({ icon: '✓', title: 'Invoice Paid', desc: i.id + ' — $' + i.amount.toFixed(2), time: i.paidAt || i.date, type: 'paid' }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    if (all.length === 0) {
        container.innerHTML = '<div class="activity-empty">No recent activity. Book a service or request a quote to get started.</div>';
        return;
    }

    container.innerHTML = all.map(a => `
    <div class="activity-item">
      <div class="activity-icon">${a.icon}</div>
      <div class="activity-info">
        <div class="activity-title">${a.title}</div>
        <div class="activity-desc">${a.desc}</div>
      </div>
      <div class="activity-time">${formatRelativeTime(a.time)}</div>
    </div>
  `).join('');
}

function formatRelativeTime(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h ago';
    const days = Math.floor(hours / 24);
    if (days < 7) return days + 'd ago';
    return new Date(dateStr).toLocaleDateString();
}

// ── Service Labels ──
const serviceLabels = {
    'solar': '☀️ Solar Integration',
    'ev': '🔌 EV Charger Installation',
    'residential': '🏠 Residential Electrical',
    'commercial': '🏢 Commercial Electrical',
    'generator': '⚡ Generator Installation',
    'inspection': '🔍 Electrical Inspection',
    'troubleshoot': '🔧 Troubleshooting / Repair',
    'solar-res': '☀️ Residential Solar System',
    'solar-com': '☀️ Commercial Solar System',
    'ev-res': '🔌 Residential EV Charger',
    'ev-com': '🔌 Commercial EV Station',
    'panel-upgrade': '⚡ Panel Upgrade',
    'rewire': '🏠 Whole-Home Rewire',
    'new-construction': '🏗️ New Construction',
    'commercial-buildout': '🏢 Commercial Build-Out',
    'other': '📋 Other'
};

// ── Bookings ──
function handleBooking(e) {
    e.preventDefault();
    const booking = {
        id: 'BK-' + String(Date.now()).slice(-5),
        service: serviceLabels[document.getElementById('bookService').value] || document.getElementById('bookService').value,
        date: document.getElementById('bookDate').value,
        time: document.getElementById('bookTime').value,
        address: document.getElementById('bookAddress').value,
        notes: document.getElementById('bookNotes').value,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };

    const bookings = getData('bookings');
    bookings.unshift(booking);
    setData('bookings', bookings);

    e.target.reset();
    showToast('Service booked successfully! We\'ll confirm shortly.');
    loadBookings();
    loadOverviewStats();
}

function loadBookings() {
    const container = document.getElementById('bookingsList');
    if (!container) return;
    const bookings = getData('bookings');

    if (bookings.length === 0) {
        container.innerHTML = '<div class="activity-empty">No bookings yet.</div>';
        return;
    }

    container.innerHTML = bookings.map(b => `
    <div class="list-item">
      <div class="list-item-icon">📅</div>
      <div class="list-item-info">
        <div class="list-item-title">${b.service}</div>
        <div class="list-item-meta">${new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${b.time} · ${b.address}</div>
      </div>
      <span class="list-item-badge badge-confirmed">Confirmed</span>
    </div>
  `).join('');
}

// ── Quotes ──
function handleQuote(e) {
    e.preventDefault();
    const quote = {
        id: 'QR-' + String(Date.now()).slice(-5),
        service: serviceLabels[document.getElementById('quoteService').value] || document.getElementById('quoteService').value,
        address: document.getElementById('quoteAddress').value,
        budget: document.getElementById('quoteBudget').value,
        timeline: document.getElementById('quoteTimeline').value,
        details: document.getElementById('quoteDetails').value,
        status: 'submitted',
        createdAt: new Date().toISOString()
    };

    const quotes = getData('quotes');
    quotes.unshift(quote);
    setData('quotes', quotes);

    e.target.reset();
    const fl = document.getElementById('fileList');
    if (fl) fl.innerHTML = '';
    showToast('Quote request submitted! We\'ll respond within 24 hours.');
    loadQuotes();
    loadOverviewStats();
}

function loadQuotes() {
    const container = document.getElementById('quotesList');
    if (!container) return;
    const quotes = getData('quotes');

    if (quotes.length === 0) {
        container.innerHTML = '<div class="activity-empty">No quote requests yet.</div>';
        return;
    }

    container.innerHTML = quotes.map(q => `
    <div class="list-item">
      <div class="list-item-icon">📝</div>
      <div class="list-item-info">
        <div class="list-item-title">${q.service}</div>
        <div class="list-item-meta">${q.address} · Submitted ${new Date(q.createdAt).toLocaleDateString()}</div>
      </div>
      <span class="list-item-badge badge-submitted">Submitted</span>
    </div>
  `).join('');
}

// ── File Upload (visual only) ──
function handleFileSelect(input) {
    const fl = document.getElementById('fileList');
    if (!fl) return;
    fl.innerHTML = '';
    Array.from(input.files).forEach((f, i) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `📎 ${f.name} <button onclick="this.parentElement.remove()">✕</button>`;
        fl.appendChild(item);
    });
}

// ── Invoices ──
let currentPaymentInvoice = null;

function loadInvoices() {
    const container = document.getElementById('invoicesList');
    if (!container) return;
    const invoices = getData('invoices');

    if (invoices.length === 0) {
        container.innerHTML = '<div class="activity-empty">No invoices found.</div>';
        return;
    }

    const outstanding = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
    const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

    const to = document.getElementById('totalOutstanding');
    const tp = document.getElementById('totalPaid');
    if (to) to.textContent = '$' + outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 });
    if (tp) tp.textContent = '$' + paid.toLocaleString('en-US', { minimumFractionDigits: 2 });

    container.innerHTML = invoices.map(inv => `
    <div class="invoice-card glass">
      <div class="invoice-id">${inv.id}</div>
      <div class="invoice-details">
        <div class="invoice-desc">${inv.description}</div>
        <div class="invoice-date">Due: ${new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      </div>
      <div class="invoice-amount">$${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
      <span class="invoice-status ${inv.status}">${inv.status}</span>
      <div class="invoice-action">
        ${inv.status === 'pending' || inv.status === 'overdue'
            ? `<button class="btn btn-amber btn-sm" onclick="openPayment('${inv.id}')">Pay Now</button>`
            : '<span style="font-size:var(--text-xs);color:var(--color-accent-green);">✓ Paid</span>'}
      </div>
    </div>
  `).join('');
}

function openPayment(invoiceId) {
    const invoices = getData('invoices');
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    currentPaymentInvoice = inv;
    document.getElementById('paymentInvoiceId').textContent = inv.id + ' — ' + inv.description;
    document.getElementById('paymentAmount').textContent = '$' + inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 });

    document.getElementById('modalBackdrop').classList.add('active');
    document.getElementById('paymentModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    document.getElementById('modalBackdrop').classList.remove('active');
    document.getElementById('paymentModal').classList.remove('active');
    document.body.style.overflow = '';
    currentPaymentInvoice = null;
}

function handlePayment(e) {
    e.preventDefault();
    if (!currentPaymentInvoice) return;

    const invoices = getData('invoices');
    const idx = invoices.findIndex(i => i.id === currentPaymentInvoice.id);
    if (idx !== -1) {
        invoices[idx].status = 'paid';
        invoices[idx].paidAt = new Date().toISOString();
        setData('invoices', invoices);
    }

    closePaymentModal();
    e.target.reset();
    showToast('Payment processed successfully!');
    loadInvoices();
    loadOverviewStats();
}

function formatCardNumber(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 16);
    input.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
    input.value = v;
}

// ── Settings ──
function handleSettings(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;

    const accounts = JSON.parse(localStorage.getItem('rimajin_accounts') || '[]');
    const idx = accounts.findIndex(a => a.email === user.email);

    const firstName = document.getElementById('settingsFirstName').value.trim();
    const lastName = document.getElementById('settingsLastName').value.trim();
    const phone = document.getElementById('settingsPhone').value.trim();

    if (idx !== -1) {
        accounts[idx].firstName = firstName;
        accounts[idx].lastName = lastName;
        accounts[idx].phone = phone;
        localStorage.setItem('rimajin_accounts', JSON.stringify(accounts));
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    localStorage.setItem('rimajin_user', JSON.stringify(user));

    showToast('Settings saved!');
    document.getElementById('dashUserName').textContent = firstName + ' ' + lastName;
    document.getElementById('dashAvatar').textContent = (firstName[0] + lastName[0]).toUpperCase();
    document.getElementById('welcomeName').textContent = firstName;
}

function deleteAccount() {
    if (!confirm('Are you sure? This will delete your account and all data. This cannot be undone.')) return;
    const user = getCurrentUser();
    if (!user) return;

    const prefix = `rimajin_${user.email}_`;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    keys.forEach(k => localStorage.removeItem(k));

    let accounts = JSON.parse(localStorage.getItem('rimajin_accounts') || '[]');
    accounts = accounts.filter(a => a.email !== user.email);
    localStorage.setItem('rimajin_accounts', JSON.stringify(accounts));

    localStorage.removeItem('rimajin_user');
    showToast('Account deleted');
    setTimeout(() => { window.location.href = 'index.html'; }, 500);
}

// Escape key closes payment modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePaymentModal();
});
