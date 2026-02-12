/**
 * Talio Website - Component Loader
 * Loads shared header and footer components across all pages
 * Handles relative paths automatically based on page depth
 */

// Determine base URL based on current page location
function getBaseUrl() {
    const path = window.location.pathname;
    const depth = path.split('/').filter(p => p && !p.includes('.html')).length;
    
    // Check if we're in a subdirectory
    if (depth === 0 || path.endsWith('index.html') && !path.includes('/')) {
        return '';
    }
    
    // For pages in subdirectories (about/, features/, etc.)
    return '../'.repeat(depth);
}

// Replace placeholder URLs with correct relative paths
function fixRelativePaths(html, baseUrl) {
    return html.replace(/\{\{BASE_URL\}\}/g, baseUrl);
}

document.addEventListener('DOMContentLoaded', function() {
    const baseUrl = getBaseUrl();
    const componentsPath = baseUrl + 'components/';
    
    // Load Header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch(componentsPath + 'header.html')
            .then(response => response.text())
            .then(html => {
                headerPlaceholder.innerHTML = fixRelativePaths(html, baseUrl);
                initNavigation();
                highlightCurrentPage();
            })
            .catch(err => console.error('Error loading header:', err));
    }

    // Load Footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch(componentsPath + 'footer.html')
            .then(response => response.text())
            .then(html => {
                footerPlaceholder.innerHTML = fixRelativePaths(html, baseUrl);
            })
            .catch(err => console.error('Error loading footer:', err));
    }
});

// Initialize Navigation
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Initialize mobile sidebar
    initMobileSidebar();
}

// Initialize Mobile Sidebar
function initMobileSidebar() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const sidebarClose = document.getElementById('sidebarClose');
    const featuresMenuBtn = document.getElementById('featuresMenuBtn');
    const featuresBackBtn = document.getElementById('featuresBackBtn');
    const sidebarMain = document.getElementById('sidebarMain');
    const sidebarFeatures = document.getElementById('sidebarFeatures');
    
    if (!mobileSidebar) return;
    
    // Store scroll position
    let scrollPosition = 0;
    
    // Open sidebar
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            // Save scroll position before locking
            scrollPosition = window.pageYOffset;
            document.body.style.top = `-${scrollPosition}px`;
            
            mobileSidebar.classList.add('active');
            mobileMenuBtn.classList.add('active');
            document.body.classList.add('sidebar-open');
            document.documentElement.classList.add('sidebar-open');
        });
    }
    
    // Close sidebar
    function closeSidebar() {
        mobileSidebar.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.classList.remove('sidebar-open');
        document.documentElement.classList.remove('sidebar-open');
        
        // Restore scroll position
        document.body.style.top = '';
        window.scrollTo(0, scrollPosition);
        
        // Reset to main menu and remove submenu-active class
        const sidebarPanel = document.querySelector('.sidebar-panel');
        setTimeout(() => {
            if (sidebarFeatures) sidebarFeatures.classList.remove('active');
            if (sidebarPanel) sidebarPanel.classList.remove('submenu-active');
        }, 300);
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }
    
    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', closeSidebar);
    }
    
    // Features submenu
    if (featuresMenuBtn && sidebarFeatures) {
        featuresMenuBtn.addEventListener('click', () => {
            sidebarFeatures.classList.add('active');
            // Add class to panel for CSS fallback (hide main menu)
            const sidebarPanel = document.querySelector('.sidebar-panel');
            if (sidebarPanel) sidebarPanel.classList.add('submenu-active');
        });
    }
    
    if (featuresBackBtn && sidebarFeatures) {
        featuresBackBtn.addEventListener('click', () => {
            sidebarFeatures.classList.remove('active');
            // Remove class from panel
            const sidebarPanel = document.querySelector('.sidebar-panel');
            if (sidebarPanel) sidebarPanel.classList.remove('submenu-active');
        });
    }
    
    // Close sidebar on link click
    const sidebarLinks = mobileSidebar.querySelectorAll('.sidebar-link:not(.has-submenu)');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', closeSidebar);
    });
}

// Highlight current page in navigation
function highlightCurrentPage() {
    const path = window.location.pathname;
    const currentPage = path === '/' ? '/' : '/' + path.split('/').filter(Boolean)[0];
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href === currentPage || href.startsWith(currentPage + '#') || (currentPage === '/' && href === '/'))) {
            link.classList.add('active');
        }
    });
}

// Disable AOS - use simple page fade instead
// if (typeof AOS !== 'undefined') {
//     AOS.init({
//         duration: 800,
//         easing: 'ease-out-cubic',
//         once: true,
//         offset: 50
//     });
// }

// FAQ Accordion functionality
document.addEventListener('click', function(e) {
    const faqQuestion = e.target.closest('.faq-question');
    if (faqQuestion) {
        e.preventDefault();
        const faqItem = faqQuestion.closest('.faq-item');
        if (!faqItem) return;
        
        const isActive = faqItem.classList.contains('active');
        
        // Close all other FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Toggle clicked item
        if (!isActive) {
            faqItem.classList.add('active');
        }
    }
});

// Copy code block functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('copy-btn')) {
        const codeBlock = e.target.closest('.code-block');
        const code = codeBlock.querySelector('code').textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            e.target.textContent = 'Copied!';
            setTimeout(() => {
                e.target.textContent = 'Copy';
            }, 2000);
        });
    }
});

// Form submission handling
document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.classList.contains('contact-form') || form.classList.contains('partner-form')) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Save lead to localStorage
        saveLead(data);
        
        // Show success message
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = '#22C55E';
            form.reset();
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }, 1000);
    }
    
    // Handle lead form (multi-step form)
    if (form.classList.contains('lead-form')) {
        e.preventDefault();
        handleLeadFormSubmit(form);
    }
});

// Lead form multi-step handling
function initLeadForm() {
    const nextBtn = document.getElementById('nextStep');
    const prevBtn = document.getElementById('prevStep');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    
    if (nextBtn && step1 && step2) {
        nextBtn.addEventListener('click', function() {
            // Validate step 1 fields
            const firstName = document.getElementById('firstName');
            const lastName = document.getElementById('lastName');
            const email = document.getElementById('email');
            const jobTitle = document.getElementById('jobTitle');
            
            if (!firstName.value || !lastName.value || !email.value || !jobTitle.value) {
                alert('Please fill in all required fields.');
                return;
            }
            
            if (!isValidEmail(email.value)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            step1.classList.remove('active');
            step2.classList.add('active');
        });
    }
    
    if (prevBtn && step1 && step2) {
        prevBtn.addEventListener('click', function() {
            step2.classList.remove('active');
            step1.classList.add('active');
        });
    }
}

function handleLeadFormSubmit(form) {
    const formData = {
        firstName: document.getElementById('firstName')?.value || '',
        lastName: document.getElementById('lastName')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        jobTitle: document.getElementById('jobTitle')?.value || '',
        companyName: document.getElementById('companyName')?.value || '',
        industry: document.getElementById('industry')?.value || '',
        companySize: document.getElementById('companySize')?.value || '',
        message: document.getElementById('message')?.value || '',
        source: window.location.pathname,
        submittedAt: new Date().toISOString()
    };
    
    const submitBtn = document.getElementById('submitForm');
    const step2 = document.getElementById('step2');
    const formSuccess = document.getElementById('formSuccess');
    
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
    }
    
    // Save lead to localStorage
    saveLead(formData);
    
    setTimeout(() => {
        if (step2) step2.classList.remove('active');
        if (formSuccess) formSuccess.classList.add('active');
    }, 1000);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function saveLead(lead) {
    try {
        let leads = JSON.parse(localStorage.getItem('talio_leads') || '[]');
        lead.id = Date.now();
        leads.push(lead);
        localStorage.setItem('talio_leads', JSON.stringify(leads));
        console.log('Lead saved successfully:', lead);
        return true;
    } catch (error) {
        console.error('Error saving lead:', error);
        return false;
    }
}

// Initialize lead form when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initLeadForm, 500);
});

// Smooth scroll for anchor links
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        const targetId = link.getAttribute('href');
        if (targetId !== '#') {
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }
});

// Add scroll animations to elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});
