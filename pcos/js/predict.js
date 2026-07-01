/**
 * PCOS Risk Prediction Engine
 * Loads model.json and runs client-side logistic regression inference.
 * Replicates the exact preprocessing and scoring from the Python model.
 */

class PCOSModel {
    constructor() {
        this.modelData = null;
        this.isLoaded = false;
    }

    async load() {
        if (this.isLoaded) return true;
        try {
            const response = await fetch('assets/model.json');
            if (!response.ok) throw new Error('Failed to load model file');
            this.modelData = await response.json();
            this.isLoaded = true;
            return true;
        } catch (error) {
            console.error('Error loading PCOS model:', error);
            return false;
        }
    }

    /**
     * Calculates the BMI and Waist:Hip Ratio, and formats inputs to match model features.
     */
    preprocessData(rawInput) {
        const features = {};
        
        // 1. Direct numeric maps
        const directMaps = [
            'Age (yrs)', 'Weight (Kg)', 'Height(Cm)', 'Blood Group', 
            'Hip(inch)', 'Waist(inch)', 'Cycle_Irregular', 'Cycle length(days)',
            'Pregnant(Y/N)', 'No. of abortions', 'Weight gain(Y/N)', 
            'hair growth(Y/N)', 'Skin darkening (Y/N)', 'Hair loss(Y/N)', 
            'Pimples(Y/N)', 'Fast food (Y/N)', 'Reg.Exercise(Y/N)'
        ];

        directMaps.forEach(key => {
            features[key] = parseFloat(rawInput[key] || 0);
        });

        // 2. Derived features
        // BMI = weight(kg) / height(m)^2
        const heightM = features['Height(Cm)'] / 100;
        features['BMI'] = features['Weight (Kg)'] / (heightM * heightM);

        // Waist:Hip Ratio = waist / hip
        if (features['Hip(inch)'] > 0) {
            features['Waist:Hip Ratio'] = features['Waist(inch)'] / features['Hip(inch)'];
        } else {
            features['Waist:Hip Ratio'] = 0;
        }

        return features;
    }

    /**
     * Run inference and return probability and feature contributions
     */
    predict(rawInput) {
        if (!this.isLoaded) throw new Error('Model not loaded');

        // Step 1: Preprocess to get all 19 features
        const features = this.preprocessData(rawInput);
        
        // Ensure features are in the exact order as training
        const featureArray = this.modelData.features.map(f => features[f] || 0);

        // Step 2: Standardize (z = (x - mean) / scale)
        // Note: This exactly matches sklearn's StandardScaler
        const scaledFeatures = featureArray.map((val, idx) => {
            const mean = this.modelData.scaler.mean[idx];
            const scale = this.modelData.scaler.scale[idx];
            return (val - mean) / scale;
        });

        // Step 3: Linear combination (logit = z*w + b)
        let logit = this.modelData.intercept;
        const contributions = []; // Store how much each feature shifted the logit

        for (let i = 0; i < scaledFeatures.length; i++) {
            const weight = this.modelData.coefficients[i];
            const val = scaledFeatures[i];
            const contribution = val * weight;
            logit += contribution;

            // Save contribution for explainability
            contributions.push({
                feature: this.modelData.features[i],
                label: this.modelData.feature_labels[this.modelData.features[i]],
                description: this.modelData.factor_descriptions[this.modelData.features[i]],
                rawValue: features[this.modelData.features[i]],
                weight: weight,
                scaledValue: val,
                contribution: contribution,
                // We consider it a "risk factor" if it pushes the logit up (positive contribution)
                isRiskFactor: contribution > 0
            });
        }

        // Step 4: Sigmoid function (prob = 1 / (1 + exp(-logit)))
        const probability = 1 / (1 + Math.exp(-logit));

        // Step 5: Determine risk category based on thresholds
        let riskCategory = 'Low';
        if (probability >= this.modelData.thresholds.high_min) {
            riskCategory = 'High';
        } else if (probability >= this.modelData.thresholds.low_max) {
            riskCategory = 'Moderate';
        }

        // Sort contributions: highest positive impact first
        contributions.sort((a, b) => b.contribution - a.contribution);

        return {
            probability: probability,
            probabilityPercent: Math.round(probability * 100),
            riskCategory: riskCategory,
            topFactors: contributions.filter(c => c.isRiskFactor).slice(0, 4), // Top 4 risk factors
            allContributions: contributions
        };
    }
}

// Export as global
window.PCOSModel = new PCOSModel();
