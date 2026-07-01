"""
Phase 0: PCOS Dataset Exploration Script
Summarizes structure, columns, missing values, class balance, and data quality.
"""
import pandas as pd
import numpy as np

# Load dataset
df = pd.read_csv('PCOS_data.csv')

print("=" * 70)
print("PCOS DATASET EXPLORATION REPORT")
print("=" * 70)

# Basic shape
print(f"\n1. SHAPE: {df.shape[0]} rows × {df.shape[1]} columns")

# Column names (cleaned)
print(f"\n2. COLUMNS ({df.shape[1]} total):")
for i, col in enumerate(df.columns):
    print(f"   [{i:2d}] '{col.strip()}' — dtype: {df[col].dtype}")

# Target variable analysis
target_col = 'PCOS (Y/N)'
print(f"\n3. TARGET VARIABLE: '{target_col}'")
print(df[target_col].value_counts())
print(f"   Class balance: {df[target_col].value_counts(normalize=True).to_dict()}")

# Missing values
print("\n4. MISSING VALUES:")
missing = df.isnull().sum()
missing_cols = missing[missing > 0]
if len(missing_cols) == 0:
    print("   No null values detected (but checking for non-numeric placeholders...)")
else:
    for col, count in missing_cols.items():
        print(f"   '{col.strip()}': {count} missing ({count/len(df)*100:.1f}%)")

# Check for non-numeric values in numeric columns
print("\n5. DATA QUALITY ISSUES:")
for col in df.columns:
    if df[col].dtype == 'object':
        # Try to convert to numeric
        converted = pd.to_numeric(df[col].str.strip() if hasattr(df[col], 'str') else df[col], errors='coerce')
        non_numeric_mask = converted.isna() & df[col].notna()
        if non_numeric_mask.sum() > 0:
            bad_vals = df[col][non_numeric_mask].unique()
            print(f"   '{col.strip()}': {non_numeric_mask.sum()} non-numeric values: {bad_vals[:5]}")

# Descriptive stats for numeric columns
print("\n6. NUMERIC SUMMARY (key columns):")
numeric_df = df.select_dtypes(include=[np.number])
print(numeric_df.describe().round(2).to_string())

# Categorize features by type
print("\n7. FEATURE CATEGORIZATION FOR QUESTIONNAIRE:")
print("\n   A) USER-ANSWERABLE (no lab test needed):")
user_answerable = [
    ' Age (yrs)', 'Weight (Kg)', 'Height(Cm) ', 'BMI',
    'Cycle(R/I)', 'Cycle length(days)',
    'Weight gain(Y/N)', 'hair growth(Y/N)', 'Skin darkening (Y/N)',
    'Hair loss(Y/N)', 'Pimples(Y/N)', 'Fast food (Y/N)', 'Reg.Exercise(Y/N)',
    'Pregnant(Y/N)', 'No. of abortions', 'Marraige Status (Yrs)',
    'Blood Group', 'BP _Systolic (mmHg)', 'BP _Diastolic (mmHg)',
    'Hip(inch)', 'Waist(inch)', 'Waist:Hip Ratio'
]
for col in user_answerable:
    if col in df.columns:
        print(f"      ✓ '{col.strip()}'")

print("\n   B) REQUIRES LAB TESTS (potential exclusion):")
lab_cols = [
    'Hb(g/dl)', 'Pulse rate(bpm) ', 'RR (breaths/min)',
    '  I   beta-HCG(mIU/mL)', 'II    beta-HCG(mIU/mL)',
    'FSH(mIU/mL)', 'LH(mIU/mL)', 'FSH/LH',
    'TSH (mIU/L)', 'AMH(ng/mL)', 'PRL(ng/mL)',
    'Vit D3 (ng/mL)', 'PRG(ng/mL)', 'RBS(mg/dl)',
    'Follicle No. (L)', 'Follicle No. (R)',
    'Avg. F size (L) (mm)', 'Avg. F size (R) (mm)', 'Endometrium (mm)'
]
for col in lab_cols:
    if col in df.columns:
        print(f"      ✗ '{col.strip()}'")

# Binary columns value distribution
print("\n8. BINARY SYMPTOM COLUMNS DISTRIBUTION:")
binary_cols = ['Weight gain(Y/N)', 'hair growth(Y/N)', 'Skin darkening (Y/N)',
               'Hair loss(Y/N)', 'Pimples(Y/N)', 'Fast food (Y/N)', 'Reg.Exercise(Y/N)']
for col in binary_cols:
    if col in df.columns:
        dist = df[col].value_counts().to_dict()
        print(f"   '{col.strip()}': {dist}")

print("\n" + "=" * 70)
print("END OF EXPLORATION REPORT")
print("=" * 70)
