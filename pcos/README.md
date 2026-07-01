# PCOS Risk Check

A calm, trustworthy, visually beautiful web application that predicts a user's PCOS (Polycystic Ovary Syndrome) risk level from health/lifestyle inputs.

## Overview
This application runs entirely in the browser (client-side) using HTML, CSS, and vanilla JavaScript. There is no backend server or database, ensuring complete user privacy. The risk assessment is powered by a machine learning model (Logistic Regression) trained on clinical data.

## Features
- **100% Private**: All data is processed locally on the device using `sessionStorage` and client-side ML inference. Data is cleared when the tab is closed.
- **Data-Driven**: Uses a custom-trained Logistic Regression model exported to a static JSON file (`model.json`).
- **Accessible Design**: Built with a custom design system focusing on calmness and clarity (lavender/rose/mint palette), including full Dark Mode support and responsive layouts.
- **Progressive Assessment**: A multi-step form (Basics, History, Symptoms, Lifestyle) to break down the 15 input features.
- **Explainable Results**: The results page not only shows a risk category (Low/Moderate/High) but also breaks down the top contributing factors based on the model's coefficients.

## Project Structure
```text
/
├── index.html           # Home/Hero page
├── assessment.html      # Multi-step questionnaire
├── results.html         # Inference and results dashboard
├── learn.html           # Educational content about PCOS
├── about.html           # Methodology and privacy policy
├── assets/
│   ├── model.json               # Exported ML model weights/scaler
│   └── validation_samples.json  # Parity test cases
├── css/
│   ├── tokens.css       # Design variables & dark mode colors
│   ├── base.css         # Reset & typography
│   ├── components.css   # Buttons, cards, form inputs, gauge
│   └── pages.css        # Page-specific layouts
├── js/
│   ├── app.js           # Global logic (dark mode, nav)
│   ├── form.js          # Multi-step form validation & state
│   ├── predict.js       # Client-side ML inference engine
│   └── results.js       # Results UI rendering
└── train_model.py       # Python script used to train and export the model
```

## Setup & Running
Since this is a purely static site, you can run it using any simple local HTTP server.

For example, using Python:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

## ML Model Details
The underlying model was trained using `scikit-learn` in Python (`train_model.py`). 
- **Algorithm**: Logistic Regression (L2 regularized, balanced class weights).
- **Features**: 15 user-answerable features (clinical lab results were excluded to ensure the tool is accessible to general users).
- **Parity**: The `predict.js` script exactly replicates sklearn's `StandardScaler` and linear decision function, yielding identical probabilities in the browser as in Python.

## Disclaimer

