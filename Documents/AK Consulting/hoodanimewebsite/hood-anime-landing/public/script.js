/* ============================================
   HOOD ANIME - LANDING PAGE SCRIPTS
   Where Shonen Meets The Block
   ============================================ */

// Configuration
const CONFIG = {
    API_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : '/api', // Update this with your production API URL
    INITIAL_COUNTER: Math.floor(Math.random() * (1247 - 847 + 1)) + 847, // Random 847-1247
    TOTAL_SPOTS: 100,
    SPOTS_TAKEN: Math.floor(Math.random() * (35 - 20 + 1)) + 20, // Random 20-35 taken
};

// State
let waitlistCount = CONFIG.INITIAL_COUNTER;
let spotsRemaining = CONFIG.TOTAL_SPOTS - CONFIG.SPOTS_TAKEN;

// DOM Elements
const loader = document.getElementById('loader');
const successModal = document.getElementById('success-modal');
const alreadyModal = document.getElementById('already-modal');
const confettiContainer = document.getElementById('confetti');
const mobileMenu = document.getElementById('mobile-menu');

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initAOS();
    initParticles();
    initForms();
    initWaitlistCounter();
    initSpotsProgress();
    initNavbar();
    initLaunchDate();
});

// Loader
function initLoader() {
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 1800);
}

// AOS (Animate On Scroll)
function initAOS() {
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50,
        disable: window.innerWidth < 768 ? 'mobile' : false
    });
}

// ==========================================
// COUNTDOWN TIMER (DISABLED - ALREADY LAUNCHED)
// ==========================================
// Countdown functionality removed since site is now live

// ==========================================
// PARTICLE BACKGROUND
// ==========================================

function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.5 ? '#b829e0' : '#00d9ff';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width ||
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function createParticles() {
        const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Draw connections
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(184, 41, 224, ${0.1 * (1 - distance / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });

        animationId = requestAnimationFrame(animate);
    }

    resizeCanvas();
    createParticles();
    animate();

    window.addEventListener('resize', () => {
        resizeCanvas();
        createParticles();
    });

    // Pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
}

// ==========================================
// FORM HANDLING
// ==========================================

function initForms() {
    const forms = [
        { id: 'hero-form', emailId: 'hero-email' },
        { id: 'offer-form', emailId: 'offer-email' },
        { id: 'final-form', emailId: 'final-email' }
    ];

    forms.forEach(({ id, emailId }) => {
        const form = document.getElementById(id);
        if (form) {
            form.addEventListener('submit', (e) => handleFormSubmit(e, emailId));
        }
    });
}

async function handleFormSubmit(e, emailId) {
    e.preventDefault();

    const emailInput = document.getElementById(emailId);
    const button = e.target.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();

    // Validate email
    if (!isValidEmail(email)) {
        shakeElement(emailInput);
        showToast('Please enter a valid email address', 'error');
        return;
    }

    // Show loading state
    button.classList.add('loading');
    button.disabled = true;

    try {
        const response = await fetch(`${CONFIG.API_URL}/waitlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            // Success
            emailInput.value = '';
            incrementCounter();
            decrementSpots();
            showSuccessModal();
            createConfetti();
        } else if (response.status === 409) {
            // Already registered
            showAlreadyModal();
        } else {
            throw new Error(data.message || 'Something went wrong');
        }
    } catch (error) {
        console.error('Signup error:', error);

        // For demo purposes, show success anyway if API is not available
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            emailInput.value = '';
            incrementCounter();
            decrementSpots();
            showSuccessModal();
            createConfetti();
        } else {
            showToast(error.message || 'Something went wrong. Please try again.', 'error');
        }
    } finally {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function shakeElement(element) {
    element.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

// Add shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);

// ==========================================
// MODALS
// ==========================================

function showSuccessModal() {
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    successModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showAlreadyModal() {
    alreadyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAlreadyModal() {
    alreadyModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close modals on backdrop click
[successModal, alreadyModal].forEach(modal => {
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeAlreadyModal();
    }
});

// ==========================================
// CONFETTI
// ==========================================

function createConfetti() {
    if (!confettiContainer) return;

    confettiContainer.innerHTML = '';
    const colors = ['#b829e0', '#00d9ff', '#00ff88', '#ffaa00', '#ff6b6b'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confettiContainer.appendChild(confetti);
    }

    // Clean up after animation
    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 4000);
}

// ==========================================
// WAITLIST COUNTER (SOCIAL PROOF)
// ==========================================

function initWaitlistCounter() {
    updateCounterDisplay();

    // Simulate real-time signups
    simulateSignups();
}

function updateCounterDisplay() {
    const counters = document.querySelectorAll('#waitlist-counter, #hero-counter');
    counters.forEach(counter => {
        if (counter) {
            animateNumber(counter, waitlistCount);
        }
    });
}

function animateNumber(element, target) {
    const current = parseInt(element.textContent.replace(/,/g, '')) || 0;
    if (current === target) return;

    const duration = 500;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        const value = Math.floor(current + (target - current) * easeOutCubic(progress));
        element.textContent = value.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function simulateSignups() {
    // Random interval between 8-15 seconds
    const interval = Math.random() * (15000 - 8000) + 8000;

    setTimeout(() => {
        incrementCounter();
        simulateSignups(); // Continue the loop
    }, interval);
}

function incrementCounter() {
    waitlistCount++;
    updateCounterDisplay();
}

// ==========================================
// SPOTS PROGRESS
// ==========================================

function initSpotsProgress() {
    updateSpotsDisplay();
}

function updateSpotsDisplay() {
    const progressBar = document.getElementById('spots-progress');
    const spotsText = document.getElementById('spots-remaining');

    if (progressBar) {
        const percentage = ((CONFIG.TOTAL_SPOTS - spotsRemaining) / CONFIG.TOTAL_SPOTS) * 100;
        progressBar.style.width = `${percentage}%`;
    }

    if (spotsText) {
        spotsText.textContent = spotsRemaining;
    }
}

function decrementSpots() {
    if (spotsRemaining > 0) {
        spotsRemaining--;
        updateSpotsDisplay();
    }
}

// ==========================================
// NAVIGATION
// ==========================================

function initNavbar() {
    const navbar = document.querySelector('.navbar');

    // Scroll behavior
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80; // Navbar height
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');

    const btn = document.querySelector('.mobile-menu-btn');
    btn.classList.toggle('active');
}

// ==========================================
// FAQ ACCORDION
// ==========================================

function toggleFaq(button) {
    const item = button.parentElement;
    const isActive = item.classList.contains('active');

    // Close all other FAQs
    document.querySelectorAll('.faq-item').forEach(faq => {
        faq.classList.remove('active');
    });

    // Toggle current FAQ
    if (!isActive) {
        item.classList.add('active');
    }
}

// ==========================================
// LAUNCH DATE (DISABLED - ALREADY LAUNCHED)
// ==========================================

function initLaunchDate() {
    // Site is now live - no launch date needed
}

// ==========================================
// SHARE FUNCTIONS
// ==========================================

function shareTwitter() {
    const text = encodeURIComponent("I just joined the Hood Anime waitlist! Your favorite anime with hood energy. 🔥 Check it out:");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

function shareWhatsApp() {
    const text = encodeURIComponent("I just joined the Hood Anime waitlist! Your favorite anime with hood energy. 🔥 Check it out: " + window.location.href);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Link copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy link', 'error');
    });
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Add styles
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%) translateY(100px)',
        padding: '15px 30px',
        borderRadius: '10px',
        fontWeight: '600',
        fontSize: '0.9rem',
        zIndex: '10001',
        transition: 'transform 0.3s ease',
        background: type === 'success' ? '#00ff88' : type === 'error' ? '#ff6b6b' : '#00d9ff',
        color: '#1a0b2e',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
    });

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Remove after delay
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// ==========================================
// EXPOSE FUNCTIONS GLOBALLY
// ==========================================

window.toggleFaq = toggleFaq;
window.toggleMobileMenu = toggleMobileMenu;
window.closeModal = closeModal;
window.closeAlreadyModal = closeAlreadyModal;
window.shareTwitter = shareTwitter;
window.shareWhatsApp = shareWhatsApp;
window.copyLink = copyLink;
