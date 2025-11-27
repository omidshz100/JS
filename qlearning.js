// ============ Grid World Q-Learning Simulation =============

// محیط 5×5
const gridSize = 5;

// حالت‌های خاص
const goal = { x: 4, y: 4 };
const start = { x: 0, y: 0 };

// پارامترهای Q-Learning
let alpha = 0.1;   // learning rate
let gamma = 0.9;   // discount
let epsilon = 0.2; // exploration

// اکشن‌ها
const actions = ["up", "down", "left", "right"];

// جدول Q
let Q = {};
function initQ() {
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const state = `${x},${y}`;
            Q[state] = { up: 0, down: 0, left: 0, right: 0 };
        }
    }
}
initQ();

// انتخاب اکشن با ε-greedy
function chooseAction(state) {
    if (Math.random() < epsilon) {
        return actions[Math.floor(Math.random() * actions.length)];
    }
    let best = null;
    let bestVal = -Infinity;

    for (let a of actions) {
        if (Q[state][a] > bestVal) {
            bestVal = Q[state][a];
            best = a;
        }
    }
    return best;
}

// به‌روزرسانی موقعیت عامل
function step(x, y, action) {
    let nx = x, ny = y;

    if (action === "up" && y > 0) ny--;
    if (action === "down" && y < gridSize - 1) ny++;
    if (action === "left" && x > 0) nx--;
    if (action === "right" && x < gridSize - 1) nx++;

    let reward = (nx === goal.x && ny === goal.y) ? 10 : -0.1;
    return { nx, ny, reward };
}

// حلقه‌ی اصلی یادگیری
async function train(episodes = 30) {
    for (let ep = 1; ep <= episodes; ep++) {
        let x = start.x;
        let y = start.y;

        console.log(`\n===== Episode ${ep} =====`);
        
        for (let stepNum = 0; stepNum < 30; stepNum++) {
            const state = `${x},${y}`;
            const action = chooseAction(state);
            const result = step(x, y, action);
            const nextState = `${result.nx},${result.ny}`;

            // Q-Learning Update
            const maxNextQ = Math.max(...Object.values(Q[nextState]));
            Q[state][action] =
                Q[state][action] +
                alpha * (result.reward + gamma * maxNextQ - Q[state][action]);

            console.log(
                `Step ${stepNum}: (${x},${y}) --${action}--> (${result.nx},${result.ny}) | R=${result.reward.toFixed(1)}`
            );

            x = result.nx;
            y = result.ny;

            if (x === goal.x && y === goal.y) {
                console.log("🎉 Agent reached the GOAL!");
                break;
            }
        }
    }

    console.log("\n========= FINAL Q TABLE =========");
    console.log(Q);
}

train();

