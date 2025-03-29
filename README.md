
# Pokémon Card Game

## Overview

This project is a full-stack web-based Pokémon card game, developed purely for educational and learning purposes. It leverages the PokeAPI to provide accurate Pokémon data and enhance gameplay. **Please note that this is a non-profit project and does not own any of the resources used.** It features secure user authentication, session management, and is designed for serverless architecture for potential web hosting.

<a href="https://www.youtube.com/watch?v=v021D_MnzvY">
  <img src="https://raw.githubusercontent.com/Greyash-Dave/Greyash-Dave/main/images/shortify/1.PNG" alt="Watch the video">
</a>

<hr>
 <a href="https://www.youtube.com/watch?v=v021D_MnzvY">
  🔗 Watch the video on YouTube
 </a>
<hr>


## Features

-   **Pokémon Data Integration:** Utilizes the PokeAPI to fetch and display real-time Pokémon data. (Note: All data is from the PokeAPI, a publicly available resource.)
-   **Deck Builder:** Allows users to create and manage custom Pokémon card decks.
-   **Game Menu:** Provides an interface for starting and managing game sessions.
-   **Battle Field:** Facilitates the gameplay experience.
-   **User Authentication:** Secure user registration and login with bcrypt password hashing.
-   **Session Management:** Robust session handling for secure access control.
-   **Serverless Architecture:** Designed for deployment in a serverless environment for potential web hosting.
-   **Logging and Monitoring:** Implements Winston and Morgan for detailed logging and monitoring.
-   **Security:** Includes Helmet for HTTP header security and rate limiting to prevent abuse.
-   **Data Storage:** Uses Supabase with PostgreSQL for reliable data storage.

## Technologies

-   **Frontend:**
    -   React.js
    -   Framer Motion
-   **Backend:**
    -   Node.js
    -   Express.js
-   **Database:**
    -   PostgreSQL (via Supabase)
-   **Authentication:**
    -   Bcrypt
-   **Logging:**
    -   Winston
    -   Morgan
-   **Security:**
    -   Helmet
    -   express-rate-limit
-   **API Integration:**
    -   PokeAPI
-   **Session Management:**
    -   express-session
-   **CORS:**
    -   cors

## Setup

### Prerequisites

-   Node.js and npm installed.
-   Supabase account and project setup.
-   Environment variables configured (see `.env.example`).

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install server dependencies:**

    ```bash
    npm install
    ```

3.  **Install client dependencies:**

    ```bash
    cd client
    npm install
    cd ..
    ```

4.  **Configure environment variables:**

    -   Create a `.env` file in the root directory.
    -   Add the following environment variables:

        ```
        PORT=<your_server_port>
        SESSION_SECRET=<your_session_secret>
        SUPABASE_URL=<your_supabase_url>
        SUPABASE_ANON_KEY=<your_supabase_anon_key>
        FRONTEND_URL=<your_frontend_url>
        NODE_ENV=<production or development>
        ```

5.  **Run the server:**

    ```bash
    npm run dev
    ```

6.  **Run the client:**

    ```bash
    cd client
    npm run dev
    cd ..
    ```

## Project Structure
├── client/          # React.js frontend
├── node_modules/    # Node.js dependencies
├── .env             # Environment variables
├── package.json     # Node.js project configuration
├── server/          # Express.js server
├── error.log        # Error logs
├── combined.log      # Combined logs
└── README.md        # Project documentation

## API Endpoints

- `POST /register`: Registers a new user.
- `POST /login`: Authenticates a user and starts a session.
- `POST /logout`: Logs out a user and destroys the session.
- `GET /check-auth`: Checks if a user is authenticated.
- `GET /pokemon/:name`: Retrieves Pokémon data from PokeAPI or cache.
- `POST /decklist`: Saves a user's deck list.
- `GET /deckdisplay/:user`: Retrieves all deck lists for a user.
- `GET /decklist/:user/:name`: Retrieves a specific deck list for a user.
- `POST /result`: Saves battle results.
- `GET /results/:username`: Retrieves battle results for a user.

## Security

- **Password Hashing:** Uses bcrypt for secure password storage.
- **Session Management:** Secure session handling with express-session.
- **CORS:** Configured to allow requests from specified origins.
- **Helmet:** Implements various HTTP header security measures.
- **Rate Limiting:** Protects against abuse with rate limiting.
- **Input Validation:** Validates all user inputs to prevent vulnerabilities.

## Logging

- Uses Winston for structured logging.
- Uses Morgan for HTTP request logging.
- Logs are stored in `error.log` and `combined.log`.

## Deployment

This application is designed for serverless deployment and can be hosted on platforms supporting Node.js and PostgreSQL. Ensure that your Supabase instance is configured properly, and that all environment variables are correctly set for production.

## Important Note

This is a non-profit project developed purely for learning purposes. All resources used, including Pokémon data and images, are from publicly available APIs and are not owned by the developer of this project.

## Future Enhancements

- Implement real-time multiplayer functionality.
- Add more advanced game mechanics.
- Improve UI/UX with more animations and effects.
- Implement more robust error handling and user feedback.
- Add unit and integration tests.
