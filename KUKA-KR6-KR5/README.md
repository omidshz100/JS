# KUKA KR6 6DOF Web Simulation

A small web-based simulation of a 6-DOF KUKA KR6-style robot built with Three.js. The project allows manual joint control via sliders and includes a Pick & Place animation that moves a small cube (the item) through a sequence of poses.

## Project Structure

- `index.html` — Main HTML page. Loads Three.js, the model, and the main script.
- `style.css` — Basic styling for the UI and layout.
- `kuka_model.js` — Builds the 6-DOF KUKA model (joint hierarchy and geometry).
- `script.js` — Scene setup, joint controls, animation loop, and Pick & Place logic.

## Features

- Interactive slider controls for joints `j1`..`j6`.
- Continuous render loop (`animate()`) so the scene never blocks.
- `Pick & Place` button triggers an async sequence of poses: `Home → PrePick → Pick → PrePick → PrePlace → Place → Home`.
- When picked, the item becomes parented to the wrist (`j6`) and follows the end-effector.
- Visual debug helpers (axes) and console logs added to help analyze FK and joint axes.

## How to Run (Local Development)

Recommended: use the VS Code Live Server extension to serve the project locally. Opening `index.html` directly from the filesystem may work in some browsers, but using a local server avoids CORS issues and provides a reliable environment.

1. Open the project folder (`KUKA-KR6-KR5`) in Visual Studio Code.
2. Install the Live Server extension (by Ritwick Dey):

   - Extension name: `Live Server`
   - Marketplace ID: `ritwickdey.LiveServer`

3. Right-click `index.html` and choose `Open with Live Server` (or use the status-bar "Go Live" button).
4. A browser window will open showing the scene.

Controls:
- Use sliders to manually rotate each joint.
- Click **Pick & Place Animation** to run the automated sequence.
- Open the browser DevTools console to see FK/effecter logs emitted during the sequence.

## Notes & Troubleshooting

- If the robot does not move when the button is clicked:
  - Open the browser console (F12) and check for errors.
  - Ensure `kuka_model.js` and `script.js` are being loaded (network tab).

- Joint axes and pose signs may be hardware-specific. If a joint moves in the opposite direction from expectation, you can invert the slider or modify the rotation axis in `script.js` (e.g. use `rotation.x` or `rotation.z` instead of `rotation.y`) or flip the pose sign.

- The project uses the CDN version of Three.js included in `index.html`. No other build step is required.

## Suggestions for VS Code

- Install `Live Server` (recommended) to preview and iterate quickly.
- Install `Prettier` for formatting JavaScript files.
- Open DevTools console to observe `logFK` output for debugging joint angles and end-effector position during the Pick & Place animation.

## License

This repository is provided as-is for learning and prototyping. Feel free to modify and experiment.
