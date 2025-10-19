# Chope Lah
A web application that allows users to “chope” (reserve) seats at hawker centres in Singapore.

Built using HTML, CSS, and JavaScript for the frontend.

## Overview
Chope Lah helps hawker centre visitors check available seats, reserve them temporarily, and manage their reservations online.

The system aims to reduce congestion, improve fairness, and provide a digital experience for community dining spaces.

## Project Overview
Refer to `docs/ARCHITECTURE.md` and `docs/FILESTRUCTURE.md` for detailed documentation on the system architecture and file structure.

## Project Structure

```
chope-lah/
├── src/                    # Frontend client code
│   ├── index.html         # Main entry page (login/signup)
│   ├── pages/             # Application pages
│   ├── styles/            # CSS files
│   │   ├── main.css       # General layout & theme
│   │   └── components.css # Reusable component styles
│   ├── scripts/           # JavaScript files
│   │   ├── main.js        # Core application logic
│   │   └── firebaseauth.js # Firebase authentication
│   ├── partials/          # Reusable HTML components
│   └── img/               # Static images
├── server/                # Backend-for-Frontend API (placeholder)
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── external/          # External API integrations
│   └── db/                # Database layer
└── docs/                  # Documentation
```

## Running The Website

### Install Dependencies
```bash
npm install
```

### Run Project Locally
```bash
npm run dev
```

### Open On Browser
http://localhost:5173

## Features
- User authentication (Firebase)
- Seat reservation system
- Community feed/reviews
- Online food ordering
- Profile management
- Real-time crowd monitoring (coming soon)