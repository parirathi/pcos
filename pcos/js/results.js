/**
 * Results Page Logic
 * Retrieves user data, calls the model, and updates the UI.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const resultsContent = document.getElementById('resultsContent');

    // 1. Get data from session storage
    const savedDataStr = sessionStorage.getItem('pcos_assessment_data');
    if (!savedDataStr) {
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
        return;
    }

    const userData = JSON.parse(savedDataStr);

    // 2. Load model
    const loaded = await window.PCOSModel.load();
    if (!loaded) {
        loadingState.innerHTML = '<h2>Error loading model</h2><p>Please try again later.</p>';
        return;
    }

    // 3. Run prediction
    try {
        const results = window.PCOSModel.predict(userData);
        renderResults(results);
        
        loadingState.style.display = 'none';
        resultsContent.style.display = 'block';
        
        // Animate gauge after a short delay
        setTimeout(() => animateGauge(results.probabilityPercent, results.riskCategory), 100);
        
    } catch (error) {
        console.error("Prediction error:", error);
        loadingState.innerHTML = '<h2>Error calculating results</h2><p>Please check your inputs and try again.</p>';
    }
});

function renderResults(results) {
    // 1. Update Gauge Text
    const gaugeValue = document.getElementById('gaugeValue');
    const gaugeLabel = document.getElementById('gaugeLabel');
    const riskDesc = document.getElementById('riskDescription');
    const nextSteps = document.getElementById('nextStepsText');
    const gaugeFill = document.getElementById('gaugeFill');
    
    gaugeValue.textContent = `${results.probabilityPercent}%`;
    gaugeLabel.textContent = `${results.riskCategory} Risk`;
    
    // Reset classes
    gaugeLabel.className = 'gauge-label';
    gaugeFill.className = 'gauge-fill';
    
    let colorClass = '';
    if (results.riskCategory === 'Low') {
        colorClass = 'risk-low';
        gaugeFill.classList.add('low');
        riskDesc.innerHTML = 'Based on your answers, your risk profile is <strong>lower than typical patterns</strong> seen in PCOS patients.';
        nextSteps.innerHTML = 'Maintain a healthy lifestyle with regular exercise and balanced nutrition. If you have specific concerns about your menstrual cycle or health, consider discussing them at your next routine check-up.';
    } else if (results.riskCategory === 'Moderate') {
        colorClass = 'risk-moderate';
        gaugeFill.classList.add('moderate');
        riskDesc.innerHTML = 'Your answers indicate some overlapping factors with PCOS, placing you in a <strong>moderate risk</strong> category.';
        nextSteps.innerHTML = 'We recommend scheduling a non-urgent visit with your healthcare provider to discuss your symptoms. Mention the specific factors highlighted below during your consultation.';
    } else {
        colorClass = 'risk-high';
        gaugeFill.classList.add('high');
        riskDesc.innerHTML = 'Your answers strongly align with patterns commonly seen in PCOS patients, indicating a <strong>high risk</strong>.';
        nextSteps.innerHTML = '<strong>Please schedule an appointment with a gynecologist or endocrinologist.</strong> Early diagnosis and management of PCOS can significantly improve symptoms and long-term health outcomes.';
    }
    
    gaugeLabel.classList.add(colorClass);

    // 2. Render Contributing Factors
    const factorsList = document.getElementById('factorsList');
    factorsList.innerHTML = ''; // Clear existing
    
    if (results.topFactors.length === 0) {
        factorsList.innerHTML = '<li class="text-secondary" style="padding: 1rem;">No major risk-increasing factors identified.</li>';
    } else {
        results.topFactors.forEach(factor => {
            const li = document.createElement('li');
            li.className = 'factor-item';
            
            // Format the raw value for display
            let displayVal = factor.rawValue;
            if (factor.feature.includes('(Y/N)')) {
                displayVal = factor.rawValue === 1 ? 'Yes' : 'No';
            } else if (factor.feature === 'Cycle_Irregular') {
                displayVal = factor.rawValue === 1 ? 'Irregular' : 'Regular';
            } else if (factor.feature === 'BMI') {
                displayVal = factor.rawValue.toFixed(1);
            }
            
            li.innerHTML = `
                <div class="factor-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <div>
                    <h4 class="mb-1" style="font-size: 1.1rem; color: var(--text-primary);">${factor.label} <span style="font-size: 0.85rem; font-weight: normal; color: var(--text-secondary); background: var(--bg-alt); padding: 0.1rem 0.5rem; border-radius: 12px; margin-left: 0.5rem;">You answered: ${displayVal}</span></h4>
                    <p class="text-secondary mb-0" style="font-size: 0.9rem;">${factor.description}</p>
                </div>
            `;
            factorsList.appendChild(li);
        });
    }
}

function animateGauge(percentage, category) {
    const gaugeFill = document.getElementById('gaugeFill');
    // Map 0-100% to -45deg to 135deg (180 degree rotation)
    // 0% = -45deg
    // 50% = 45deg
    // 100% = 135deg
    const degrees = -45 + (percentage * 1.8);
    gaugeFill.style.transform = `rotate(${degrees}deg)`;
}
