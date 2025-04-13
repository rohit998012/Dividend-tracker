📈 Dividend Tracker
A web-based dividend tracker that fetches stock dividend data for the Nifty 100 stocks from NSE India and Yahoo Finance. Users can view dividend information on the homepage and, upon signing in, create custom portfolios to estimate their potential 1-year dividend returns.

🚀 Prerequisites
Ensure Node.js is installed on your system before running this project.

🏗️ Project Structure : 

This project consists of:

Backend: Handles data fetching and API requests

Frontend: Built with React + Vite for the user interface

🛠️ Setup & Running
🔹 Running the Backend : 

Navigate to the backend directory:

cd nse-backend
Run the data fetching script:

node script.js
Start the backend server:

node server.js
🔹 Running the Frontend : 
Navigate to the frontend directory:

cd frontend
Install dependencies:

npm install
Set up Firebase Configuration
To enable authentication and portfolio features:

Create a .env file in the root of the frontend directory.

Add your Firebase config variables to it:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

🔹 Start the Frontend Development Server : 

npm run dev
Open the provided URL in your browser to access the app.
