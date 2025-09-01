// ============================================
// js/about.js - About Page Functionality
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Animate timeline items on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, observerOptions);

    // Observe timeline items
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'all 0.5s ease';
        observer.observe(item);
    });

    // Animate skill cards on hover
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('i').style.transform = 'rotateY(360deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.querySelector('i').style.transform = 'rotateY(0)';
        });
    });

    // Add transition to skill icons
    document.querySelectorAll('.skill-card i').forEach(icon => {
        icon.style.transition = 'transform 0.6s ease';
    });
});