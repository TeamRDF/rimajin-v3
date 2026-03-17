document.addEventListener("DOMContentLoaded", () => {
    // Subtle kinetic scale/fade animation on scroll
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.15 // Trigger earlier to accommodate taller sections
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-scale');
    fadeElements.forEach(el => observer.observe(el));
});