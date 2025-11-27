// ========== GridWorld Setup ===========
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

// Agent و Goal
let agent = { x: 0, y: 0 };
const goal = { x: 4, y: 4 };

// نمایش agent و goal
function render() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(c => c.className = "cell");

    const agentIndex = agent.y * gridSize + agent.x;
    const goalIndex = goal.y * gridSize + goal.x;

    cells[agentIndex].classList.add("agent");
    cells[goalIndex].classList.add("goal");
}

render();

// ========== Q-Learning Variables ==========
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

// انتخاب اکشن
function chooseAction(state) {
    if (Math.random() < epsilon) {
        return actions[Math.floor(Math.random() * actions.length)];
    }

    const acts = Q[state];
    return Object.keys(acts).reduce((a, b) => acts[a] > acts[b] ? a : b);
}

// حرکت و پاداش
function step(x, y, action) {
    let nx = x, ny = y;

    if (action === "up" && y > 0) ny--;
    if (action === "down" && y < gridSize - 1) ny++;
    if (action === "left" && x > 0) nx--;
    if (action === "right" && x < gridSize - 1) nx++;

    let reward = (nx === goal.x && ny === goal.y) ? 10 : -0.1;

    return { nx, ny, reward };
}

// اجرای یک Episode
async function runEpisode(epNumber) {
    agent = { x: 0, y: 0 };
    render();

    for (let stepNum = 0; stepNum < 30; stepNum++) {
        const state = `${agent.x},${agent.y}`;
        const action = chooseAction(state);
        const result = step(agent.x, agent.y, action);
        const nextState = `${result.nx},${result.ny}`;

        // Q Update
        const maxNextQ = Math.max(...Object.values(Q[nextState]));
        Q[state][action] =
            Q[state][action] +
            alpha * (result.reward + gamma * maxNextQ - Q[state][action]);

        agent.x = result.nx;
        agent.y = result.ny;

        render();

        if (agent.x === goal.x && agent.y === goal.y) {
            console.log(`Episode ${epNumber}: Reached GOAL`);
            break;
        }

        await new Promise(r => setTimeout(r, 200)); // حرکت مرحله‌ای
    }
}

// اجرای چند episode
async function train() {
    for (let ep = 1; ep <= 20; ep++) {
        console.log("Episode", ep);
        await runEpisode(ep);
    }
}

document.getElementById("startBtn").addEventListener("click", train);
