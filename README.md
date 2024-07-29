# Manzoma Archive ll Mosha Backend System

This repository contains the backend code for the Manzoma Archive ll Mosha system, built to manage the upload and storage of faxes.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Manzoma Archive ll Mosha is a backend system designed to facilitate the upload, storage, and management of faxes. It provides a robust API for handling file uploads and managing related documents.

## Features

- File upload and storage
- CRUD operations for managing faxes
- Relationship management between documents
- RESTful API design

## Tech Stack

- **MongoDB**: NoSQL database for data storage
- **Express.js**: Web framework for building the backend API
- **Node.js**: JavaScript runtime for server-side development
- **Multer**: Middleware for handling file uploads

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js (version 14.x or higher)
- npm (version 6.x or higher)
- MongoDB

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/RoQaa/Dar_ll_mosha.git
   cd Dar_ll_mosha
2. **Install dependencies:**
    ```bash
    npm install

3. **Set up environment variables:**
    ```bash
    Create a .env file in the root directory and add the following environment variables:
    NODE_ENV=development
    PORT=5000
    DATABASE=mongodb://localhost:27017/manzomaArchive
    UPLOADS_DIR=./public/uploads
    JWT_SECRET=secret_key
    JWT_EXPIRES_IN=time
    JWT_COOKIE_EXPIRES_IN=time
    URL_SERVER=127.0.0.1:5000/api/v1

4. **Run the server:**
    ```bash
    npm start
The server will start on http://localhost:5000.
    
## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.



