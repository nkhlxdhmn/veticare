# FAQ

## General

### What is VetiCare?
VetiCare is a pet healthcare platform that uses machine learning to predict diseases from symptoms, provides an AI veterinary assistant, tracks vaccinations, and helps find nearby veterinary services.

### Is VetiCare free?
The source code is open-source (MIT license). You can host it yourself for free using Supabase's free tier, Vercel, and Render.

### Can I use VetiCare for my business?
Yes. The MIT license allows commercial use.

## Technical

### How does the disease prediction work?
It uses a Random Forest classifier trained on a dataset of animal-symptom-disease mappings. You select the species and up to 5 symptoms, and the model returns the top 5 disease predictions with confidence scores.

### How accurate is the prediction?
Accuracy depends on the training data. The model returns a confidence score (0-100%) with each prediction. Higher confidence means the model is more certain.

### Is the AI assistant a real veterinarian?
**No.** The AI assistant is for informational purposes only. It always displays a disclaimer advising users to consult a real veterinarian. Never use it as a substitute for professional veterinary care.

### What data is stored?
User profiles, pet information, vaccination records, and prediction history. See our [Privacy Policy](/privacy) for details.

### How is my password stored?
Passwords are hashed using bcrypt with a unique salt. They are never stored in plain text.

## Usage

### How do I add a pet?
Navigate to the Pets page after logging in. Click "Add a pet" and fill in the details.

### How do I track vaccinations?
Go to a pet's detail page and click "Add Vaccination". Enter the vaccine name, date, and next due date.

### How do I find a nearby vet?
Go to the Nearby Services page. Your browser will ask for location permission. The map will show nearby veterinary clinics.

## Troubleshooting

### Why am I logged out after refreshing?
Your session token may have expired (30-minute lifetime). The app will redirect you to login automatically. This is a security feature.

### The map isn't loading?
Ensure you have an internet connection and have granted location permission. Check that the Google Maps API key is configured.

### I found a bug. How do I report it?
Open an issue on the GitHub repository with steps to reproduce, expected behavior, and screenshots if applicable.
