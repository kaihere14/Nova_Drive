# Nova Drive
A comprehensive cloud storage solution with a robust backend and intuitive frontend.

## Overview
Nova Drive is a full-stack application designed to provide a seamless cloud storage experience. The project consists of a React-based frontend and an Express.js backend, utilizing a MongoDB database for data storage. This README will guide you through the project's architecture, features, installation, and usage.

## Features
* **Cloud Storage**: Upload, download, and manage files in the cloud
* **User Authentication**: Secure login and registration system using Google OAuth
* **Folder Management**: Create, delete, and manage folders to organize your files
* **File Sharing**: Share files with others via unique links
* **Real-time Updates**: Receive updates on file changes and uploads in real-time

## Tech Stack
* **Frontend**:
	+ React
	+ React Router DOM
	+ Tailwind CSS
* **Backend**:
	+ Express.js
	+ MongoDB
	+ Mongoose
* **Dependencies**:
	+ Axios
	+ Bcrypt
	+ Cors
	+ Dotenv
	+ Jsonwebtoken
	+ Multer
	+ Winston

## Architecture
The project is divided into two main components: the frontend and the backend.

### Frontend
The frontend is built using React and utilizes the following components:
* **App.jsx**: The main application component
* **config.js**: Configuration file for API endpoints
* **components**: Reusable UI components
* **pages**: Page-level components
\
* **GET /api/files**: Retrieve a list of files
