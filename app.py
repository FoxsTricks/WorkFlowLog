from flask import Flask, render_template, request, jsonify
from datetime import datetime
import json
import uuid

DATA_FILE = "data.json"

def read_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def write_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/start-session", methods=["POST"])
def start_session():
    body = request.get_json()
    data = read_data()

    session = {
        "id": str(uuid.uuid4()),
        "assignment": body.get("assignment", ""),
        "expected_minutes": body.get("expected_minutes", 0),
        "start_time": datetime.now().isoformat(),
        "end_time": None,
        "duration_minutes": None,
        "breaks": []
    }

    data["sessions"].append(session)
    write_data(data)
    return jsonify({"status": "started", "session_id": session["id"]})

@app.route("/end-session", methods=["POST"])
def end_session():
    body = request.get_json()
    session_id = body.get("session_id")
    data = read_data()

    for session in data["sessions"]:
        if session["id"] == session_id:
            if session["end_time"] is not None:
                return jsonify({"error": "Session already ended"}), 400
            end_time = datetime.now()
            start_time = datetime.fromisoformat(session["start_time"])
            session["end_time"] = end_time.isoformat()
            session["duration_minutes"] = round(
                (end_time - start_time).total_seconds() / 60, 2
            )
            write_data(data)
            return jsonify({
                "status": "ended",
                "duration_minutes": session["duration_minutes"]
            })

    return jsonify({"error": "Session not found"}), 404

@app.route("/start-break", methods=["POST"])
def start_break():
    body = request.get_json()
    session_id = body.get("session_id")
    data = read_data()

    for session in data["sessions"]:
        if session["id"] == session_id:
            if session["end_time"] is not None:
                return jsonify({"error": "Session already ended"}), 400
            break_entry = {
                "break_id": str(uuid.uuid4()),
                "note": body.get("note", ""),
                "start_time": datetime.now().isoformat(),
                "end_time": None,
                "duration_minutes": None
            }
            session["breaks"].append(break_entry)
            write_data(data)
            return jsonify({"status": "break_started", "break_id": break_entry["break_id"]})

    return jsonify({"error": "Session not found"}), 404

@app.route("/end-break", methods=["POST"])
def end_break():
    body = request.get_json()
    session_id = body.get("session_id")
    break_id = body.get("break_id")
    data = read_data()

    for session in data["sessions"]:
        if session["id"] == session_id:
            for b in session["breaks"]:
                if b["break_id"] == break_id:
                    if b["end_time"] is not None:
                        return jsonify({"error": "Break already ended"}), 400
                    end_time = datetime.now()
                    start_time = datetime.fromisoformat(b["start_time"])
                    b["end_time"] = end_time.isoformat()
                    b["duration_minutes"] = round(
                        (end_time - start_time).total_seconds() / 60, 2
                    )
                    write_data(data)
                    return jsonify({
                        "status": "break_ended",
                        "duration_minutes": b["duration_minutes"]
                    })

    return jsonify({"error": "Break not found"}), 404

@app.route("/log-sleep", methods=["POST"])
def log_sleep():
    body = request.get_json()
    data = read_data()

    sleep_entry = {
        "date": body.get("date"),
        "hours": body.get("hours"),
        "quality": body.get("quality", None)
    }

    data["sleep"].append(sleep_entry)
    write_data(data)
    return jsonify({"status": "sleep_logged"})

if __name__ == "__main__":
    app.run(debug=True)