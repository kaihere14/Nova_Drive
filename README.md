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
* **utils**: Utility functions for API requests and authentication

### Backend
The backend is built using Express.js and utilizes the following components:
* **index.ts**: The main application entry point
* **config**: Configuration files for database and API endpoints
* **controllers**: Controller functions for handling API requests
* **models**: Mongoose models for database schema
* **routes**: Route handlers for API endpoints
* **utils**: Utility functions for authentication and logging

## Getting Started
### Prerequisites
* Node.js (>= 16.0.0)
* MongoDB (>= 4.0.0)
* React (>= 17.0.0)

### Installation
1. Clone the repository: `git clone https://github.com/kaihere14/Nova_Drive.git`
2. Navigate to the project directory: `cd Nova_Drive`
3. Install dependencies:
	* Frontend: `npm install` (in the `client` directory)
	* Backend: `npm install` (in the `server` directory)
4. Create a `.env` file in the `server` directory with the following variables:
	* `MONGO_URI`: MongoDB connection string
	* `PORT`: Server port number
	* `SECRET_KEY`: Secret key for authentication

### Configuration
* **Backend**:
	+ `config/db.config.js`: Configure MongoDB connection
	+ `config/index.ts`: Configure server port and secret key
* **Frontend**:
	+ `config.js`: Configure API endpoints

### Usage
1. Start the backend server: `npm start` (in the `server` directory)
2. Start the frontend development server: `npm start` (in the `client` directory)
3. Open the application in your web browser: `http://localhost:5173`

## API Documentation
### Endpoints
* **GET /api/chunks**: Retrieve a list of file chunks
* **POST /api/chunks**: Upload a new file chunk
* **GET /api/user**: Retrieve user information
* **POST /api/user**: Create a new user
* **GET /api/files**: Retrieve a list of files
* **POST /api/files**: Upload a new file
* **GET /api/folders**: Retrieve a list of folders
* **POST /api/folders**: Create a new folder

### Request/Response Examples
* **GET /api/chunks**:
	+ Request: `axios.get('https://backend.novadrive.space/api/chunks')`
	+ Response: `[{"id": 1, "filename": "example.txt", "chunk": "chunk1"}]`
* **POST /api/chunks**:
	+ Request: `axios.post('https://backend.novadrive.space/api/chunks', { filename: 'example.txt', chunk: 'chunk1' })`
	+ Response: `{"id": 1, "filename": "example.txt", "chunk": "chunk1"}`

## Contributing
Contributions are welcome! Please submit a pull request with your changes and a detailed description of the modifications.

## License
Nova Drive is licensed under the MIT License.

## Roadmap
* **v1.0**: Initial release with basic features
* **v1.1**: Add file sharing and real-time updates
* **v1.2**: Improve user authentication and authorization
* **v2.0**: Add support for multiple storage providers
i am govind 

## Troubleshooting
* **Error: Unable to connect to MongoDB**: Check the `MONGO_URI` environment variable and ensure the MongoDB instance is running.
* **Error: Invalid API endpoint**: Check the API endpoint URL and ensure it matches the configured endpoint in the `config.js` file.

## Credits
* **Author**: [Kaihere14](https://github.com/kaihere14)
* **Contributors**: [List of contributors](https://github.com/kaihere14/Nova_Drive/graphs/contributors)
