# Nova Drive
================

## Overview
--------

Nova Drive is a full-stack web application built with a React frontend and an Express.js backend. The application provides a cloud-based file storage and management system, allowing users to upload, download, and manage their files.

## Features
--------

*   **File Upload and Download**: Users can upload files to the cloud storage and download them as needed.
*   **File Management**: Users can manage their files, including renaming, deleting, and organizing them into folders.
*   **User Authentication**: Users can register and log in to their accounts, with authentication handled by Google OAuth.
*   **Health Check Endpoint**: A health check endpoint is provided to monitor the server's status.
*   **Error Handling**: The application includes robust error handling, with logging and error reporting mechanisms in place.

## Installation
------------

To install the application, follow these steps:

### Client-Side Installation

1.  Navigate to the `client` directory: `cd client`
2.  Install the required dependencies: `npm install`
3.  Start the development server: `npm run dev`

### Server-Side Installation

1.  Navigate to the `server` directory: `cd server`
2.  Install the required dependencies: `npm install`
3.  Start the development server: `npm run dev`

## Usage
-----

To use the application, follow these steps:

1.  Open a web browser and navigate to `http://localhost:5173` (or the URL specified in your `BASE_URL` environment variable).
2.  Register for an account or log in using Google OAuth.
3.  Upload files to the cloud storage by clicking the "Upload" button.
4.  Manage your files by renaming, deleting, or organizing them into folders.

## API Endpoints
-------------

The application provides the following API endpoints:

*   **GET /**: Returns a welcome message.
*   **GET /health**: Returns the server's health status.
*   **POST /api/chunks**: Uploads a file to the cloud storage.
*   **GET /api/user**: Retrieves the current user's information.
*   **POST /api/files**: Creates a new file.
*   **GET /api/files**: Retrieves a list of files.
*   **DELETE /api/files**: Deletes a file.
*   **POST /api/folders**: Creates a new folder.
*   **GET /api/folders**: Retrieves a list of folders.
*   **DELETE /api/folders**: Deletes a folder.

## Environment Variables
-----------------------

The application uses the following environment variables:

*   **NODE_ENV**: Specifies the environment (e.g., "production" or "development").
*   **PORT**: Specifies the port number for the server.
*   **BASE_URL**: Specifies the base URL for the client-side application.

## Contributing
------------

To contribute to the application, follow these steps:

1.  Fork the repository: `git fork https://github.com/kaihere14/Nova_Drive.git`
2.  Clone the repository: `git clone https://github.com/your-username/Nova_Drive.git`
3.  Create a new branch: `git branch feature/your-feature`
4.  Make changes and commit them: `git add .` and `git commit -m "Your commit message"`
5.  Push the changes to your fork: `git push origin feature/your-feature`
6.  Create a pull request: Submit a pull request to the main repository.

## License
-------

The application is licensed under the ISC License.

## Acknowledgments
---------------

The application uses the following third-party libraries and frameworks:

*   **React**: A JavaScript library for building user interfaces.
*   **Express.js**: A Node.js web framework.
*   **Google OAuth**: A authentication library for Google OAuth.
*   **Mongoose**: A MongoDB ORM library.
*   **Winston**: A logging library.

## Contact
-------

For questions or concerns, please contact the maintainer at [your-email@example.com](mailto:your-email@example.com).