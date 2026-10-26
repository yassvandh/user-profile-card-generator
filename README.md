# ✦ Dynamic Profile Card Generator

A full-stack web application where users enter their details and receive a beautifully rendered profile card — powered by a **Flask REST API** on the backend and **Vanilla HTML/CSS/JS** on the frontend.

---

## Project Structure

```
profile-card-generator/
├── backend/
│   ├── app.py            ← Flask REST API
│   └── requirements.txt  ← Python dependencies
├── frontend/
│   ├── index.html        ← App layout & HTML
│   ├── style.css         ← Dark glassmorphism UI
│   └── app.js            ← Fetch logic, validation, card renderer
└── README.md
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.8 or higher |
| pip | bundled with Python |
| Any modern browser | Chrome, Firefox, Edge, Safari |

---

## ⚡ Quick Start

### Step 1 — Set up the Backend

Open a terminal in the **project root** and run:

```bash
# Navigate to backend folder
cd backend

# (Recommended) create a virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask development server
python app.py
```

You should see:
```
🚀  Profile Card Generator API running on http://localhost:5000
```

> The Flask server **must stay running** while you use the app.

---

### Step 2 — Open the Frontend

Open a **second terminal** (or use File Explorer) and open the frontend:

```bash
# From project root
cd frontend
start index.html        # Windows
# OR double-click index.html in File Explorer
```

> No Node.js or build step required — it's pure HTML/CSS/JS.

---

## API Reference

### `POST /api/profile`

**Request body (JSON):**

```json
{
  "name": "Alex Johnson",
  "bio": "Creative developer who enjoys building useful applications.",
  "image_url": "https://example.com/profile.jpg"
}
```

**Success response (HTTP 200):**

```json
{
  "success": true,
  "profile": {
    "name": "Alex Johnson",
    "bio": "Creative developer who enjoys building useful applications.",
    "image_url": "https://example.com/profile.jpg",
    "initials": "AJ",
    "created_at": "October 26, 2024 at 05:30 UTC"
  },
  "message": "Profile created successfully"
}
```

**Error response (HTTP 400):**

```json
{
  "success": false,
  "error": "'name' is required and cannot be empty."
}
```

### `GET /health`

Returns `{"status": "ok"}` — useful to verify the backend is running.

---

## Testing the Application

### Manual testing checklist

| Scenario | Expected Result |
|----------|----------------|
| Fill all fields and submit | Profile card appears on the right |
| Leave Name empty | Inline validation error shown |
| Leave Bio empty | Inline validation error shown |
| Enter invalid image URL | Warning shown, interface doesn't break |
| Submit when backend is offline | Friendly error message displayed |
| Click "Create Another" | Form resets, card hides |

### Test the API directly with curl

```bash
# Valid request
curl -X POST http://localhost:5000/api/profile \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Johnson","bio":"Creative developer.","image_url":""}'

# Missing name — should return 400
curl -X POST http://localhost:5000/api/profile \
  -H "Content-Type: application/json" \
  -d '{"name":"","bio":"Hello world"}'
```

---

## How It Works

### 1. POST Request Flow

```
User clicks "Generate Profile Card"
  │
  ▼
app.js validates the form fields locally
  │
  ▼
fetch('http://localhost:5000/api/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, bio, image_url })
})
  │
  ▼
Flask app.py receives the request
  → validates fields
  → builds profile object
  → returns JSON response
  │
  ▼
app.js receives the JSON
  → on success: calls renderProfileCard(profile)
  → on error:   shows error message in the form
```

### 2. CORS

`flask-cors` is configured to allow all origins during development, so the browser's same-origin policy doesn't block requests from the file-based frontend.

### 3. No Database

All data lives only in memory for the duration of the request — no database is needed.

---

## Dependencies

**Backend (`requirements.txt`):**
- `flask` — web framework
- `flask-cors` — Cross-Origin Resource Sharing support

**Frontend:** Zero dependencies. Pure HTML, CSS, and JavaScript.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ERR_CONNECTION_REFUSED` | Make sure `python app.py` is running |
| `ModuleNotFoundError: flask` | Run `pip install -r requirements.txt` |
| Image doesn't load | Check the URL is publicly accessible |
| CORS error in browser | Ensure `flask-cors` is installed and backend is running |
