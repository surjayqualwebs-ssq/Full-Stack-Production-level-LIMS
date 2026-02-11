# Full Stack LIMS Application (Fastify + ReactJS)

## Overview
This is a **Legal Intake Management System (LIMS)** built with a modern full-stack architecture. It is designed to streamline legal intake operations, manage samples, track workflows, and ensure data integrity.

## Tech Stack
- **Backend:** Fastify (Node.js) - High performance and low overhead.
- **Frontend:** ReactJS (Vite) - Fast and reactive user interface.
- **Database:** PostgreSQL (via Prisma/TypeORM or raw SQL depending on implementation).
- **Styling:** Tailwind CSS - Utility-first CSS framework.
- **Authentication:** JWT-based auth with Role-Based Access Control (RBAC).

## Features
- **User Management:** Admin, Staff, and Client roles.
- **Intake Tracking:** comprehensive lifecycle management of intakes and cases.
- **Case Management:** Generate detailed reports and analytics.
- **Modern UI:** Responsive design with Toast notifications and interactive dashboards.

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-folder>
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    # Set up .env file
    npm run dev
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Contributing
1.  Fork the repository.
2.  Create a fresh branch for your feature (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## License
[License Name]
