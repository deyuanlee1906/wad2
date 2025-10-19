* = folders that we have not implemented yet

chope-lah/
├── README.md                        # project overview + setup
├── *.gitignore
├── *.env                             # template for our environment variables (keys, tokens, or secrets).
├── package.json                     # tells npm which commands to run, and which tools or libraries your project depends on
│
├── src/                             # [1] CLIENT — current static website (HTML/CSS/JS)
│   ├── index.html                   # main entry page. helps to link together our css and js files.
│   ├── pages/                       # where we put our pages
│   ├── styles/                      # where we store our css files
│   │   ├──*main.css                         # holds our general layout and theme styles
│   │   ├──*components.css                   # holds our styles specific to reusable parts like buttons, navbars, seat cards and such
│   ├── scripts/                     # where our js files will lie (site's behaviour and interactivity)
│   │   ├──*main.js                          # handles most of our website logic
│   │   ├──firebaseauth.js                  # handles user login via Firebase Authentication
│   ├── partials/                    # where we can store reusable HTML parts (headers, footers, buttons, and such)
│   └── img/                         # [1] CLIENT — shared static assets (pictures and such)
│
├── *server/                         # [2] BACKEND-FOR-FRONTEND (Express API)
│   ├── index.js                     # API entry point
│   ├── routes/                      # HTTP endpoints
│   │   ├── reservations.js
│   │   └── seats.js
│   ├── services/                    # business logic (seat rules, time limits, etc.)
│   │   └── reservationsService.js
│   ├── external/                    # [3] EXTERNAL SERVICES — Where we put our external API's
│   │   ├── stripeClient.js
│   │   └── visionClient.js
│   └── db/                          # [4] DATABASE LAYER
│       ├── client.js                # DB connection (mock or Postgres)
│       └── queries/
│           ├── reservationsRepo.js
│           └── ...
│
├── docs/                            # documentation
│   ├── ARCHITECTURE.md              # document explaining the 1–4 architecture layers
│   ├── API.md                       # document explaining endpoints + data flow
│   ├── *SETUP.md                    # setup instructions
│   └── *LEGACY.md                   # notes on old static prototype
│
├── *firebase/                       # Firestore/Firebase rules if we end up implementing
│   ├── firestore.rules
│   └── README.md
│
└── *web/                            # (FOR THE FUTURE IF WE EVER WANT TO TRY A NUXT FRAMEWORK) Nuxt app folder
    ├── nuxt.config.ts               # Nuxt configuration
    ├── app/
    │   ├── pages/                   # [1] CLIENT (Vue pages)
    │   ├── components/              # [1] CLIENT (UI parts)
    │   ├── assets/                  # [1] CLIENT (CSS/Tailwind)
    │   ├── plugins/                 # [1] CLIENT (Firebase Auth client)
    │   ├── middleware/              # [1] CLIENT (auth guards)
    │   └── server/                  # Nuxt’s internal BFF
    │       ├── api/                 # [2] BFF endpoints
    │       ├── utils/               # [2] helpers (token verify, etc.)
    │       ├── external/            # [3] external APIs
    │       └── db/                  # [4] database access
    └── public/                      # [1] CLIENT (static images/icons)