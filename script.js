document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();

    initScrollAnimations();

    initNavigation();

    initFaqToggle();

    initMobileMenu();

    initSmoothScroll();
});

function initDragAndDrop() {
    const cards = document.querySelectorAll('.card:not(.add-card)');
    const columns = document.querySelectorAll('.day-column');
    const addButtons = document.querySelectorAll('.add-card');

    cards.forEach(card => {
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);
    });

    columns.forEach(column => {
        column.addEventListener('dragover', dragOver);
        column.addEventListener('dragenter', dragEnter);
        column.addEventListener('dragleave', dragLeave);
        column.addEventListener('drop', drop);
    });

    addButtons.forEach(button => {
        button.addEventListener('click', addNewCard);
    });
}

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
    showNotification('Itinerary updated successfully!');
}

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

function addNewCard() {

    const column = this.closest('.day-column');
    createAddActivityModal(column);
}

function createAddActivityModal(column) {

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

        if (timeInput.value && activityInput.value) {
            addCardToColumn(column, timeInput.value, activityInput.value);
            document.body.removeChild(modal);
            showNotification('New activity added!');
        } else {
            showNotification('Please fill in all fields', 'error');
        }
    });

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(addButton);
    
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(timeInput);
    modalContent.appendChild(activityInput);
    modalContent.appendChild(buttonContainer);
    
    modal.appendChild(modalContent);

    timeInput.focus();

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function addCardToColumn(column, time, activity) {
    const timeObj = new Date(`2000-01-01T${time}`);
    const formattedTime = timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    const newCard = document.createElement('div');
    newCard.className = 'card';
    newCard.draggable = true;
    newCard.innerHTML = `
        <div class="card-time">${formattedTime}</div>
        <div class="card-title">${activity}</div>
    `;
 
    newCard.addEventListener('dragstart', dragStart);
    newCard.addEventListener('dragend', dragEnd);

    newCard.classList.add('new-card-animation');

    const addCard = column.querySelector('.add-card');
    column.insertBefore(newCard, addCard);

    setTimeout(() => {
        newCard.classList.remove('new-card-animation');
    }, 500);
}

function showNotification(message, type = 'success') {

    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    notification.classList.remove('success', 'error', 'info', 'warning');

    notification.classList.add(type, 'show');
    notification.innerHTML = `
        <div class="notification-icon">
            ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
              type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : 
              type === 'warning' ? '<i class="fas fa-exclamation-triangle"></i>' : 
              '<i class="fas fa-info-circle"></i>'}
        </div>
        <div class="notification-message">${message}</div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.classList.remove('show');
    });

    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

function initScrollAnimations() {

    const elements = [
        ...document.querySelectorAll('.feature-card'),
        ...document.querySelectorAll('.pricing-card'),
        ...document.querySelectorAll('.testimonial'),
        ...document.querySelectorAll('.faq-item'),
        ...document.querySelectorAll('.section-header')
    ];
    
    elements.forEach(element => {
        element.classList.add('animate-on-scroll');
    });

    checkForVisibleElements();
    window.addEventListener('scroll', checkForVisibleElements);
}

function checkForVisibleElements() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
        if (isInViewport(element)) {
            element.classList.add('visible');
        }
    });
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
        rect.bottom >= 0
    );
}

function initNavigation() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    updateActiveNavLinks();
    window.addEventListener('scroll', updateActiveNavLinks);
}

function updateActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
 
            navLinks.forEach(link => {
                link.classList.remove('active');
            });

            const correspondingLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
            if (correspondingLink) {
                correspondingLink.classList.add('active');
            }
        }
    });
}

function initFaqToggle() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {

            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            item.classList.toggle('active');
        });
    });

    if (faqItems.length > 0) {
        faqItems[0].classList.add('active');
    }
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('mobile-menu-open');
        });
    }
}

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const nav = document.querySelector('nav');
                if (nav.classList.contains('mobile-menu-open')) {
                    nav.classList.remove('mobile-menu-open');
                }

                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

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

// Feedback Form
const feedbackForm = document.getElementById("feedbackForm");
const feedbackBtn = document.getElementById("feedbackBtn");
const thankYouBox = document.getElementById("thankYouBox");

function toggleForm() {
  feedbackForm.style.display = "block";
  feedbackBtn.style.display = "none";
}

function closeForm() {
  feedbackForm.style.display = "none";
  feedbackBtn.style.display = "block";
}

function submitFeedback(e) {
  e.preventDefault();
  feedbackForm.style.display = "none";
  feedbackForm.querySelector("textarea").value = "";
  thankYouBox.style.display = "block";

  setTimeout(() => {
    thankYouBox.style.display = "none";
    feedbackBtn.style.display = "block";
  }, 4000);
}
