from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the frontend


def is_valid_url(url):
    """Basic URL validation for image URLs."""
    if not url:
        return True  # image_url is optional
    pattern = re.compile(
        r'^(https?://)'           # http:// or https://
        r'(\S+)'                  # domain and path
        r'(\.(jpg|jpeg|png|gif|webp|svg|bmp))?$',  # optional image extension
        re.IGNORECASE
    )
    return bool(pattern.match(url.strip()))


@app.route('/api/profile', methods=['POST'])
def create_profile():
    """
    POST /api/profile
    Accepts JSON: { name, bio, image_url }
    Returns: { success, profile, message } on success
             { success, error }           on failure
    """
    try:
        # Ensure request body is JSON
        if not request.is_json:
            return jsonify({
                "success": False,
                "error": "Request must be JSON. Set Content-Type: application/json."
            }), 400

        data = request.get_json()

        # ── Validation ──────────────────────────────────────────────────────────
        name = (data.get("name") or "").strip()
        bio  = (data.get("bio")  or "").strip()
        image_url = (data.get("image_url") or "").strip()

        errors = []

        if not name:
            errors.append("'name' is required and cannot be empty.")
        elif len(name) > 100:
            errors.append("'name' must be 100 characters or fewer.")

        if not bio:
            errors.append("'bio' is required and cannot be empty.")
        elif len(bio) > 500:
            errors.append("'bio' must be 500 characters or fewer.")

        if image_url and not is_valid_url(image_url):
            errors.append("'image_url' does not appear to be a valid URL.")

        if errors:
            return jsonify({
                "success": False,
                "error": " | ".join(errors)
            }), 400

        # ── Build profile object ─────────────────────────────────────────────────
        profile = {
            "name":      name,
            "bio":       bio,
            "image_url": image_url if image_url else None,
            "initials":  "".join(word[0].upper() for word in name.split()[:2]),
            "created_at": datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC")
        }

        return jsonify({
            "success": True,
            "profile": profile,
            "message": "Profile created successfully"
        }), 200

    except Exception as e:
        # Catch-all for unexpected errors
        return jsonify({
            "success": False,
            "error": f"An unexpected server error occurred: {str(e)}"
        }), 500


@app.route('/health', methods=['GET'])
def health():
    """Simple health-check endpoint."""
    return jsonify({"status": "ok", "message": "Backend is running"}), 200


if __name__ == '__main__':
    print("Profile Card Generator API running on http://localhost:5000")
    app.run(debug=True, port=5000)
