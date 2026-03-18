/* ============================================
   RIMAJIN — Core Application Logic
   ============================================ */

// ── Nav Scroll Effect ──
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ── Mobile Nav Toggle ──
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navMobile.classList.toggle('open');
    document.body.style.overflow = navMobile.classList.contains('open') ? 'hidden' : '';
  });
}

// ── Scroll Reveal ──
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ── Testimonials Scroll ──
function scrollTestimonials(direction) {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;
  const cardWidth = track.querySelector('.testimonial-card')?.offsetWidth || 400;
  track.scrollBy({
    left: direction * (cardWidth + 24),
    behavior: 'smooth'
  });
}

// ── Modal System ──
function openModal(type) {
  // Close mobile nav if open
  if (navMobile && navMobile.classList.contains('open')) {
    navToggle.classList.remove('open');
    navMobile.classList.remove('open');
    document.body.style.overflow = '';
  }

  const backdrop = document.getElementById('modalBackdrop');
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');

  backdrop.classList.add('active');

  if (type === 'login') {
    loginModal.classList.add('active');
    registerModal.classList.remove('active');
  } else {
    registerModal.classList.add('active');
    loginModal.classList.remove('active');
  }

  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('active');
  document.getElementById('loginModal')?.classList.remove('active');
  document.getElementById('registerModal')?.classList.remove('active');
  document.body.style.overflow = '';
}

function switchModal(type) {
  if (type === 'login') {
    document.getElementById('registerModal').classList.remove('active');
    document.getElementById('loginModal').classList.add('active');
  } else {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('registerModal').classList.add('active');
  }
}

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ── Toast Notifications ──
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${type === 'success' ? '✓' : '✕'} ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

// ── Auth State ──
function isLoggedIn() {
  return localStorage.getItem('rimajin_user') !== null;
}

function getCurrentUser() {
  const data = localStorage.getItem('rimajin_user');
  return data ? JSON.parse(data) : null;
}

function updateNavForAuth() {
  const user = getCurrentUser();
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  if (user && loginBtn && registerBtn) {
    loginBtn.textContent = 'Dashboard';
    loginBtn.onclick = () => { window.location.href = 'dashboard.html'; };
    registerBtn.textContent = user.firstName;
    registerBtn.onclick = handleLogout;
    registerBtn.className = 'btn btn-amber btn-sm';
  }
}

function handleLogout() {
  localStorage.removeItem('rimajin_user');
  showToast('Logged out successfully');
  setTimeout(() => window.location.reload(), 500);
}

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', updateNavForAuth);

// ── Active Nav Link ──
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', setActiveNavLink);
