# Friendship App

A social networking application that allows users to connect, share posts, and manage friend requests. Built with React for the frontend and Node.js with Express for the backend.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)
- [Links](#links)

## Features

- User authentication (Sign up, Sign in, Reset password)
- Create, like, and comment on posts
- Send and accept friend requests
- View friend recommendations
- User profiles with pictures and details

## Technologies Used

- **Frontend:**
  - React
  - React Router
  - Tailwind CSS
  - Axios for API calls

- **Backend:**
  - Node.js
  - Express
  - MongoDB with Mongoose
  - JWT for authentication
  - SendGrid for email notifications

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SakshamTolani/friendship-app.git
   cd friendship-app
   ```

2. Install dependencies for both the client and server:
   ```bash
   # For the server
   cd server
   npm install

   # For the client
   cd client
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `server` directory and add your MongoDB URI, JWT secret, and SendGrid API key.

## Usage

1. Start the server:
   ```bash
   cd server
   npm start
   ```

2. Start the client:
   ```bash
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000` to view the application.

## API Endpoints

- **User Authentication:**
  - `POST /signup` - Register a new user
  - `POST /signin` - Log in a user
  - `POST /reset-password` - Request a password reset
  - `POST /new-password` - Set a new password

- **Posts:**
  - `GET /allpost` - Retrieve all posts
  - `PUT /like` - Like a post
  - `PUT /unlike` - Unlike a post
  - `PUT /comment` - Comment on a post

- **Friend Management:**
  - `GET /friend-recommendations` - Get friend recommendations
  - `PUT /accept-friend-request` - Accept a friend request
  - `PUT /remove-friend` - Remove a friend

## Environment Variables

Make sure to create a `.env` file in the `server` directory with the following variables:

```
MONGOURI=<Your MongoDB URI>
JWT_SECRET=<Your JWT Secret>
SENDGRID_API=<Your SendGrid API Key>
EMAIL=<Your Email>
```

## Client Environment Variables

The client application requires certain environment variables to be set in the `.env` file. This file should be located in the `client` directory. Below are the required variables and their descriptions:

### Configuration

Create a `.env` file in the `client` directory with the following content:

```
REACT_APP_CLOUDINARY_PLACEHOLDER=https://res.cloudinary.com/sakshamtolani/image/upload/v1736591256/ifghradhluaq9tyuwenw.png
REACT_APP_CLOUDINARY_UPLOAD=https://api.cloudinary.com/v1_1/<your_username>/image/upload
REACT_APP_CLOUDINARY_CLOUD_NAME=<cloudinary_cloud_name>
REACT_APP_CLOUDINARY_UPLOAD_PRESET=<cloudinary_upload_preset_name>
```

### Variable Descriptions

- **REACT_APP_CLOUDINARY_PLACEHOLDER**: URL of the placeholder image to be used while uploading images to Cloudinary.
- **REACT_APP_CLOUDINARY_UPLOAD**: The Cloudinary API endpoint for uploading images.
- **REACT_APP_CLOUDINARY_CLOUD_NAME**: Your Cloudinary cloud name, which is required for API requests.
- **REACT_APP_CLOUDINARY_UPLOAD_PRESET**: The upload preset configured in your Cloudinary account, which defines the settings for the upload.

### Instructions

1. Create a new file named `.env` in the `client` directory.
2. Copy and paste the above configuration into the `.env` file.
3. Save the file.
4. Restart your development server to ensure the environment variables are loaded.

Make sure to keep your `.env` file secure and do not share it publicly, as it contains sensitive information related to your Cloudinary account.


## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.

## Links

- **GitHub Repository:** [friendship-app](https://github.com/SakshamTolani/friendship-app)
- **Deployed Application:** [friendship-app.onrender.com](https://friendship-app.onrender.com)
