"""
Singleton model loader and predictor.
"""
import joblib
import time
from threading import Lock
from typing import Any, Tuple

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
                cls._instance.model_version = "v1.0.0" # Example version
                # In a real app, load from a config file
                cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        """Loads the model and encoders from disk."""
        # In a real application, these paths would come from a config file.
        # For this example, we assume they exist. If not, this will fail at startup.
        # self.model = joblib.load("app/ai/model.joblib")
        # self.encoder = joblib.load("app/ai/encoder.joblib")
        # with open("app/ai/labels.json", "r") as f:
        #     self.labels = json.load(f)
        # Placeholder for demonstration since we don't have the actual files
        self.model = "mock_model"
        print("ML Model loaded successfully.")

    def predict(self, symptoms: list) -> Tuple[str, float, int]:
        """Runs preprocessing and inference."""
        start_time = time.perf_counter()
        # 1. Preprocess symptoms (e.g., using self.encoder)
        # 2. Run inference: self.model.predict(processed_symptoms)
        # 3. Get probabilities: self.model.predict_proba(processed_symptoms)
        end_time = time.perf_counter()
        processing_time_ms = int((end_time - start_time) * 1000)
        # Mocked response
        return "Canine Distemper", 0.94, processing_time_ms

model_loader = ModelLoader()