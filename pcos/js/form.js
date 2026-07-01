/**
 * Multi-step Form Logic
 * Handles validation, state, and navigation for the assessment form.
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('assessmentForm');
    if (!form) return;

    let currentStep = 1;
    const totalSteps = 4;

    const btnNext = document.getElementById('btnNext');
    const btnPrev = document.getElementById('btnPrev');
    const btnSubmit = document.getElementById('btnSubmit');
    const progressBarFill = document.getElementById('progressBarFill');

    // Initialize from sessionStorage if exists
    loadSavedData();

    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            saveStepData();
            currentStep++;
            updateUI();
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            saveStepData();
            currentStep--;
            updateUI();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            saveStepData();
            // Go to results page
            window.location.href = 'results.html';
        }
    });

    // Clear validation error on input
    form.addEventListener('input', (e) => {
        if (e.target.classList.contains('is-invalid')) {
            e.target.classList.remove('is-invalid');
        }
    });
    form.addEventListener('change', (e) => {
        if (e.target.type === 'radio' && e.target.name) {
            const radios = document.querySelectorAll(`input[name="${e.target.name}"]`);
            radios.forEach(r => r.classList.remove('is-invalid'));
        }
    });

    function updateUI() {
        // Hide all steps
        document.querySelectorAll('.step-content').forEach(el => {
            el.classList.remove('active');
        });
        
        // Show current step
        document.getElementById(`step-${currentStep}`).classList.add('active');

        // Update progress bar
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBarFill.style.width = `${progress}%`;

        // Update indicators
        for (let i = 1; i <= totalSteps; i++) {
            const indicator = document.getElementById(`indicator-${i}`);
            indicator.classList.remove('active', 'completed');
            if (i < currentStep) {
                indicator.classList.add('completed');
            } else if (i === currentStep) {
                indicator.classList.add('active');
            }
        }

        // Update buttons
        if (currentStep === 1) {
            btnPrev.style.visibility = 'hidden';
        } else {
            btnPrev.style.visibility = 'visible';
        }

        if (currentStep === totalSteps) {
            btnNext.style.display = 'none';
            btnSubmit.style.display = 'block';
        } else {
            btnNext.style.display = 'block';
            btnSubmit.style.display = 'none';
        }
        
        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function validateStep(step) {
        const stepEl = document.getElementById(`step-${step}`);
        const inputs = stepEl.querySelectorAll('input[required], select[required]');
        let isValid = true;
        let firstInvalid = null;

        inputs.forEach(input => {
            if (input.type === 'radio') {
                const name = input.name;
                const checked = document.querySelector(`input[name="${name}"]:checked`);
                if (!checked) {
                    isValid = false;
                    document.querySelectorAll(`input[name="${name}"]`).forEach(r => r.classList.add('is-invalid'));
                    if (!firstInvalid) firstInvalid = input;
                }
            } else {
                if (!input.checkValidity()) {
                    isValid = false;
                    input.classList.add('is-invalid');
                    if (!firstInvalid) firstInvalid = input;
                }
            }
        });

        if (firstInvalid) {
            firstInvalid.focus();
        }

        return isValid;
    }

    function saveStepData() {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        // Save to sessionStorage (temporary, clears on tab close)
        sessionStorage.setItem('pcos_assessment_data', JSON.stringify(data));
    }

    function loadSavedData() {
        const saved = sessionStorage.getItem('pcos_assessment_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                Object.keys(data).forEach(key => {
                    const input = form.elements[key];
                    if (input) {
                        if (input.type === 'radio' || (input.length && input[0].type === 'radio')) {
                            // It's a RadioNodeList or single radio
                            const targetRadio = document.querySelector(`input[name="${key}"][value="${data[key]}"]`);
                            if (targetRadio) targetRadio.checked = true;
                        } else {
                            input.value = data[key];
                        }
                    }
                });
            } catch (e) {
                console.error('Could not parse saved form data', e);
            }
        }
    }
});
