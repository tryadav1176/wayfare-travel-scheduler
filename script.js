// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize drag and drop for itinerary cards
    initDragAndDrop();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize navigation effects
    initNavigation();
});

// Function to handle drag and drop functionality
function initDragAndDrop() {
    const cards = document.querySelectorAll('.card:not(.add-card)');
    const columns = document.querySelectorAll('.day-column');
    const addButtons = document.querySelectorAll('.add-card');
    
    // Initialize draggable cards
    cards.forEach(card => {
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);
    });
    
    // Initialize drop zones
    columns.forEach(column => {
        column.addEventListener('dragover', dragOver);
        column.addEventListener('dragenter', dragEnter);
        column.addEventListener('dragleave', dragLeave);
        column.addEventListener('drop', drop);
    });
    
    // Initialize add card buttons
    addButtons.forEach(button => {
        button.addEventListener('click', addNewCard);
    });
}

// Drag and drop functions
function dragStart() {
    this.classList.add('dragging');
    setTimeout(() => this.classList.add('drag-ghost'), 0);
}

function dragEnd() {
    this.classList.remove('dragging', 'drag-ghost');
}

function dragOver(e) {
    e.preventDefault();
    const afterElement = getDragAfterElement(this, e.clientY);
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
        // If no element is below the cursor, append to end (before add card)
        const addCard = this.querySelector('.add-card');
        if (addCard) {
            this.insertBefore(draggable, addCard);
        } else {
            this.appendChild(draggable);
        }
    } else {
        this.insertBefore(draggable, afterElement);
    }
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function dragLeave() {
    this.classList.remove('drag-over');
}

function drop() {
    this.classList.remove('drag-over');
    
    // You would typically save the new arrangement to a database here
    // For demo, just show a message
    showNotification('Itinerary updated successfully!');
}

// Helper to determine where to drop the card
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.card:not(.dragging):not(.add-card)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Function to add a new card
function addNewCard() {
    // Get the column where the add button was clicked
    const column = this.closest('.day-column');
    
    // Create a modal for adding a new activity
    createAddActivityModal(column);
}

// Create a modal for adding an activity
function createAddActivityModal(column) {
    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'activity-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = 'Add New Activity';
    
    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.className = 'time-input';
    timeInput.placeholder = 'Time';
    
    const activityInput = document.createElement('input');
    activityInput.type = 'text';
    activityInput.className = 'activity-input';
    activityInput.placeholder = 'Activity Description';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn-secondary';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    const addButton = document.createElement('button');
    addButton.className = 'btn-primary';
    addButton.textContent = 'Add Activity';
    addButton.addEventListener('click', () => {
        // Validate inputs
        if (timeInput.value && activityInput.value) {
            // Create and add the new card
            addCardToColumn(column, timeInput.value, activityInput.value);
            // Close modal
            document.body.removeChild(modal);
            // Show success message
            showNotification('New activity added!');
        } else {
            // Show error
            showNotification('Please fill in all fields', 'error');
        }
    });
    
    // Assemble modal
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(addButton);
    
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(timeInput);
    modalContent.appendChild(activityInput);
    modalContent.appendChild(buttonContainer);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Focus the first input
    timeInput.focus();
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Add a new card to a column
function addCardToColumn(column, time, activity) {
    // Convert 24h time to 12h format with AM/PM
    const timeObj = new Date(`2000-01-01T${time}`);
    const formattedTime = timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
    
    // Create new card
    const newCard = document.createElement('div');
    newCard.className = 'card';
    newCard.draggable = true;
    newCard.innerHTML = `
        <div class="card-time">${formattedTime}</div>
        <div class="card-title">${activity}</div>
    `;
    
    // Add event listeners
    newCard.addEventListener('dragstart', dragStart);
    newCard.addEventListener('dragend', dragEnd);
    
    // Add animation class
    newCard.classList.add('new-card-animation');
    
    // Insert before the add card button
    const addCard = column.querySelector('.add-card');
    column.insertBefore(newCard, addCard);
    
    // Remove animation class after animation completes
    setTimeout(() => {
        newCard.classList.remove('new-card-animation');
    }, 500);
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Function to initialize scroll animations
function initScrollAnimations() {
    // Add animation classes to elements
    const sections = document.querySelectorAll('section:not(.hero)');
    sections.forEach(section => {
        section.classList.add('animate-on-scroll');
    });
    
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.classList.add('animate-on-scroll');
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    const testimonials = document.querySelectorAll('.testimonial');
    testimonials.forEach((testimonial, index) => {
        testimonial.classList.add('animate-on-scroll');
        testimonial.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Check for elements in viewport on scroll
    checkForVisibleElements();
    window.addEventListener('scroll', checkForVisibleElements);
}

// Check for elements that should be animated when visible
function checkForVisibleElements() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
        if (isInViewport(element)) {
            element.classList.add('visible');
        }
    });
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
        rect.bottom >= 0
    );
}

// Navigation effects
function initNavigation() {
    const header = document.querySelector('header');
    const heroSection = document.querySelector('.hero');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Add some parallax effect to hero background
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        if (scrollPosition <= heroSection.offsetHeight) {
            const planeElement = document.querySelector('.plane');
            const cloud1Element = document.querySelector('.cloud1');
            const cloud2Element = document.querySelector('.cloud2');
            
            if (planeElement) planeElement.style.transform = `translateY(${scrollPosition * 0.2}px)`;
            if (cloud1Element) cloud1Element.style.transform = `translateX(${scrollPosition * 0.1}px)`;
            if (cloud2Element) cloud2Element.style.transform = `translateX(-${scrollPosition * 0.15}px)`;
        }
    });
    
    // Demo button click handler
    const demoButton = document.querySelector('.btn-secondary');
    if (demoButton) {
        demoButton.addEventListener('click', () => {
            // For demo, just scroll to the board
            const board = document.querySelector('.itinerary-board');
            if (board) {
                board.classList.add('highlight-animation');
                setTimeout(() => {
                    board.classList.remove('highlight-animation');
                }, 1500);
                
                window.scrollTo({
                    top: board.getBoundingClientRect().top + window.scrollY - 100,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// Add CSS for additional elements created by JavaScript
const style = document.createElement('style');
style.textContent = `
    /* Modal Styles */
    .activity-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1100;
        opacity: 0;
        animation: fadeIn 0.3s forwards;
    }
    
    @keyframes fadeIn {
        to { opacity: 1; }
    }
    
    .modal-content {
        background-color: white;
        border-radius: 12px;
        padding: 30px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        transform: translateY(20px);
        animation: slideUp 0.3s forwards;
    }
    
    @keyframes slideUp {
        to { transform: translateY(0); }
    }
    
    .modal-content h3 {
        margin-bottom: 20px;
        color: var(--dark);
    }
    
    .time-input, .activity-input {
        width: 100%;
        padding: 12px 15px;
        margin-bottom: 15px;
        border: 1px solid var(--light-gray);
        border-radius: 8px;
        font-family: 'Poppins', sans-serif;
        font-size: 1rem;
    }
    
    .time-input:focus, .activity-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(74, 107, 255, 0.2);
    }
    
    .modal-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    }
    
    /* Notification Styles */
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        transform: translateY(100px);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        z-index: 1200;
    }
    
    .notification.success {
        background-color: #4caf50;
    }
    
    .notification.error {
        background-color: #f44336;
    }
    
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    /* Card Animation */
    .new-card-animation {
        animation: addCard 0.5s ease-out;
    }
    
    @keyframes addCard {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Dragging States */
    .drag-ghost {
        opacity: 0.5;
    }
    
    .drag-over {
        background-color: rgba(74, 107, 255, 0.05);
    }
    
    /* Header Scroll Effect */
    header.scrolled {
        padding: 15px 0;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    }
    
    /* Board Highlight Animation */
    .highlight-animation {
        animation: highlightBoard 1.5s ease;
    }
    
    @keyframes highlightBoard {
        0%, 100% {
            box-shadow: var(--card-shadow);
        }
        50% {
            box-shadow: 0 0 0 5px rgba(74, 107, 255, 0.3), 0 15px 45px rgba(74, 107, 255, 0.4);
        }
    }
`;

document.head.appendChild(style); 