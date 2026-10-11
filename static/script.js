let activeSessionId = null;
let activeBreakId = null;

const startBtn = document.getElementById("start-session-btn");
const endBtn = document.getElementById("end-session-btn");
const sessionStatus = document.getElementById("session-status");
const startBreakBtn = document.getElementById("start-break-btn");
const endBreakBtn = document.getElementById("end-break-btn");
const breakStatus = document.getElementById("break-status");
const saveSleepBtn = document.getElementById("save-sleep-btn");
const sleepStatus = document.getElementById("sleep-status");

startBtn.addEventListener("click", function () {
    const assignment = document.getElementById("assignment").value.trim();
    const expectedMinutes = parseInt(document.getElementById("expected-minutes").value, 10);

    if (!assignment || !Number.isInteger(expectedMinutes) || expectedMinutes < 1) {
        sessionStatus.innerText = "Enter an assignment and a valid work time.";
        return;
    }

    if (activeSessionId !== null) {
        sessionStatus.innerText = "End your current session first.";
        return;
    }

    fetch("/start-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignment: assignment, expected_minutes: expectedMinutes })
    })
    .then(res => {
        if (!res.ok) throw new Error("Could not start session.");
        return res.json();
    })
    .then(data => {
        activeSessionId = data.session_id;
        sessionStatus.innerText = "Session started: " + assignment;
    })
    .catch(err => { sessionStatus.innerText = err.message; });
});

endBtn.addEventListener("click", function () {
    if (activeSessionId === null) {
        sessionStatus.innerText = "There is no active session to end.";
        return;
    }

    if (activeBreakId !== null) {
        sessionStatus.innerText = "End your current break before ending the session.";
        return;
    }

    fetch("/end-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: activeSessionId })
    })
    .then(res => {
        if (!res.ok) throw new Error("Could not end session.");
        return res.json();
    })
    .then(data => {
        sessionStatus.innerText = "Session ended. Duration: " + data.duration_minutes + " minutes.";
        activeSessionId = null;
    })
    .catch(err => { sessionStatus.innerText = err.message; });
});

startBreakBtn.addEventListener("click", function () {
    if (activeSessionId === null) {
        breakStatus.innerText = "Start a session before taking a break.";
        return;
    }

    if (activeBreakId !== null) {
        breakStatus.innerText = "End your current break first.";
        return;
    }

    const note = document.getElementById("break-note").value.trim();

    fetch("/start-break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: activeSessionId, note: note })
    })
    .then(res => {
        if (!res.ok) throw new Error("Could not start break.");
        return res.json();
    })
    .then(data => {
        activeBreakId = data.break_id;
        breakStatus.innerText = "Break started.";
    })
    .catch(err => { breakStatus.innerText = err.message; });
});

endBreakBtn.addEventListener("click", function () {
    if (activeBreakId === null) {
        breakStatus.innerText = "No active break to end.";
        return;
    }

    fetch("/end-break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: activeSessionId, break_id: activeBreakId })
    })
    .then(res => {
        if (!res.ok) throw new Error("Could not end break.");
        return res.json();
    })
    .then(data => {
        breakStatus.innerText = "Break ended. Duration: " + data.duration_minutes + " minutes.";
        activeBreakId = null;
    })
    .catch(err => { breakStatus.innerText = err.message; });
});

saveSleepBtn.addEventListener("click", function () {
    const hours = parseFloat(document.getElementById("sleep-hours").value);
    const date = document.getElementById("sleep-date").value;
    const quality = parseInt(document.getElementById("sleep-quality").value, 10);

    if (!date || isNaN(hours) || hours < 0 || hours > 24) {
        sleepStatus.innerText = "Enter a valid date and hours slept.";
        return;
    }

    fetch("/log-sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: date, hours: hours, quality: isNaN(quality) ? null : quality })
    })
    .then(res => {
        if (!res.ok) throw new Error("Could not save sleep record.");
        return res.json();
    })
    .then(() => {
        sleepStatus.innerText = "Sleep record saved for " + date + ".";
    })
    .catch(err => { sleepStatus.innerText = err.message; });
});