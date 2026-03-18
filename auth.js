/* ============================================
   RIMAJIN — Authentication Logic
   ============================================ */

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validate
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Check stored accounts
    const accounts = JSON.parse(localStorage.getItem('rimajin_accounts') || '[]');
    const account = accounts.find(a => a.email === email);

    if (!account) {
        showToast('No account found with that email', 'error');
        return;
    }

    if (account.password !== password) {
        showToast('Incorrect password', 'error');
        return;
    }

    // Login success
    const userData = {
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        phone: account.phone,
        loginTime: new Date().toISOString()
    };

    localStorage.setItem('rimajin_user', JSON.stringify(userData));

    // Initialize user data stores if they don't exist
    initUserData(email);

    closeModal();
    showToast(`Welcome back, ${account.firstName}!`);

    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 800);
}

function handleRegister(e) {
    e.preventDefault();

    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;

    // Validate
    if (!firstName || !lastName || !email || !password) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }

    // Check for existing account
    const accounts = JSON.parse(localStorage.getItem('rimajin_accounts') || '[]');
    if (accounts.find(a => a.email === email)) {
        showToast('An account with that email already exists', 'error');
        return;
    }

    // Create account
    const newAccount = {
        firstName,
        lastName,
        email,
        phone,
        password,
        createdAt: new Date().toISOString()
    };

    accounts.push(newAccount);
    localStorage.setItem('rimajin_accounts', JSON.stringify(accounts));

    // Auto-login
    const userData = {
        firstName,
        lastName,
        email,
        phone,
        loginTime: new Date().toISOString()
    };

    localStorage.setItem('rimajin_user', JSON.stringify(userData));

    // Initialize user data stores
    initUserData(email);

    closeModal();
    showToast('Account created successfully!');

    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 800);
}

function initUserData(email) {
    const prefix = `rimajin_${email}_`;

    // Initialize bookings if not exists
    if (!localStorage.getItem(prefix + 'bookings')) {
        localStorage.setItem(prefix + 'bookings', JSON.stringify([]));
    }

    // Initialize quotes if not exists
    if (!localStorage.getItem(prefix + 'quotes')) {
        localStorage.setItem(prefix + 'quotes', JSON.stringify([]));
    }

    // Initialize invoices with sample data if not exists
    if (!localStorage.getItem(prefix + 'invoices')) {
        const sampleInvoices = [
            {
                id: 'INV-001',
                date: '2026-01-15',
                dueDate: '2026-02-15',
                description: 'Panel Upgrade — 200A Service',
                amount: 3200.00,
                status: 'pending'
            },
            {
                id: 'INV-002',
                date: '2025-12-10',
                dueDate: '2026-01-10',
                description: 'EV Charger Installation — Level 2',
                amount: 1850.00,
                status: 'paid'
            }
        ];
        localStorage.setItem(prefix + 'invoices', JSON.stringify(sampleInvoices));
    }
}
