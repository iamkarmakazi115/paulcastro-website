// ============================================
// js/home.js - Home Page Functionality
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Animate hero section on load
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.opacity = '0';
        heroSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            heroSection.style.transition = 'all 1s ease';
            heroSection.style.opacity = '1';
            heroSection.style.transform = 'translateY(0)';
        }, 100);
    }

    // Animate stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }, 300 + (index * 100));
    });

    // Add hover effect to featured cards
    const featuredCards = document.querySelectorAll('.featured-card');
    featuredCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Typewriter effect for hero text
    const heroText = document.querySelector('.hero-text');
    if (heroText) {
        const text = heroText.textContent;
        heroText.textContent = '';
        let index = 0;
        
        const typeWriter = () => {
            if (index < text.length) {
                heroText.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, 20);
            }
        };
        
        setTimeout(typeWriter, 1000);
    }
});