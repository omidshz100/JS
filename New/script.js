// Grid Setup ==========================
const gridSize = 5;
const grid = document.getElementById("grid");

function createGrid() {
    grid.innerHTML = "";
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        grid.appendChild(cell);
    }
}
createGrid();

let agent = { x: 0, y: 0 };
const goal = { x: 4, y: 4 };

function render() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(c => c.className = "cell");

    const agentIndex = agent.y * gridSize + agent.x;
    const goalIndex = goal.y * gridSize + goal.x;

    cells[agentIndex].classList.add("agent");
    cells[goalIndex].classList.add("goal");
}
render();

// Q-Learning ==========================
const actions = ["up", "down", "left", "right"];
let Q = {};

function initQ() {
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            Q[`${x},${y}`] = { up: 0, down: 0, left: 0, right: 0 };
        }
    }
}
initQ();

const alpha = 0.1;
const gamma = 0.9;
const epsilon = 0.2;

function chooseAction(state) {
    if (Math.random() < epsilon) {
        return actions[Math.floor(Math.random() * actions.length)];
    }
    const act = Q[state];
    return Object.keys(act).reduce((a, b) => act[a] > act[b] ? a : b);
}

function step(x, y, action) {
    let nx = x, ny = y;

    if (action === "up" && y > 0) ny--;
    if (action === "down" && y < gridSize - 1) ny++;
    if (action === "left" && x > 0) nx--;
    if (action === "right" && x < gridSize - 1) nx++;

    let reward = (nx === goal.x && ny === goal.y) ? 10 : -0.1;

    return { nx, ny, reward };
}

// Chart Setup ==========================
const ctx = document.getElementById("chart").getContext("2d");

const chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "پاداش کل در هر اپیزود",
            data: [],
            borderWidth: 2,
            borderColor: "blue",
            fill: false
        }]
    },
    options: {
        responsive: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Episode (شماره اپیزود)",
                    font: { size: 14 }
                }
            },
            y: {
                title: {
                    display: true,
                    text: "Total Reward (مجموع پاداش)",
                    font: { size: 14 }
                },
                beginAtZero: false
            }
        }
    }
});


// Episode Execution =====================
async function runEpisode(ep) {
    agent = { x: 0, y: 0 };
    render();

    let totalReward = 0;
    let delay = parseInt(document.getElementById("speedInput").value); // 👈 سرعت انیمیشن

    for (let i = 0; i < 30; i++) {
        const state = `${agent.x},${agent.y}`;
        const action = chooseAction(state);

        const result = step(agent.x, agent.y, action);
        const nextState = `${result.nx},${result.ny}`;

        const maxNextQ = Math.max(...Object.values(Q[nextState]));

        Q[state][action] =
            Q[state][action] +
            alpha * (result.reward + gamma * maxNextQ - Q[state][action]);

        agent.x = result.nx;
        agent.y = result.ny;

        totalReward += result.reward;
        render();

        if (agent.x === goal.x && agent.y === goal.y) break;

        await new Promise(r => setTimeout(r, delay)); // 👈 اعمال سرعت انتخاب‌شده
    }

    chart.data.labels.push(ep);
    chart.data.datasets[0].data.push(totalReward);
    chart.update();
}


async function train() {
    let episodes = parseInt(document.getElementById("episodesInput").value);

    // پاک‌سازی نمودار قبلی
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();

    for (let ep = 1; ep <= episodes; ep++) {
        await runEpisode(ep);
    }
}


document.getElementById("startBtn").onclick = train;
