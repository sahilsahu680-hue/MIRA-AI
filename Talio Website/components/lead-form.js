/**
 * Talio Lead Form Handler
 * Handles multi-step lead forms across feature pages
 * Saves leads to localStorage for admin panel
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initLeadForm);

    function initLeadForm() {
        const leadForm = document.getElementById('leadForm');
        if (!leadForm) return;

        const step1 = document.getElementById('step1');
        const step2 = document.getElementById('step2');
        const formSuccess = document.getElementById('formSuccess');
        const nextStepBtn = document.getElementById('nextStep');
        const prevStepBtn = document.getElementById('prevStep');
        const submitFormBtn = document.getElementById('submitForm');

        // Multi-step form logic (if steps exist)
        if (nextStepBtn && step1 && step2) {
            nextStepBtn.addEventListener('click', () => {
                // Validate step 1 fields
                const step1Inputs = step1.querySelectorAll('input[required], select[required]');
                let valid = true;
                
                step1Inputs.forEach(input => {
                    if (!input.value.trim()) {
                        valid = false;
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                    }
                });

                if (valid) {
                    step1.classList.remove('active');
                    step2.classList.add('active');
                    step2.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });

            prevStepBtn.addEventListener('click', () => {
                step2.classList.remove('active');
                step1.classList.add('active');
            });
        }

        // Form submission
        leadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get the submit button
            const submitBtn = submitFormBtn || leadForm.querySelector('button[type="submit"]');
            if (!submitBtn) return;

            // Disable and show loading
            const originalContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Submitting...</span>';

            // Collect form data
            const formData = new FormData(leadForm);
            const lead = {
                id: Date.now(),
                firstName: formData.get('firstName') || '',
                lastName: formData.get('lastName') || '',
                email: formData.get('email') || '',
                phone: formData.get('phone') || '',
                companyName: formData.get('companyName') || '',
                jobTitle: formData.get('jobTitle') || '',
                industry: formData.get('industry') || '',
                companySize: formData.get('companySize') || '',
                message: formData.get('message') || '',
                source: getPageSource(),
                submittedAt: new Date().toISOString()
            };

            // Simulate API delay, then save
            setTimeout(() => {
                // Save to localStorage
                saveLead(lead);

                // Show success state
                if (formSuccess) {
                    if (step1) step1.style.display = 'none';
                    if (step2) step2.style.display = 'none';
                    formSuccess.style.display = 'block';
                    formSuccess.classList.add('visible');
                } else {
                    // Simple success feedback
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>Thank you!</span>';
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    leadForm.reset();
                    
                    setTimeout(() => {
                        submitBtn.innerHTML = originalContent;
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                    }, 3000);
                }
            }, 1000);
        });

        // Clear error state on input
        leadForm.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
            });
        });
    }

    function getPageSource() {
        const path = window.location.pathname;
        if (path.includes('/features/attendance')) return 'feature-attendance';
        if (path.includes('/features/payroll')) return 'feature-payroll';
        if (path.includes('/features/leaves')) return 'feature-leaves';
        if (path.includes('/features/projects')) return 'feature-projects';
        if (path.includes('/features/goals')) return 'feature-goals';
        if (path.includes('/features/workflows')) return 'feature-workflows';
        if (path.includes('/features/mira-ai')) return 'feature-mira-ai';
        if (path.includes('/features/team-chat')) return 'feature-team-chat';
        if (path.includes('/features/notifications')) return 'feature-notifications';
        if (path.includes('/get-started')) return 'get-started';
        if (path.includes('/pricing')) return 'pricing';
        if (path.includes('/contact')) return 'contact';
        return 'website';
    }

    function saveLead(lead) {
        try {
            const existingLeads = JSON.parse(localStorage.getItem('talio_leads') || '[]');
            existingLeads.push(lead);
            localStorage.setItem('talio_leads', JSON.stringify(existingLeads));
            console.log('Lead saved successfully:', lead);
        } catch (error) {
            console.error('Error saving lead:', error);
        }
    }

    // Expose for external use if needed
    window.TalioLeadForm = {
        saveLead: saveLead,
        getPageSource: getPageSource
    };
})();
