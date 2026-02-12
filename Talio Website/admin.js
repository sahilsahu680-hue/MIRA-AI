/* ============================================
   TALIO ADMIN PANEL - JAVASCRIPT
   ============================================ */

// Admin password (hardcoded as requested)
const ADMIN_PASSWORD = 'Admin@login2025';

// Current lead for modal
let currentLeadId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initLogin();
    initFilters();
    initSearch();
    checkSession();
});

/* ============================================
   LOGIN FUNCTIONALITY
   ============================================ */
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const errorMessage = document.getElementById('errorMessage');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.innerHTML = type === 'password' 
            ? '<i class="fas fa-eye"></i>' 
            : '<i class="fas fa-eye-slash"></i>';
    });

    // Handle login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const enteredPassword = passwordInput.value;
        
        if (enteredPassword === ADMIN_PASSWORD) {
            // Success - store session
            sessionStorage.setItem('talio_admin_auth', 'true');
            showDashboard();
        } else {
            // Error
            passwordInput.classList.add('error');
            errorMessage.classList.add('visible');
            
            // Clear error after 3 seconds
            setTimeout(() => {
                passwordInput.classList.remove('error');
                errorMessage.classList.remove('visible');
            }, 3000);
        }
    });

    // Clear error on input
    passwordInput.addEventListener('input', () => {
        passwordInput.classList.remove('error');
        errorMessage.classList.remove('visible');
    });
}

function checkSession() {
    if (sessionStorage.getItem('talio_admin_auth') === 'true') {
        showDashboard();
    }
}

function showDashboard() {
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('adminDashboard').classList.add('active');
    loadLeads();
}

function logout() {
    sessionStorage.removeItem('talio_admin_auth');
    document.getElementById('loginOverlay').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.remove('active');
    document.getElementById('password').value = '';
}

/* ============================================
   LEADS MANAGEMENT
   ============================================ */
function loadLeads() {
    const leads = getLeads();
    updateStats(leads);
    renderLeadsTable(leads);
}

function getLeads() {
    try {
        return JSON.parse(localStorage.getItem('talio_leads') || '[]');
    } catch (error) {
        console.error('Error loading leads:', error);
        return [];
    }
}

function saveLeads(leads) {
    localStorage.setItem('talio_leads', JSON.stringify(leads));
}

function updateStats(leads) {
    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Total leads
    document.getElementById('totalLeads').textContent = leads.length;
    
    // Today's leads
    const todayLeads = leads.filter(lead => {
        const leadDate = new Date(lead.submittedAt);
        return leadDate.toDateString() === today;
    });
    document.getElementById('todayLeads').textContent = todayLeads.length;
    
    // This week's leads
    const weekLeads = leads.filter(lead => {
        const leadDate = new Date(lead.submittedAt);
        return leadDate >= weekAgo;
    });
    document.getElementById('weekLeads').textContent = weekLeads.length;
    
    // Unique companies
    const uniqueCompanies = new Set(leads.map(lead => lead.companyName.toLowerCase()));
    document.getElementById('uniqueCompanies').textContent = uniqueCompanies.size;
}

function renderLeadsTable(leads) {
    const tbody = document.getElementById('leadsTableBody');
    const emptyState = document.getElementById('emptyState');
    const table = document.getElementById('leadsTable');
    
    if (leads.length === 0) {
        table.style.display = 'none';
        emptyState.classList.add('visible');
        return;
    }
    
    table.style.display = 'table';
    emptyState.classList.remove('visible');
    
    // Apply filters
    leads = applyFilters(leads);
    
    // Sort leads
    leads = sortLeads(leads);
    
    tbody.innerHTML = leads.map(lead => `
        <tr data-id="${lead.id}">
            <td>
                <div class="contact-cell">
                    <div class="contact-avatar">${getInitials(lead.firstName, lead.lastName)}</div>
                    <div class="contact-info">
                        <span class="contact-name">${lead.firstName} ${lead.lastName}</span>
                        <span class="contact-email">${lead.email}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="company-cell">
                    <span class="company-name">${lead.companyName}</span>
                    <span class="company-role">${lead.jobTitle || lead.selectedPlan || 'N/A'}</span>
                </div>
            </td>
            <td>
                <span class="badge badge-${getIndustryColor(lead.industry)}">${formatIndustry(lead.industry)}</span>
            </td>
            <td>${lead.companySize}</td>
            <td>${lead.selectedPlan ? `<span class="badge badge-purple">${lead.selectedPlan}</span>` : '-'}</td>
            <td>${formatDate(lead.submittedAt)}</td>
            <td>
                <div class="actions-cell">
                    <button class="action-btn" onclick="viewLead(${lead.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete" onclick="confirmDelete(${lead.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/* ============================================
   FILTERS AND SEARCH
   ============================================ */
function initFilters() {
    const filterIndustry = document.getElementById('filterIndustry');
    const filterSize = document.getElementById('filterSize');
    const sortBy = document.getElementById('sortBy');
    
    [filterIndustry, filterSize, sortBy].forEach(el => {
        el.addEventListener('change', () => loadLeads());
    });
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', debounce(() => {
        loadLeads();
    }, 300));
}

function applyFilters(leads) {
    const industry = document.getElementById('filterIndustry').value;
    const size = document.getElementById('filterSize').value;
    const search = document.getElementById('searchInput').value.toLowerCase();
    
    return leads.filter(lead => {
        // Industry filter
        if (industry && lead.industry !== industry) return false;
        
        // Size filter
        if (size && lead.companySize !== size) return false;
        
        // Search filter
        if (search) {
            const searchFields = [
                lead.firstName,
                lead.lastName,
                lead.email,
                lead.companyName,
                lead.jobTitle
            ].join(' ').toLowerCase();
            
            if (!searchFields.includes(search)) return false;
        }
        
        return true;
    });
}

function sortLeads(leads) {
    const sortBy = document.getElementById('sortBy').value;
    
    return [...leads].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.submittedAt) - new Date(a.submittedAt);
            case 'oldest':
                return new Date(a.submittedAt) - new Date(b.submittedAt);
            case 'company':
                return a.companyName.localeCompare(b.companyName);
            case 'name':
                return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
            default:
                return 0;
        }
    });
}

function clearFilters() {
    document.getElementById('filterIndustry').value = '';
    document.getElementById('filterSize').value = '';
    document.getElementById('sortBy').value = 'newest';
    document.getElementById('searchInput').value = '';
    loadLeads();
}

function refreshLeads() {
    loadLeads();
    
    // Visual feedback
    const btn = event.target.closest('.btn');
    const icon = btn.querySelector('i');
    icon.classList.add('fa-spin');
    
    setTimeout(() => {
        icon.classList.remove('fa-spin');
    }, 500);
}

/* ============================================
   LEAD DETAILS MODAL
   ============================================ */
function viewLead(id) {
    const leads = getLeads();
    const lead = leads.find(l => l.id === id);
    
    if (!lead) return;
    
    currentLeadId = id;
    
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="lead-detail">
            <div class="detail-section">
                <h4>Contact Information</h4>
                <div class="detail-row">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${lead.firstName} ${lead.lastName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${lead.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value">${lead.phone || 'Not provided'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Job Title</span>
                    <span class="detail-value">${lead.jobTitle}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Company Information</h4>
                <div class="detail-row">
                    <span class="detail-label">Company</span>
                    <span class="detail-value">${lead.companyName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Industry</span>
                    <span class="detail-value">${formatIndustry(lead.industry)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Company Size</span>
                    <span class="detail-value">${lead.companySize}</span>
                </div>
                ${lead.selectedPlan ? `
                <div class="detail-row">
                    <span class="detail-label">Selected Plan</span>
                    <span class="detail-value"><span class="badge badge-purple">${lead.selectedPlan}</span></span>
                </div>
                ` : ''}
            </div>
            
            ${lead.message ? `
            <div class="detail-section">
                <h4>Message</h4>
                <div class="detail-message">${lead.message}</div>
            </div>
            ` : ''}
            
            <div class="detail-section">
                <h4>Submission Details</h4>
                <div class="detail-row">
                    <span class="detail-label">Submitted At</span>
                    <span class="detail-value">${formatDateTime(lead.submittedAt)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Lead ID</span>
                    <span class="detail-value">#${lead.id}</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    currentLeadId = null;
}

function copyLeadEmail() {
    const leads = getLeads();
    const lead = leads.find(l => l.id === currentLeadId);
    
    if (lead) {
        navigator.clipboard.writeText(lead.email).then(() => {
            alert('Email copied to clipboard!');
        });
    }
}

/* ============================================
   DELETE LEAD
   ============================================ */
function confirmDelete(id) {
    currentLeadId = id;
    document.getElementById('deleteModalOverlay').classList.add('active');
    
    // Set up confirm button
    document.getElementById('confirmDeleteBtn').onclick = () => deleteLead(id);
}

function closeDeleteModal() {
    document.getElementById('deleteModalOverlay').classList.remove('active');
    currentLeadId = null;
}

function deleteLead(id) {
    let leads = getLeads();
    leads = leads.filter(l => l.id !== id);
    saveLeads(leads);
    
    closeDeleteModal();
    loadLeads();
}

/* ============================================
   EXPORT FUNCTIONS
   ============================================ */
function exportCSV() {
    const leads = getLeads();
    
    if (leads.length === 0) {
        alert('No leads to export.');
        return;
    }
    
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Job Title', 'Company', 'Industry', 'Company Size', 'Message', 'Submitted At'];
    
    const csvContent = [
        headers.join(','),
        ...leads.map(lead => [
            escapeCSV(lead.firstName),
            escapeCSV(lead.lastName),
            escapeCSV(lead.email),
            escapeCSV(lead.phone || ''),
            escapeCSV(lead.jobTitle),
            escapeCSV(lead.companyName),
            escapeCSV(lead.industry),
            escapeCSV(lead.companySize),
            escapeCSV(lead.message || ''),
            escapeCSV(lead.submittedAt)
        ].join(','))
    ].join('\n');
    
    downloadFile(csvContent, 'talio-leads.csv', 'text/csv');
}

function exportJSON() {
    const leads = getLeads();
    
    if (leads.length === 0) {
        alert('No leads to export.');
        return;
    }
    
    const jsonContent = JSON.stringify(leads, null, 2);
    downloadFile(jsonContent, 'talio-leads.json', 'application/json');
}

function exportLeads() {
    exportCSV();
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function escapeCSV(value) {
    if (typeof value !== 'string') return value;
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/* ============================================
   HELPER FUNCTIONS
   ============================================ */
function getInitials(firstName, lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function formatIndustry(industry) {
    const industries = {
        'technology': 'Technology',
        'healthcare': 'Healthcare',
        'finance': 'Finance & Banking',
        'retail': 'Retail & E-commerce',
        'manufacturing': 'Manufacturing',
        'education': 'Education',
        'consulting': 'Consulting',
        'marketing': 'Marketing & Advertising',
        'real-estate': 'Real Estate',
        'other': 'Other'
    };
    return industries[industry] || industry;
}

function getIndustryColor(industry) {
    const colors = {
        'technology': 'blue',
        'healthcare': 'green',
        'finance': 'purple',
        'retail': 'orange',
        'manufacturing': 'blue',
        'education': 'green',
        'consulting': 'purple',
        'marketing': 'orange',
        'real-estate': 'blue',
        'other': 'purple'
    };
    return colors[industry] || 'blue';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Close modals on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeDeleteModal();
    }
});

// Close modals on overlay click
document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') {
        closeModal();
    }
});

document.getElementById('deleteModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'deleteModalOverlay') {
        closeDeleteModal();
    }
});

console.log('%c🔐 Talio Admin Panel', 'color: #3B82F6; font-size: 16px; font-weight: bold;');
