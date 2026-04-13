# Reels

A full-stack web application for sharing short video content, built with React and Node.js.

## Tech Stack

### Frontend
*   **Framework:** React (Vite)
*   **State Management:** Redux Toolkit
*   **Routing:** React Router DOM
*   **Styling:** Tailwind CSS
*   **HTTP Client:** Axios

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database ORM:** Prisma
*   **Authentication:** JWT, bcrypt
*   **Utilities:** cookie-parser, cors, dotenv

## Getting Started

### Prerequisites
*   Node.js installed
*   npm or yarn
*   Database (configured via Prisma)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Reels
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    # Create a .env file and configure DATABASE_URL and JWT_SECRET
    npx prisma generate
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend:**
    ```bash
    cd backend
    npm run dev
    ```

2.  **Start the Frontend:**
    ```bash
    cd frontend
    npm run dev
    ```
