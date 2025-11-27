// ======================= Three.js + RL + Chart.js (Async Q-Learning) =======================

// Elements
const canvas = document.getElementById('scene');
const chartEl = document.getElementById('chart');
const episodesInput = document.getElementById('episodesInput');
const speedInput = document.getElementById('speedInput');
const startBtn = document.getElementById('startBtn');

// Renderer & Scene
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(6, 7, 10);
camera.lookAt(0, 0, 0);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Floor
const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x444444 }));
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Grid helper for clarity
scene.add(new THREE.GridHelper(10, 10, 0x333333, 0x333333));

// Agent (green cube)
const AGENT_SIZE = 0.5;
const agent = new THREE.Mesh(new THREE.BoxGeometry(AGENT_SIZE, AGENT_SIZE, AGENT_SIZE), new THREE.MeshStandardMaterial({ color: 0x00ff00 }));
agent.position.y = AGENT_SIZE / 2;
scene.add(agent);

// Goal (orange sphere) - fixed position
const goal = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshStandardMaterial({ color: 0xff9900 }));
goal.position.y = 0.3;
scene.add(goal);

// Grid bounds
const GRID_MIN = -4;
const GRID_MAX = 4;

// Fixed goal grid coordinate (kept similar to original)
const GOAL_POS = { x: 3, z: 3 };
const START_POS = { x: -4, z: -4 };
goal.position.set(GOAL_POS.x, 0.3, GOAL_POS.z);

// Q-Learning params
const ACTIONS = ['up', 'down', 'left', 'right'];
const alpha = 0.1;
const gamma = 0.9;
const epsilon = 0.2;

// Q-table (object keyed by "x,z")
const Q = {};
function stateKey(x, z) { return `${x},${z}`; }
function ensureState(s) { if (!Q[s]) Q[s] = { up: 0, down: 0, left: 0, right: 0 }; }

// Initialize Q table for full grid
for (let x = GRID_MIN; x <= GRID_MAX; x++) {
    for (let z = GRID_MIN; z <= GRID_MAX; z++) {
        ensureState(stateKey(x, z));
    }
}

function chooseAction(x, z) {
    const s = stateKey(x, z);
    ensureState(s);
    if (Math.random() < epsilon) return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    // choose best action (tie-breaking random)
    const row = Q[s];
    let bestActions = [];
    let bestV = -Infinity;
    for (const a of ACTIONS) {
        const v = row[a];
        if (v > bestV) { bestV = v; bestActions = [a]; }
        else if (v === bestV) bestActions.push(a);
    }
    return bestActions[Math.floor(Math.random() * bestActions.length)];
}

function stepFromAction(x, z, action) {
    let nx = x, nz = z;
    if (action === 'up') nz -= 1;
    if (action === 'down') nz += 1;
    if (action === 'left') nx -= 1;
    if (action === 'right') nx += 1;
    nx = Math.max(GRID_MIN, Math.min(GRID_MAX, nx));
    nz = Math.max(GRID_MIN, Math.min(GRID_MAX, nz));
    const reward = (nx === GOAL_POS.x && nz === GOAL_POS.z) ? 10 : -0.1;
    return { nx, nz, reward };
}

// Chart.js setup
const chart = new Chart(chartEl.getContext('2d'), {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Episode Reward', data: [], borderColor: 'cyan', backgroundColor: 'rgba(0,255,200,0.1)', fill: true }] },
    options: { animation: { duration: 0 }, responsive: true, scales: { x: { title: { display: true, text: 'Episode' } }, y: { title: { display: true, text: 'Total Reward' } } } }
});

// Sleep helper
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Place agent mesh at grid position (visible immediately)
function placeAgent(x, z) { agent.position.set(x, AGENT_SIZE / 2, z); }

// Training control
let running = false;

async function runEpisode(stepDelay) {
    // Reset agent to start
    let ax = START_POS.x, az = START_POS.z;
    placeAgent(ax, az);

    let totalReward = 0;
    const maxSteps = 200;

    for (let t = 0; t < maxSteps; t++) {
        const action = chooseAction(ax, az);
        const { nx, nz, reward } = stepFromAction(ax, az, action);

        const s = stateKey(ax, az);
        const s2 = stateKey(nx, nz);
        ensureState(s);
        ensureState(s2);

        const oldQ = Q[s][action];
        const maxNext = Math.max(...ACTIONS.map(a => Q[s2][a]));
        Q[s][action] = oldQ + alpha * (reward + gamma * maxNext - oldQ);

        // move agent (render loop will show this on next frame)
        ax = nx; az = nz;
        placeAgent(ax, az);

        totalReward += reward;

        // allow render + UI
        await sleep(stepDelay);

        if (reward === 10) break;
    }

    return totalReward;
}

async function train() {
    if (running) return;
    running = true;
    startBtn.disabled = true;

    const episodes = Math.max(1, parseInt(episodesInput.value) || 100);
    const stepDelay = Math.max(0, parseFloat(speedInput.value) || 50);

    // reset chart
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();

    for (let ep = 1; ep <= episodes; ep++) {
        const reward = await runEpisode(stepDelay);
        chart.data.labels.push(ep.toString());
        chart.data.datasets[0].data.push(reward);
        chart.update();
        // small pause between episodes to keep UI responsive
        await sleep(50);
    }

    running = false;
    startBtn.disabled = false;
}

// Wire start button
startBtn.addEventListener('click', async () => {
    // ensure animate is running then await training
    animate();
    await train();
});

// Render loop (runs forever)
let animating = false;
function animate() {
    if (!animating) animating = true;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Start animation immediately
animate();

// Responsive
window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
});
