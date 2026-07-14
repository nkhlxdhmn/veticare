# VetiCare – AI-Powered Pet Healthcare Platform

## Backend foundation

The FastAPI backend lives in [`backend/`](backend/README.md). Sprint 1 exposes
`GET /` and `GET /health`; interactive API documentation is available at
`/docs` while the service is running. See the [backend README](backend/README.md)
for setup, checks, and the clean-architecture folder map.

##  Problem Statement
Rural and remote areas often lack immediate access to quality veterinary care, resulting in poor health outcomes for pets and livestock. Pet owners struggle to find nearby clinics, maintain proper health records, and access critical healthcare resources efficiently.

##  Solution Overview
VetCare is a comprehensive pet healthcare platform specifically designed to bridge the gap in rural pet healthcare support. It provides an intuitive interface for pet owners to manage their pets' health records, locate nearby veterinary services, and access necessary resources seamlessly.

##  Features
- **User Authentication:** Secure login and registration for pet owners and administrators.
- **Pet Records Management:** Add, update, and track detailed health records for pets.
- **Veterinary Search:** Easily locate and connect with nearby veterinary clinics and professionals.
- **Cloud Storage Integration:** Uses Supabase storage for secure and reliable management of pet images and medical documents.
- **Admin Panel:** Centralized dashboard for managing users, pets, and platform data.

##  Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** PHP, Python (for machine learning predictions)
- **Database:** MySQL
- **Storage:** localhost{ xampp server }
- **AI/ML:** Python (Jupyter Notebook & Flask for Animal Disease Prediction)

##  Installation Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/nikhildhiman72990/veticare.git
   cd veticare
   ```
2. **Setup Database:**
   - Create a MySQL database (e.g., `veticare_db`).
   - Import the provided SQL structure/data (if available).
   - Update the database credentials in `db.php`.
   
3. **Setup Supabase (Optional for Storage):**
   - Configure your Supabase project.
   - Add your API keys and endpoint to the relevant files.

4. **Python Backend (Disease Prediction API):**
   - Ensure Python 3.8+ is installed.
   - Create a virtual environment and install dependencies.
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

##  How to Run Project
1. **Start the PHP Server:**
   - You can use XAMPP, WAMP, or run the built-in PHP server:
     ```bash
     php -S localhost:8000
     ```
   - Navigate to `http://localhost:8000/home.php` in your browser.

2. **Start the Flask AI Service:**
   ```bash
   python app.py
   ```
   - Make sure your Python Flask app is running simultaneously to enable AI features.

## Folder Structure
```
veticare/
│── assets/              # Images, CSS, and JS files
│── docs/                # Project documentation and reports
│── screenshots/         # Application screenshots
│── src/                 # Source code (if applicable)
│── templates/           # Flask/Jinja templates
│── app.py               # Flask backend for disease prediction
│── db.php               # Database connection configuration
│── *.php                # Main application pages
│── README.md            # Project documentation
└── .gitignore           # Git ignore rules
```

##  Screenshots

| Home Page | Dashboard |
| :---: | :---: |
| ![Home](screenshots/home.png) | ![Dashboard](screenshots/dashboard.png) |

| Pet Profile | Admin Panel |
| :---: | :---: |
| ![Pet Profile](screenshots/pet-profile.png) | ![Admin Panel](screenshots/admin-panel.png) |

##  Future Improvements
- Mobile application development (React Native/Flutter).
- Tele-consultation features with secure video calls.
- AI-driven diet and care recommendations for diverse pet breeds.
- Multilingual support for better rural outreach.

##  Author
**Nikhil Dhiman**
