# BVRIT CONNECT

This project is a web application built with Vite, React, TypeScript, shadcn/ui, and Tailwind CSS. It serves as a platform for students and alumni, likely for an educational institution, to connect, discover events and opportunities, and manage their profiles. Firebase is utilized for backend services, including authentication and analytics (Project ID: `minor-project-64ad1`).

## Features

*   User authentication (login/registration)
*   Separate dashboards for students and alumni
*   Private routes and user type-based redirection
*   Sections for:
    *   Events
    *   Opportunities
    *   Student Community
    *   User Profiles
    *   About Page
*   Modern UI built with shadcn/ui and Tailwind CSS
*   Toast notifications for user feedback

## Technologies Used

*   **Frontend:**
    *   React
    *   TypeScript
    *   Vite (build tool)
    *   React Router (navigation)
    *   shadcn/ui (UI components)
    *   Tailwind CSS (styling)
    *   `@tanstack/react-query` (data fetching and state management)
*   **Backend:**
    *   Firebase (Authentication, Analytics, potentially Firestore/Realtime Database)
*   **Linting/Formatting:**
    *   ESLint

## Project Structure

The main application code resides in the `Adbhutha/src/` directory:

```
Adbhutha/
├── public/
├── src/
│   ├── components/  # Reusable UI components
│   ├── pages/       # Top-level page components
│   ├── services/    # Services for API calls, Firebase interactions, etc.
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Utility functions and libraries
│   ├── types/       # TypeScript type definitions
│   ├── App.tsx      # Main application component with routing
│   ├── main.tsx     # Application entry point, Firebase initialization
│   ├── firebase.ts  # Firebase configuration (if not fully in main.tsx)
│   ├── AuthContext.tsx # Authentication context
│   └── index.css    # Global styles
├── package.json     # Project dependencies and scripts
├── vite.config.ts   # Vite configuration
├── tsconfig.json    # TypeScript configuration
└── ... (other configuration files)
```

## Getting Started

### Prerequisites

*   Node.js and npm (or yarn) installed. It's recommended to use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to manage Node.js versions.
*   Firebase project setup (if you intend to run your own backend). The current configuration points to `minor-project-64ad1`. You might need to create your own Firebase project and update the configuration in `Adbhutha/src/main.tsx` (and potentially `Adbhutha/src/firebase.ts` if it exists and contains config).

### Installation and Running Locally

1.  **Clone the repository (if you haven't already):**
    ```bash
    # If you have access to the original repository
    # git clone <YOUR_GIT_URL>
    # cd <YOUR_PROJECT_DIRECTORY_NAME>

    # If you are working with the local files directly, navigate to the Adbhutha directory
    cd Adbhutha
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    This will start the Vite development server, typically on `http://localhost:5173`.

### Building for Production

```bash
npm run build
# or
yarn build
```
This command will create a `dist` folder in the `Adbhutha` directory with the production-ready assets.

## Available Scripts

In the `Adbhutha` directory, you can run the following scripts (defined in `package.json`):

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run build:dev`: Builds the application in development mode.
*   `npm run lint`: Lints the codebase using ESLint.
*   `npm run preview`: Serves the production build locally for preview.

## Further Development

*   **Pages**: New application pages can be added in `Adbhutha/src/pages/` and corresponding routes in `Adbhutha/src/App.tsx`.
*   **Components**: Reusable UI elements should be placed in `Adbhutha/src/components/`.
*   **Services**: Logic for interacting with Firebase or other APIs should be encapsulated in `Adbhutha/src/services/`.

## Contributing

Pull requests are welcomed!

