// ============================================
// js/works.js - Works Page Functionality
// ============================================

// Toggle book details expansion
function toggleBookDetails(bookId) {
    const bookCard = document.querySelector(`[data-book="${bookId}"]`);
    const description = bookCard.querySelector('.book-description');
    const button = bookCard.querySelector('.expand-btn');
    
    description.classList.toggle('expanded');
    button.classList.toggle('expanded');
    
    if (description.classList.contains('expanded')) {
        button.innerHTML = '<i class="fas fa-chevron-up"></i> Read Less';
    } else {
        button.innerHTML = '<i class="fas fa-chevron-down"></i> Read More';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Add hover effect to book cards
    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Animate books on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.book-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
});