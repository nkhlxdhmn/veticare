"""
Singleton model loader and predictor.
"""
import joblib
import pickle
import time
import os
import pandas as pd
from threading import Lock
from typing import Any, Tuple
import logging

logger = logging.getLogger(__name__)

class ModelLoader:
    """
    A thread-safe singleton class to load the ML model and encoders
    only once and provide a prediction interface.
    """
    _instance = None
    _lock = Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ModelLoader, cls).__new__(cls)
                cls._instance.model = None
                cls._instance.model_version = "v1.0.0"
                cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        """Loads the pre-trained pickle model from disk."""
        model_path = os.environ.get("MODEL_PATH", "Random1.pkl")
        
        # Search paths to handle running from either root or backend/ folder
        # if the env var points to a relative path
        possible_paths = [
            model_path,
            f"../{model_path}",
            f"../../{model_path}"
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                try:
                    with open(path, "rb") as f:
                        self.model = pickle.load(f)
                    logger.info(f"ML Model loaded successfully from {path}")
                    return
                except Exception as e:
                    logger.error(f"Error loading model from {path}: {str(e)}")
                    raise e
                    
        logger.warning(f"Could not find model at {model_path}. Prediction endpoint will fail if called.")

    def predict(self, animal_name: str, symptoms: list) -> Tuple[str, float, int]:
        """
        Runs inference using the loaded model.
        Expects a list of symptoms. Pads or truncates to exactly 5 symptoms.
        Returns (predicted_disease, confidence, processing_time_ms).
        """
        if not self.model:
            raise ValueError("ML Model is not loaded. Cannot perform prediction.")
            
        start_time = time.perf_counter()
        
        # Clean and pad/truncate symptoms to exactly 5 features
        processed_symptoms = []
        for s in symptoms:
            if s and str(s).strip():
                processed_symptoms.append(str(s).strip())
                
        # Pad with 'None' if less than 5
        while len(processed_symptoms) < 5:
            processed_symptoms.append('None')
            
        # Truncate to 5 if more
        processed_symptoms = processed_symptoms[:5]
        
        # Create DataFrame matching exactly the training column names
        df = pd.DataFrame([{
            "AnimalName": animal_name,
            "symptoms1": processed_symptoms[0],
            "symptoms2": processed_symptoms[1],
            "symptoms3": processed_symptoms[2],
            "symptoms4": processed_symptoms[3],
            "symptoms5": processed_symptoms[4]
        }])
        
        try:
            # Predict the disease
            prediction = self.model.predict(df)[0]
            
            # Predict probabilities if supported by the pipeline
            confidence = 0.0
            if hasattr(self.model, "predict_proba"):
                probs = self.model.predict_proba(df)[0]
                confidence = float(max(probs))
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise e
            
        end_time = time.perf_counter()
        processing_time_ms = int((end_time - start_time) * 1000)
        
        return str(prediction), confidence, processing_time_ms

# Create a global instance that gets initialized on module load
try:
    model_loader = ModelLoader()
except Exception as e:
    logger.error("Failed to initialize model_loader: " + str(e))
    model_loader = None