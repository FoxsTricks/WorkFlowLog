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
        loadSummary();
        loadCharts();
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
        loadSummary();
        loadCharts();
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
        loadSummary();
        loadCharts();
    })
    .catch(err => { sleepStatus.innerText = err.message; });
});

function loadSummary() {
    fetch("/get-summary")
    .then(res => res.json())
    .then(data => {
        document.getElementById("summary-work").innerText =
            data.total_work_minutes !== null ? data.total_work_minutes + " min" : "—";
        document.getElementById("summary-sessions").innerText =
            data.session_count !== null ? data.session_count : "—";
        document.getElementById("summary-sleep").innerText =
            data.avg_sleep_hours !== null ? data.avg_sleep_hours + " hrs" : "—";
        document.getElementById("summary-breaks").innerText =
            data.total_break_minutes !== null ? data.total_break_minutes + " min" : "—";
        document.getElementById("summary-best").innerText =
            data.best_session || "—";
        document.getElementById("summary-worst").innerText =
            data.worst_session || "—";
    });
}

function loadCharts() {
    fetch("/get-chart-data")
    .then(res => res.json())
    .then(data => {
        const spData = data.sleep_productivity;
        const bData = data.breaks;

        const spCanvas = document.getElementById("sleep-productivity-chart");
        const bCanvas = document.getElementById("break-chart");

        if (window.spChart) window.spChart.destroy();
        if (window.bChart) window.bChart.destroy();

        window.spChart = new Chart(spCanvas, {
            type: "bar",
            data: {
                labels: spData.map(d => d.date + " — " + d.assignment),
                datasets: [
                    {
                        label: "Sleep Hours",
                        data: spData.map(d => d.sleep_hours),
                        backgroundColor: "rgba(97, 255, 83, 0.5)",
                        borderColor: "#61ff53",
                        borderWidth: 1
                    },
                    {
                        label: "Work Minutes",
                        data: spData.map(d => d.work_minutes),
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        borderColor: "#ffffff",
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: "#ffffffd2" } } },
                scales: {
                    x: { ticks: { color: "#bbbbbb" }, grid: { color: "#003b05" } },
                    y: { ticks: { color: "#bbbbbb" }, grid: { color: "#003b05" } }
                }
            }
        });

        window.bChart = new Chart(bCanvas, {
            type: "bar",
            data: {
                labels: bData.map(d => d.date + " — " + d.assignment),
                datasets: [
                    {
                        label: "Work Minutes",
                        data: bData.map(d => d.work_minutes),
                        backgroundColor: "rgba(97, 255, 83, 0.5)",
                        borderColor: "#61ff53",
                        borderWidth: 1
                    },
                    {
                        label: "Break Minutes",
                        data: bData.map(d => d.break_minutes),
                        backgroundColor: "rgba(255, 100, 100, 0.4)",
                        borderColor: "#ff6464",
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: "#ffffffd2" } } },
                scales: {
                    x: { ticks: { color: "#bbbbbb" }, grid: { color: "#003b05" } },
                    y: { ticks: { color: "#bbbbbb" }, grid: { color: "#003b05" } }
                }
            }
        });
    });
}

loadSummary();
loadCharts();