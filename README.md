# Accessible Learning — Lab 6 (REST API, External Data & AI Integration)

Full-stack React + Node.js/Express web application designed to support students with dyslexia through customizable reading settings, a word pronunciation helper, and AI-powered text simplification.

## Part 1: Backend REST API Endpoints
- `GET /api/status` — checks backend server status (`200 OK`).
- `GET /api/items` — returns the list of learning resources (`200 OK`).
- `POST /api/items` — adds a new learning resource with validation (`201 Created` / `400 Bad Request`).
- `PATCH /api/items/:id` — updates an existing resource (`200 OK` / `400 Bad Request` / `404 Not Found`).
- `DELETE /api/items/:id` — deletes a resource by ID (`204 No Content` / `404 Not Found`).

## Part 2: External Public API
- **API Used:** Free Dictionary API (`https://api.dictionaryapi.dev/api/v2/entries/en/<word>`)
- **Backend Endpoint:** `GET /api/dictionary/:word`
- **Description:** Calls the external dictionary API from Express, returns only relevant fields (`word`, `phonetic`, `audioUrl`, `partOfSpeech`, `definition`, `example`), and displays `loading`, `success`, and `error` states in React.

## Part 3: AI Feature
- **Library & Model:** Transformers.js (`@huggingface/transformers`) running `Xenova/flan-t5-small` (`text2text-generation`) on the Node/Express backend.
- **Backend Endpoint:** `POST /api/ai/simplify`
- **Description:** Rewrites a selected learning resource's description into short, easy-to-read text for students with dyslexia.

## Environment Variables
Create a `.env` file inside the `server/` folder:
```env
PORT=5000
```

## How to Run
1. **Start the Backend (Terminal 1):**
   ```bash
   cd server
   npm install
   node server.js
   ```
   Backend runs at `http://localhost:5000`.

2. **Start the Frontend (Terminal 2):**
   ```bash
   npm install
   npm run dev
   ```
   Frontend runs at `http://localhost:5173`.