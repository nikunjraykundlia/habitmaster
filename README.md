# HabitMaster

HabitMaster is a full-stack web application designed to help you build and maintain positive habits. Track your progress, visualize your consistency on a calendar, and stay motivated on your journey to self-improvement.

## ✨ Features

*   **Habit Creation:** Easily add new habits you want to track.
*   **Daily Tracking:** Mark habits as complete for each day.
*   **Calendar View:** Visualize your progress and streaks on an interactive calendar.
*   **Data Persistence:** Your habit data is securely stored in a PostgreSQL database.
*   **RESTful API:** A robust backend powered by Express.js to manage your data.

## 🛠️ Tech Stack

*   **Frontend:**
    *   [Vite](https://vitejs.dev/) - Next-generation frontend tooling
    *   [React](https://reactjs.org/) - A JavaScript library for building user interfaces
    *   [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript for robust applications
    *   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
*   **Backend:**
    *   [Node.js](https://nodejs.org/) - JavaScript runtime environment
    *   [Express.js](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
    *   [TypeScript](https://www.typescriptlang.org/)
*   **Database:**
    *   [PostgreSQL](https://www.postgresql.org/) - A powerful, open-source object-relational database system
    *   [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM for SQL databases

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/en/download/) (v20 or later recommended)
*   [npm](https://www.npmjs.com/get-npm)
*   [PostgreSQL](https://www.postgresql.org/download/)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/nikunjraykundlia/habitmaster.git
    cd habitmaster
    ```

2.  **Install dependencies:**
    This project uses a single `package.json` for both the client and server.
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your database connection string:
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
    ```

4.  **Run database migrations:**
    (Assuming a migration script is configured in `package.json`)
    ```sh
    npm run db:push
    ```

5.  **Run the application:**
    This command starts both the backend server and the frontend development server.
    ```sh
    npm run dev
    ```
    *   The backend will be running on `http://localhost:5000`.
    *   The frontend will be accessible at the URL provided by Vite (usually `http://localhost:5173`).

## 📁 Project Structure

```
.
├── client/         # Frontend React application
│   ├── src/
│   └── ...
├── server/         # Backend Express.js application
│   ├── src/
│   └── ...
├── shared/         # Shared code/types between client and server
└── ...
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
