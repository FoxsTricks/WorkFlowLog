# WorkFlowLog

This is a productivity tracker I built to stop guessing and start seeing patterns in how I actually work.

Log your work sessions, track your breaks, record your sleep,
and review weekly summaries and graphs to understand how your habits
affect your work ethic.

## Features

- Start and end work sessions manually with timestamps and duration.
- Log your breaks during a session with optional notes.
- Record how long you sleep and the quality of it per day.
- Weekly summary — total work time, sessions, average sleep, break time, and best and worst session.
- Sleep vs productivity chart
- Break time vs work time chart

## Setup

1. Clone the repo
2. Create a virtual environment: `python -m venv .venv`
3. Activate it: `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` (Mac/Linux)
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `data.json` file in the root with: `{"sessions": [], "sleep": []}`
6. Run: `python app.py`
7. Open: `http://127.0.0.1:5000`

## Tech Stack

- Python 3, Flask
- HTML, CSS, JavaScript
- Chart.js
- JSON flat file storage