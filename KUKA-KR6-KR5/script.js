// ====================  Three.js Scene Setup  ====================

const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(2.5, 2, 4);
camera.lookAt(0, 1, 0);


// Object to pick
const item = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 0.1),
    new THREE.MeshPhongMaterial({ color: 0x00aaff })
);
item.position.set(0.6, 0.05, 0.3);
item.castShadow = true;
scene.add(item);

let holdingItem = false;
let performingPickPlace = false;


// Lights
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(5, 10, 7);
light.castShadow = true;
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.3));


// Ground
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshPhongMaterial({ color: 0x222222 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);


// ====================  Build KUKA 6DOF Model  ====================

const kuka = createKukaModel(scene);

kuka.j1.rotation.order = "ZYX";
kuka.j2.rotation.order = "ZYX";
kuka.j3.rotation.order = "ZYX";
kuka.j4.rotation.order = "ZYX";
kuka.j5.rotation.order = "ZYX";
kuka.j6.rotation.order = "ZYX";

// Add small axes helpers to each joint to visualize rotation axes
const axesHelpers = {};
["j1","j2","j3","j4","j5","j6"].forEach(name => {
    const helper = new THREE.AxesHelper(0.25);
    kuka[name].add(helper);
    axesHelpers[name] = helper;
});


// ====================  Joint Sliders  ====================

const sliders = {
    j1: document.getElementById("j1"),
    j2: document.getElementById("j2"),
    j3: document.getElementById("j3"),
    j4: document.getElementById("j4"),
    j5: document.getElementById("j5"),
    j6: document.getElementById("j6"),
};

const pickPlaceBtn = document.getElementById("pickPlaceBtn");


// ====================  Update Joint Angles  ====================

function updateJoints() {
    const deg2rad = Math.PI / 180;

    // Do not override animated joint motion during pick & place
    if (performingPickPlace) return;

    kuka.j1.rotation.y = sliders.j1.value * deg2rad;
    kuka.j2.rotation.z = sliders.j2.value * deg2rad;
    kuka.j3.rotation.z = sliders.j3.value * deg2rad;
    kuka.j4.rotation.y = sliders.j4.value * deg2rad;
    kuka.j5.rotation.x = sliders.j5.value * deg2rad;
    kuka.j6.rotation.y = sliders.j6.value * deg2rad;
}


// ====================  Move Joints Smoothly  ====================

function animateJoint(targets, duration = 1200) {
    return new Promise(resolve => {
        const start = {
            j1: kuka.j1.rotation.y,
            j2: kuka.j2.rotation.z,
            j3: kuka.j3.rotation.z,
            j4: kuka.j4.rotation.y,
            j5: kuka.j5.rotation.x,
            j6: kuka.j6.rotation.y
        };

        const startTime = performance.now();

        function step(t) {
            let k = (t - startTime) / duration;
            if (k > 1) k = 1;

            // Interpolate each joint axis consistently with updateJoints
            kuka.j1.rotation.y = start.j1 + (targets.j1 - start.j1) * k;
            kuka.j2.rotation.z = start.j2 + (targets.j2 - start.j2) * k;
            kuka.j3.rotation.z = start.j3 + (targets.j3 - start.j3) * k;
            kuka.j4.rotation.y = start.j4 + (targets.j4 - start.j4) * k;
            kuka.j5.rotation.x = start.j5 + (targets.j5 - start.j5) * k;
            kuka.j6.rotation.y = start.j6 + (targets.j6 - start.j6) * k;

            if (k < 1) requestAnimationFrame(step);
            else resolve();
        }
        requestAnimationFrame(step);
    });
}

    // Log forward kinematics (j6 world position) and joint angles
    function logFK(label) {
        const pos = new THREE.Vector3();
        kuka.j6.getWorldPosition(pos);
        const toDeg = r => (r * 180 / Math.PI).toFixed(1);
        console.log(`${label} | j1:${toDeg(kuka.j1.rotation.y)} j2:${toDeg(kuka.j2.rotation.z)} j3:${toDeg(kuka.j3.rotation.z)} j4:${toDeg(kuka.j4.rotation.y)} j5:${toDeg(kuka.j5.rotation.x)} j6:${toDeg(kuka.j6.rotation.y)} | effector: (${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)})`);
    }


// ====================  Pick & Place Poses  ====================

const HomePose =  { j1:0, j2:-40*Math.PI/180, j3:50*Math.PI/180, j4:0, j5:0, j6:0 };
const PrePick   = { j1:20*Math.PI/180, j2:-60*Math.PI/180, j3:70*Math.PI/180, j4:0, j5:0, j6:0 };
const Pick      = { j1:25*Math.PI/180, j2:-75*Math.PI/180, j3:88*Math.PI/180, j4:0, j5:0, j6:0 };
const PrePlace  = { j1:-30*Math.PI/180, j2:-45*Math.PI/180, j3:55*Math.PI/180, j4:0, j5:0, j6:0 };
const Place     = { j1:-30*Math.PI/180, j2:-65*Math.PI/180, j3:80*Math.PI/180, j4:0, j5:0, j6:0 };


// ====================  Pick & Place  ====================

async function pickAndPlace() {
    // Prevent sliders from overriding animation
    performingPickPlace = true;
    if (pickPlaceBtn) pickPlaceBtn.disabled = true;
    Object.values(sliders).forEach(s => s.disabled = true);

    holdingItem = false;

    await animateJoint(HomePose, 1200);
    logFK('After Home');
    await animateJoint(PrePick, 1200);
    logFK('After PrePick');
    await animateJoint(Pick, 1200);
    logFK('After Pick');

    // Attach item to wrist (parent to j6)
    attachItemToWrist();
    holdingItem = true;

    await animateJoint(PrePick, 1200);
    logFK('After PrePick return');
    await animateJoint(PrePlace, 1200);
    logFK('After PrePlace');
    await animateJoint(Place, 1200);
    logFK('After Place');

    // Detach item from wrist (leave at place position)
    detachItemFromWrist();
    holdingItem = false;

    await animateJoint(HomePose, 1200);
    logFK('After Home Return');

    performingPickPlace = false;
    if (pickPlaceBtn) pickPlaceBtn.disabled = false;
    Object.values(sliders).forEach(s => s.disabled = false);
}

if (pickPlaceBtn) pickPlaceBtn.addEventListener('click', pickAndPlace);


// ====================  Animate Loop  ====================

function animate() {
    updateJoints();

    // Update item position if not parented. If parented (attached), it will follow automatically.
    if (holdingItem && item.parent !== kuka.j6) {
        const wristPos = kuka.j6.getWorldPosition(new THREE.Vector3());
        item.position.copy(wristPos);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();


// Helper: attach and detach item to/from wrist (j6)
function attachItemToWrist() {
    // Compute current world position of item and convert to j6 local
    const worldPos = new THREE.Vector3();
    item.getWorldPosition(worldPos);
    // Remove from current parent and add to j6
    if (item.parent) item.parent.remove(item);
    const localPos = kuka.j6.worldToLocal(worldPos.clone());
    kuka.j6.add(item);
    item.position.copy(localPos);
}

function detachItemFromWrist() {
    // Compute world position of wrist and place item there in scene
    const worldPos = new THREE.Vector3();
    kuka.j6.getWorldPosition(worldPos);
    if (item.parent) item.parent.remove(item);
    scene.add(item);
    item.position.copy(worldPos);
}


// ====================  Resize Handler  ====================

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
