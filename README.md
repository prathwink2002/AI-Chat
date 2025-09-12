# AI WhatsApp-Style Chat Application


This is a full-stack web application that mimics the functionality of a chat application like WhatsApp, with an integrated AI for automated replies.

## Tech Stack

- **Frontend**: React, `react-icons`
- **Backend**: Node.js, Express.js, `pg` for PostgreSQL connection
- **Database**: PostgreSQL
- **AI Integration**: OpenRouter API

## setup 

- ensure you have the following installed:
- [Node.js](https://nodejs.org/) (which includes npm)
- [PostgreSQL](https://www.postgresql.org/download/)

## How to run 

- **To run**:
  1. Install PostgreSQL and create database `ai-chat`.
  2. open terminal then `cd server` then `npm install` then `node index.js` or `npm start`
  3. open new terminal then ` cd client` then `npm install` then `npm start`

**Notes**
- This project **includes** the OpenRouter / OpenAI API key and model string where you provided them (for demonstration). Treat keys as secrets in real projects.

**Note:** The AI response in the chat may take a few seconds to load. This is because the application uses a free model from the OpenRouter API to generate replies.

## How to get openrouter api kay

- open (https://openrouter.ai/) and register/login then create api key


## Features
- **Registration and Login**:Register using your name, mobile number, password and Login using mobile number and password.
- **Contact Management**: Add, delete, and rename contacts.
- **Real-time Chat**: Send and receive messages from contacts.
- **AI-Powered Auto-Replies**: The backend integrates with OpenRouter to generate and send  automatic replies.
- **Chat Management**: Clear entire chat histories or delete individual messages.
- **Message Forwarding**: Forward messages to other contacts.
- **Search Functionality**: Search through chats and contacts.
- **Responsive UI**: A clean, modern interface built with React.

## Project Structure

The project is organized into a `client` directory for the frontend application and a `server` directory for the backend API.

## Overview
Simple WhatsApp-like UI (Chat / Contacts) with Express backend, PostgreSQL storage, and auto-reply using OpenRouter model.

**Database**
- name: ai-chat
- user: postgres (adjust if needed)
- password: root



## Architecture

The application follows a classic client-server architecture:

-   **Frontend (Client)**: A Single Page Application (SPA) built with **React**. It provides the user interface for interacting with chats and contacts. It communicates with the backend via a RESTful API to fetch and manipulate data.

-   **Backend (Server)**: A **Node.js** server using the **Express** framework. It exposes a REST API that the client consumes. The server is responsible for all business logic, including:
    -   CRUD operations for contacts and messages.
    -   Connecting to the PostgreSQL database.
    -   Integrating with the **OpenRouter AI** service to generate auto-replies.

-   **Database**: A **PostgreSQL** database is used for data persistence. It stores information about contacts and their corresponding messages.


## Technologies & Dependencies

## rontend (Client-side)
**Framework/Library**: React.js: The core library for building the user interface. (App.js, index.js) 
**Language**: JavaScript (ES6+): Used for all the client-side logic, including async/await for API calls.
**Styling**: CSS: For styling the application components. (styles.css)
**Dependencies/Libraries**:`react-dom`: To render the React components into the DOM. (index.js)
`react-icons`: Used for including icons like FaCommentDots, FaSearch, etc., in the UI. (App.js)

## Backend (Server-side)
**Environment**:
**Node.js**: The JavaScript runtime environment for the server.
**Framework**: Express.js: A web application framework for Node.js used to build the REST API. (server/index.js)
**Database**: PostgreSQL: The relational database used to store contacts and messages. The server uses the pg library to connect to it. (server/index.js)
**Language**: JavaScript (Node.js): Used for all server-side logic.
**Dependencies/Libraries**:
`express`: The main web server framework.
`cors`: Express middleware to enable Cross-Origin Resource Sharing (CORS).
`body-parser`: Express middleware to parse incoming request bodies (e.g., JSON).
`pg`: The Node.js client for PostgreSQL.
`dotenv`: To load environment variables from a .env file (like API keys and database credentials).
`node-fetch`: To make HTTP requests from the server to the OpenRouter AI API.




## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (which includes npm)
- [PostgreSQL](https://www.postgresql.org/download/)
