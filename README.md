# QuizMaster

QuizMaster is a React-based web application that allows users to test their knowledge through engaging quizzes. The app supports user authentication, quiz selection, real-time scoring, and a summary of past quiz results. It is built with Firebase for backend services and Tailwind CSS for styling.

Website: https://comp3421-pro.firebaseapp.com/

## Features

- **User Authentication**:  Login and register using email/password or Google authentication.
- **Quiz Selection**:       Browse and select from a variety of quizzes.
- **Real-Time Scoring**:    Track your score as you progress through the quiz.
- **Score Summary**:        View a summary of your past quiz attempts.
- **Responsive Design**:    Optimized for both desktop and mobile devices.

## Technologies Used
- React: Frontend framework
- Firebase: Backend services (Authentication, Realtime Database, Hosting, Analytics)
- Tailwind CSS: Utility-first CSS framework
- React Router: Client-side routing

## Project Structure

root<br />
 |- public                  #   Static files. The /npacked script will be stored here.<br />
 |- src                     #   Source code folder<br />
 |   ├─assets               #   Static assets (sound effects)<br />
 |   ├─firebase.js          #   Firebase configuration for scripts<br />
 |   ├─index.css            #   Storing the Tailwind CSS Framework<br />
 |   ├─index.js             #   Entry Point<br />
 |   ├─MainInterface        #   Main app routing and logic<br />
 |   ├─Login.js             #   Login Interface<br />
 |   ├─Register.js          #   Register Interface<br />
 |   ├─QuizList.js          #   Interface for choosing Quiz set.<br />
 |   ├─QuizPage.js          #   Interface for doing Quiz<br />
 |   └─ScoreSummary.js      #   View for Account's scores<br />
 |-  firebase.json          #   Firebase hosting configuration<br />
 |-  .firebaserc            #   Firebase project configuration<br />
 |-  package.json           #   Project dependencies and scripts<br />
 |-  quizQuestions.json     #   Dataset of the Quizzes<br />
 |-  README.md              #   Project documentation<br />

## Run Locally

### Prerequisites

- Node.js (v16 or higher)
- Firebase account

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/MeanJai/COMP3421-Project.git
    cd COMP3421-Project
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Firebase:
    Add .env file in the root directory, then write in (and replace <>s) the file as:
    ```
    REACT_APP_FIREBASE_API_KEY = <Key>
    REACT_APP_FIREBASE_AUTH_DOMAIN = "comp3421-pro.firebaseapp.com"
    REACT_APP_FIREBASE_STORAGE_BUCKET = "comp3421-pro.firebasestorage.app"
    REACT_APP_FIREBASE_DATABASE_URL = "comp3421-pro.asia-southeast1.firebasedatabase.app"
    REACT_APP_FIREBASE_PROJECT_ID = "comp3421-pro"
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID = <sender_id>
    REACT_APP_FIREBASE_APP_ID = <app_id>
    REACT_APP_FIREBASE_MEASUREMENT_ID = <measurement_id>
    ```
     
4.  Start the development server:
    ```bash
    npm start
    ```
