# Task Manager
A simple to do list application


# Project Setup Instructions

This guide provides instructions on how to set up and run this project locally.

## Prerequisites

* [Node.js and npm](https://nodejs.org/)
* Access to the environment variables document
* Clone the GitHub repository

## 1. Backend Setup

These steps are necessary for running backend service.

1.  **Navigate to backend directory:**
    ```bash
    cd backend
    ```

2.  **Put in environment variables in newly created .env file:**
    Create a new .env file in /backend directory then put all required environment variables in the file
    * **Retrieve the environment variables from the following document:**
    [Environment Variables](https://docs.google.com/document/d/1wb14L9sJzLXBeKcNGe2x-hI2wvy1YGgnz79sz5mK-1c/edit?usp=sharing)


3.  **Install all dependencies:**
    ```bash
    npm install
    ```

4.  **Run the backend service:**
    ```bash
    npm start
    ```

## 2. Frontend Setup

These steps are necessary for running frontend service.

1.  **Navigate to frontend directory:**
    ```bash
    cd frontend/to-do-app
    ```

2.  **Put in environment variables in newly created .env file:**
    Create a new .env file in /frontend/to-do-app directory then put all required environment variables in the file
    * **Retrieve the environment variables from the following document in section frontend:**
    [Environment Variables](https://docs.google.com/document/d/1wb14L9sJzLXBeKcNGe2x-hI2wvy1YGgnz79sz5mK-1c/edit?usp=sharing)


3.  **Install all dependencies:**
    ```bash
    npm install
    ```

4.  **Run the backend service:**
    ```bash
    npm run dev
    ```