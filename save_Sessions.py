import json
import uuid
from datetime import datetime
from pathlib import Path

DATA_FILE = Path(__file__).parent / "data.json"


def load_data():
    with DATA_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_data(data):
    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(data, file, indent=4)


def create_session(assignment, expected_minutes):
    start_time = datetime.now()
    end_time = datetime.now()

    session = {
        "id": str(uuid.uuid4()),
        "assignment": assignment,
        "expected_minutes": expected_minutes,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "duration_minutes": round((end_time - start_time).total_seconds() / 60, 2
        ),
        "breaks": []
    }

    data = load_data()
    data["sessions"].append(session)
    save_data(data)

    return session


if __name__ == "__main__":
    saved_session = create_session("Worked on my essay", 45)
    print("Session saved!")
    print(json.dumps(saved_session, indent=4))