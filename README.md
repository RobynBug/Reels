# Reels - Full-Stack Media Tracking Architecture

Reels is a full-stack media platform designed to handle complex user data life-cycles, secure session management, and persistent viewing states. This project served as the architectural foundation and inspiration for the collaborative project **K-FEELZ**.

## 🚀 Engineering Highlights

- **Relational Data Modeling:** Architected a scalable **PostgreSQL** schema using **Prisma** to manage high-volume user interactions, including viewing history and watchlists with unique constraints to ensure data integrity.
- **Security & Session Rigor:** Engineered a professional-grade security layer using **JWT** and **Bcrypt**. Developed custom **Middleware** to extract and validate tokens from secure cookies, implementing graceful error handling for unauthorized access.
- **Asynchronous State Management:** Utilized **Redux Toolkit** and `createAsyncThunk` to manage non-deterministic API lifecycles (pending, fulfilled, rejected), ensuring the UI remains responsive during high-latency media fetching.
- **Media Preview Logic:** Developed a dynamic preview system that utilizes conditional rendering to provide users with a video/modal preview of media assets before engagement.

## 🛠️ Technical Toolbox

- **Frontend:** React, Redux Toolkit, CSS3 (Flexbox/Grid)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL, Prisma ORM
- **Auth:** JSON Web Tokens (JWT), Bcrypt, Cookie-parser
- **APIs:** The Movie Database (TMDB) API

## 🧩 Architectural Implementation

### Backend Security Flow
The application utilizes a custom `authenticateToken` middleware that acts as a gatekeeper for all media routes. By verifying signatures against a protected `JWT_SECRET`, the system prevents unauthorized data tampering.

### Persistence Engine
Leveraging Prisma's `upsert` logic, the viewing history tracker ensures that user engagement is recorded in real-time. If a user re-watches a title, the system updates the `watchedAt` timestamp rather than creating redundant entries, maintaining a clean and performant database.

## 📈 Evolution to K-FEELZ
Reels provided the core authentication and media fetching logic that was later scaled into **K-FEELZ**. The transition involved moving from a search-based discovery model to a weighted, logic-driven recommendation engine.
