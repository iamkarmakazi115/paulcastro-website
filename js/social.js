// ============================================
// js/social.js - Social Page Functionality
// ============================================

// Handle newsletter subscription
async function handleNewsletter(event) {
    event.preventDefault();
    
    const email = document.getElementById('newsletterEmail').value;
    
    // In a real implementation, this would send to your backend
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        utils.showNotification('Successfully subscribed to newsletter!', 'success');
        document.getElementById('newsletterForm').reset();
    } catch (error) {
        utils.showNotification('Failed to subscribe. Please try again.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Facebook SDK
    window.fbAsyncInit = function() {
        FB.init({
            appId: '765276006127261', // Replace with your Facebook App ID
            xfbml: true,
            version: 'v18.0'
        });
        
        FB.XFBML.parse();
    };

    // Animate social stats
    const animateValue = (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.textContent = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // Simulate some stats animation
    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.animated) {
                entry.target.animated = true;
                // Add animation logic here if needed
            }
        });
    }, observerOptions);

    document.querySelectorAll('.stat-card').forEach(card => {
        observer.observe(card);
    });

    // Rotate through writing tips
    const tips = [
        "Every character believes they're the hero of their own story. Write them that way, and your villains become unforgettable.",
        "The best plot twists are the ones that feel inevitable in hindsight.",
        "World-building is like an iceberg—show 10%, imply 90%.",
        "Dialogue should do double duty: reveal character AND advance the plot.",
        "The first draft is just you telling yourself the story."
    ];

    let currentTip = 0;
    const tipsCard = document.querySelector('.tips-card blockquote');
    
    if (tipsCard) {
        setInterval(() => {
            currentTip = (currentTip + 1) % tips.length;
            tipsCard.style.opacity = '0';
            setTimeout(() => {
                tipsCard.textContent = `"${tips[currentTip]}"`;
                tipsCard.style.opacity = '1';
            }, 500);
        }, 10000); // Change tip every 10 seconds
    }
});