import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from joblib import dump, load
from django.conf import settings

# Path to save/load models
MODEL_DIR = settings.ML_MODEL_PATH
RENT_MODEL_PATH = os.path.join(MODEL_DIR, 'rent_prediction_model.joblib')
ROI_MODEL_PATH = os.path.join(MODEL_DIR, 'roi_prediction_model.joblib')
GROWTH_MODEL_PATH = os.path.join(MODEL_DIR, 'growth_prediction_model.joblib')
SCALER_PATH = os.path.join(MODEL_DIR, 'feature_scaler.joblib')

# Ensure model directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

# Mock data for training models if they don't exist
def generate_mock_data(n_samples=1000):
    np.random.seed(42)
    
    # Generate features
    locations = np.random.choice(['New York', 'San Francisco', 'Miami', 'Chicago', 'Austin'], n_samples)
    sizes = np.random.randint(500, 5000, n_samples)
    prices = np.random.uniform(100000, 2000000, n_samples)
    bedrooms = np.random.randint(1, 6, n_samples)
    bathrooms = np.random.choice([1, 1.5, 2, 2.5, 3, 3.5, 4], n_samples)
    property_types = np.random.choice(['Apartment', 'House', 'Condo', 'Townhouse'], n_samples)
    year_built = np.random.randint(1950, 2023, n_samples)
    
    # Generate target variables with some realistic relationships
    monthly_rent = prices * 0.005 + sizes * 0.5 + np.random.normal(0, 500, n_samples)
    annual_roi = (monthly_rent * 12) / prices * 100 + np.random.normal(0, 1, n_samples)
    area_growth_score = np.random.randint(1, 11, n_samples)
    
    # Create DataFrame
    data = pd.DataFrame({
        'location': locations,
        'size': sizes,
        'price': prices,
        'bedrooms': bedrooms,
        'bathrooms': bathrooms,
        'property_type': property_types,
        'year_built': year_built,
        'monthly_rent': monthly_rent,
        'annual_roi': annual_roi,
        'area_growth_score': area_growth_score
    })
    
    return data

def train_models():
    """Train and save ML models for property analysis"""
    # Generate mock data
    data = generate_mock_data()
    
    # One-hot encode categorical features
    data_encoded = pd.get_dummies(data, columns=['location', 'property_type'], drop_first=True)
    
    # Define features and targets
    features = data_encoded.drop(['monthly_rent', 'annual_roi', 'area_growth_score'], axis=1)
    rent_target = data_encoded['monthly_rent']
    roi_target = data_encoded['annual_roi']
    growth_target = data_encoded['area_growth_score']
    
    # Scale features
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    
    # Train models
    rent_model = RandomForestRegressor(n_estimators=100, random_state=42)
    rent_model.fit(features_scaled, rent_target)
    
    roi_model = LinearRegression()
    roi_model.fit(features_scaled, roi_target)
    
    growth_model = RandomForestRegressor(n_estimators=100, random_state=42)
    growth_model.fit(features_scaled, growth_target)
    
    # Save models and scaler
    dump(rent_model, RENT_MODEL_PATH)
    dump(roi_model, ROI_MODEL_PATH)
    dump(growth_model, GROWTH_MODEL_PATH)
    dump(scaler, SCALER_PATH)
    
    return rent_model, roi_model, growth_model, scaler, features.columns

def load_models():
    """Load trained ML models"""
    try:
        rent_model = load(RENT_MODEL_PATH)
        roi_model = load(ROI_MODEL_PATH)
        growth_model = load(GROWTH_MODEL_PATH)
        scaler = load(SCALER_PATH)
        return rent_model, roi_model, growth_model, scaler
    except FileNotFoundError:
        print("Models not found. Training new models...")
        return train_models()[:4]  # Return only the models and scaler

def preprocess_input(property_data):
    """Preprocess input data for prediction"""
    # Create a DataFrame with the input data
    input_df = pd.DataFrame([property_data])
    
    # Fill missing values
    if 'bedrooms' not in input_df or pd.isna(input_df['bedrooms'].iloc[0]):
        input_df['bedrooms'] = 2  # Default value
    
    if 'bathrooms' not in input_df or pd.isna(input_df['bathrooms'].iloc[0]):
        input_df['bathrooms'] = 2.0  # Default value
    
    if 'property_type' not in input_df or pd.isna(input_df['property_type'].iloc[0]):
        input_df['property_type'] = 'Apartment'  # Default value
    
    if 'year_built' not in input_df or pd.isna(input_df['year_built'].iloc[0]):
        input_df['year_built'] = 2000  # Default value
    
    # One-hot encode categorical features
    # For simplicity, we'll handle a limited set of categories
    location_dummies = pd.get_dummies(input_df['location'], prefix='location')
    property_type_dummies = pd.get_dummies(input_df['property_type'], prefix='property_type')
    
    # Drop original categorical columns
    input_df = input_df.drop(['location', 'property_type'], axis=1)
    
    # Combine with dummies
    input_df = pd.concat([input_df, location_dummies, property_type_dummies], axis=1)
    
    # Ensure all expected columns are present (from training data)
    # In a real implementation, you would load the expected columns from a saved file
    # For this example, we'll handle a limited set
    expected_columns = [
        'size', 'price', 'bedrooms', 'bathrooms', 'year_built',
        'location_New York', 'location_San Francisco', 'location_Miami', 'location_Chicago', 'location_Austin',
        'property_type_Apartment', 'property_type_House', 'property_type_Condo', 'property_type_Townhouse'
    ]
    
    for col in expected_columns:
        if col not in input_df.columns:
            input_df[col] = 0
    
    # Keep only the expected columns in the correct order
    input_df = input_df[expected_columns]
    
    return input_df

def analyze_investment(property_data):
    """
    Analyze a property investment using ML models
    
    Args:
        property_data: Dictionary with property details
        
    Returns:
        Dictionary with analysis results
    """
    # Load models
    rent_model, roi_model, growth_model, scaler = load_models()
    
    # Preprocess input data
    input_df = preprocess_input(property_data)
    
    # Scale features
    input_scaled = scaler.transform(input_df)
    
    # Make predictions
    monthly_rent = max(0, rent_model.predict(input_scaled)[0])
    annual_roi = max(0, roi_model.predict(input_scaled)[0])
    area_growth_score = min(10, max(1, round(growth_model.predict(input_scaled)[0])))
    
    # Generate predicted value growth for 5 years
    price = float(property_data['price'])
    growth_rate = 0.02 + (area_growth_score / 100)  # Base 2% + growth score contribution
    predicted_value_growth = [
        round(price * (1 + growth_rate) ** year)
        for year in range(1, 6)
    ]
    
    # Generate comparable properties
    comparable_properties = [
        {
            'name': f"Similar Property {i}",
            'price': round(price * (0.9 + 0.2 * np.random.random())),
            'roi': round(annual_roi * (0.9 + 0.2 * np.random.random()), 2)
        }
        for i in range(1, 4)
    ]
    
    return {
        'monthly_rent': round(monthly_rent, 2),
        'annual_roi': round(annual_roi, 2),
        'area_growth_score': area_growth_score,
        'predicted_value_growth': predicted_value_growth,
        'comparable_properties': comparable_properties
    }
