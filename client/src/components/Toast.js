const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    
    // Create toast container
    toast.className = 'toast-container';
    
    // Create inner content with icon and message
    toast.innerHTML = `
        <div class="toast-content">
            <svg class="toast-icon" viewBox="0 0 24 24">
                ${type === 'success' 
                    ? '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>'
                    : '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>'
                }
            </svg>
            <span class="toast-message">${message}</span>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .toast-container {
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 9999;
            animation: slideIn 0.3s ease forwards;
        }

        .toast-content {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#6200ee' : '#dc3545'};
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            color: white;
            font-weight: 500;
        }

        .toast-icon {
            width: 24px;
            height: 24px;
            fill: currentColor;
        }

        .toast-message {
            font-size: 0.95rem;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(toast);

    // Animate out before removing
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
            style.remove();
        }, 300);
    }, 3000);
};

export default showToast;