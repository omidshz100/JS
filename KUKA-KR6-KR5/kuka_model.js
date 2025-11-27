// KUKA KR6 Medium Detail Model
// ---------------------------------------------------
// لینک‌ها بر اساس اندازه‌های واقعی اما ساده‌سازی‌شده
// محورهای چرخش مطابق استاندارد KR6/10 R900

function createKukaModel(scene) {

    const orange = 0xff6a00;
    const black = 0x222222;

    const baseHeight = 0.3;

    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, baseHeight, 32),
        new THREE.MeshPhongMaterial({ color: orange })
    );
    base.position.y = baseHeight / 2;
    scene.add(base);

    // Joint1 housing
    const j1 = new THREE.Object3D();
    base.add(j1);

    const j1Body = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.25, 0.4),
        new THREE.MeshPhongMaterial({ color: orange })
    );
    j1Body.position.y = 0.2;
    j1.add(j1Body);

    // Link 1 (shoulder)
    const link1Len = 0.5;
    const link1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, link1Len, 32),
        new THREE.MeshPhongMaterial({ color: orange })
    );
    link1.rotation.z = Math.PI / 2;
    link1.position.y = link1Len / 2 + 0.2;
    j1.add(link1);

    // Joint2
    const j2 = new THREE.Object3D();
    j2.position.y = link1Len + 0.2;
    j1.add(j2);

    const j2Body = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.2, 0.3),
        new THREE.MeshPhongMaterial({ color: orange })
    );
    j2.add(j2Body);

    // Link2 (upper arm)
    const link2Len = 0.55;
    const link2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, link2Len, 32),
        new THREE.MeshPhongMaterial({ color: orange })
    );
    link2.rotation.z = Math.PI / 2;
    link2.position.y = link2Len / 2;
    j2.add(link2);

    // Joint3
    const j3 = new THREE.Object3D();
    j3.position.y = link2Len;
    j2.add(j3);

    const j3Body = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.2, 0.25),
        new THREE.MeshPhongMaterial({ color: orange })
    );
    j3.add(j3Body);

    // Link3 (forearm)
    const link3Len = 0.45;
    const link3 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, link3Len, 32),
        new THREE.MeshPhongMaterial({ color: orange })
    );
    link3.rotation.z = Math.PI / 2;
    link3.position.y = link3Len / 2;
    j3.add(link3);

    // Joint4 (wrist 1)
    const j4 = new THREE.Object3D();
    j4.position.y = link3Len;
    j3.add(j4);

    const j4Body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.15, 32),
        new THREE.MeshPhongMaterial({ color: black })
    );
    j4Body.rotation.x = Math.PI / 2;
    j4.add(j4Body);

    // Joint5 (wrist 2)
    const j5 = new THREE.Object3D();
    j5.position.y = 0.15;
    j4.add(j5);

    const j5Body = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 32, 32),
        new THREE.MeshPhongMaterial({ color: black })
    );
    j5.add(j5Body);

    // Joint6 (wrist roll)
    const j6 = new THREE.Object3D();
    j6.position.y = 0.15;
    j5.add(j6);

    const j6Body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.15, 32),
        new THREE.MeshPhongMaterial({ color: black })
    );
    j6Body.rotation.x = Math.PI / 2;
    j6.add(j6Body);

    return { j1, j2, j3, j4, j5, j6 };
}
