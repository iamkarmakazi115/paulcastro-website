// Books data and loading functionality

const booksData = [
    {
        title: "Blood Howls",
        subtitle: "When ancient blood awakens, the hunt begins.",
        description: "Kael Thorne's twenty-fifth birthday was supposed to be ordinary—dinner with family, maybe a call from his sister. Instead, it becomes the night his parents die and a supernatural assassin called the Hunter comes to claim what flows in his veins. As the last descendant of the Progenitor, Kael must master the beast within while forging unlikely alliances to face an army of horrors."
    },
    {
        title: "Forgotten Son",
        subtitle: "When the dead whisper warnings, a god's son must choose between love and cosmic order.",
        description: "Christos Thanatos has spent twenty-six years hiding in plain sight—working security jobs and pretending the voices of the dead are just background noise. The son of Hades should be ruling the underworld, but he's chosen the mortal world instead. When Elena is kidnapped, Christos must decide what kind of god he's willing to become."
    },
    {
        title: "Out of Time",
        subtitle: "When a prince is murdered and hung like a scarecrow, the killer leaves behind more than a corpse.",
        description: "Cael Ward Corbin has spent years hiding what he is: a memory-binder caught between the Seelie and Unseelie Courts. When Prince Alarion is found crucified with the forbidden sigil of the Outriders, Cael's investigation unearths a conspiracy that reaches into the heart of his own buried past."
    },
    {
        title: "Which Way the Wind Blows",
        subtitle: "In the shadows between light and darkness, a bastard prince must choose his crown.",
        description: "When Veraden—son of the ruthless Queen Mab—rescues Lord Calendreth from an Unseelie dungeon, he triggers a war that will shatter the ancient balance between the courts. Raised in secret by a shapeshifting Glamourling, Veraden leads a desperate resistance from the ashes of the fallen court."
    },
    {
        title: "The Descent - Book 1",
        subtitle: "Born from fire and hidden in shadow, Lucien Graves never knew he was heir to a throne built on blood.",
        description: "Bartending in the vampire-owned clubs of Kharvas, Lucien lives quietly until ancient relics begin awakening in his presence. When he discovers his true identity as the son of murdered vampire royalty, he's thrust into a war that has been brewing since the fall of the old kingdom."
    },
    {
        title: "The Descent: Ash Reborn - Book 2",
        subtitle: "The fire within him was never meant to be carried by the living.",
        description: "Lucien Thorne awakens to a terrible truth—he died, and the Sixth Relic brought him back. Now he must confront the Council's final weapons while discovering that he is no longer merely a relic-bearer, but a living artifact himself."
    }
];

// Make loadBooks function available globally
function loadBooks() {
    console.log('loadBooks function called');
    const worksGrid = document.querySelector('.works-grid');
    
    if (!worksGrid) {
        console.error('Works grid element not found');
        return;
    }
    
    console.log('Found works grid, loading', booksData.length, 'books');
    
    worksGrid.innerHTML = booksData.map(book => `
        <div class="book-card">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-subtitle">${book.subtitle}</p>
            <p class="book-description">${book.description}</p>
        </div>
    `).join('');
    
    console.log('Books HTML inserted, adding animations');
    
    // Add animation to cards as they appear
    const cards = document.querySelectorAll('.book-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'fadeInUp 0.5s ease forwards';
            card.style.opacity = '1';
        }, index * 100);
    });
    
    console.log('Book loading complete, found', cards.length, 'book cards');
}

// Ensure the function is available globally
window.loadBooks = loadBooks;

// Add CSS animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .book-card {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
`;
document.head.appendChild(style);

// Auto-load books if we're on the works page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Books.js DOM loaded, checking for works page');
    
    // Check if we're on works page and it's active
    const worksPage = document.getElementById('works');
    if (worksPage && worksPage.classList.contains('active')) {
        console.log('Works page is active, loading books immediately');
        loadBooks();
    }
});

console.log('Books.js loaded successfully');