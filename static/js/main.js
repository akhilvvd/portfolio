// ============================================================
//  AKHIL PORTFOLIO — main.js  (Gem Edition)
// ============================================================

const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000510, 0.025);

const sizes = { width: window.innerWidth, height: window.innerHeight };

const camera = new THREE.PerspectiveCamera(70, sizes.width / sizes.height, 0.1, 200);
camera.position.set(0, 2, 14);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000510, 1);

// ── Lights ──────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0x0a1628, 2);
scene.add(ambientLight);

const rimLight = new THREE.DirectionalLight(0x00f5ff, 1.5);
rimLight.position.set(-10, 10, -10);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0x7b2fff, 1);
fillLight.position.set(10, -5, 10);
scene.add(fillLight);

const orbitLights = [
    new THREE.PointLight(0x00f5ff, 6, 25),
    new THREE.PointLight(0xff2d78, 5, 25),
    new THREE.PointLight(0x7b2fff, 5, 25),
];
orbitLights.forEach(l => scene.add(l));

// ── Grid Floor ───────────────────────────────────────────────
const gridHelper = new THREE.GridHelper(80, 50, 0x00f5ff, 0x050e24);
gridHelper.position.y = -8;
scene.add(gridHelper);

// ── Stars ────────────────────────────────────────────────────
function makeStars(count, spread, size, color) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * spread;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
        color, size, transparent: true, opacity: 0.7
    }));
}
scene.add(makeStars(1200, 80, 0.06, 0x00f5ff));
scene.add(makeStars(600,  80, 0.10, 0xffffff));
scene.add(makeStars(300,  80, 0.12, 0x7b2fff));

// ── Project Data ─────────────────────────────────────────────
const projects = [
    { name: "WebScraper Pro",      desc: "Automated data extraction engine with smart scheduling and export pipelines",       tech: "Python · Selenium · BeautifulSoup · Pandas", color: 0x00f5ff, emissive: 0x003e52, shape: 'torus', link: "#" },
    { name: "FastAPI Backend",     desc: "High-performance async REST API with Pydantic validation and JWT auth",             tech: "FastAPI · Pydantic · MongoDB · Python",      color: 0x7b2fff, emissive: 0x1a0040, shape: 'octahedron', link: "#" },
    { name: "ML Dashboard",        desc: "Real-time analytics platform with interactive charts and data pipelines",           tech: "Python · NumPy · Pandas · Flask",            color: 0x00ff88, emissive: 0x003322, shape: 'mesh', link: "#" },
    { name: "E-Commerce Platform", desc: "Full-stack shop with auth, cart, payments and real-time admin panel",              tech: "Django · MongoDB · Bootstrap · JS",          color: 0xff6b35, emissive: 0x3d1500, shape: 'cone', link: "#" },
    { name: "Node Microservices",  desc: "Scalable REST microservice architecture with event-driven messaging",               tech: "Node.js · Express · MongoDB",               color: 0xff2d78, emissive: 0x3d0018, shape: 'sphere', link: "#" },
    { name: "Steam Analytics",     desc: "Game stats tracker with trend visualisation and achievement insights",              tech: "Python · Steamlib · Pandas · Flask",         color: 0xf5c518, emissive: 0x3d3000, shape: 'torusKnot', link: "#" },
];

// ── Build Gem ────────────────────────────────────────────────
function buildGem(project) {
    const group = new THREE.Group();

    let geo;
    if      (project.shape === 'torus') geo = new THREE.TorusGeometry(1.1, 0.3, 16, 100);
    else if (project.shape === 'octahedron')  geo = new THREE.OctahedronGeometry(1.2, 0);
    else if (project.shape === 'cone') geo = new THREE.ConeGeometry(1.1, 2, 8);
    else if (project.shape === 'sphere') geo = new THREE.SphereGeometry(1.1, 32, 32);
    else if (project.shape === 'mesh') geo = new THREE.RingGeometry(1.1, 1.3, 32);
    else                                       geo = new THREE.TorusKnotGeometry(0.7, 0.28, 80, 12);

    const mat = new THREE.MeshStandardMaterial({
        color: project.color,
        emissive: project.emissive,
        emissiveIntensity: 0.5,
        metalness: 0.1,
        roughness: 0.05,
        transparent: true,
        opacity: 0.85,
    });
    const gem = new THREE.Mesh(geo, mat);
    group.add(gem);

    // Wireframe shell
    const wireMat = new THREE.MeshBasicMaterial({ color: project.color, wireframe: true, transparent: true, opacity: 0.18 });
    const wire = new THREE.Mesh(geo.clone(), wireMat);
    wire.scale.setScalar(1.09);
    group.add(wire);

    // Glow sprite
    const gc = document.createElement('canvas');
    gc.width = gc.height = 256;
    const ctx = gc.getContext('2d');
    const gr = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    const hex = '#' + project.color.toString(16).padStart(6, '0');
    gr.addColorStop(0,   hex + 'cc');
    gr.addColorStop(0.3, hex + '44');
    gr.addColorStop(1,   hex + '00');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, 256, 256);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.setScalar(5.5);
    group.add(glow);

    // Rings
    const mkRing = (r, tube, ox, oy) => {
        const m = new THREE.Mesh(
            new THREE.TorusGeometry(r, tube, 8, 64),
            new THREE.MeshBasicMaterial({ color: project.color, transparent: true, opacity: ox })
        );
        m.rotation.x = oy;
        return m;
    };
    const ring1 = mkRing(1.75, 0.025, 0.45, Math.PI / 2);
    const ring2 = mkRing(2.1,  0.012, 0.20, Math.PI / 3);
    ring2.rotation.y = Math.PI / 4;
    group.add(ring1, ring2);

    // Inner point light
    const gemLight = new THREE.PointLight(project.color, 2, 7);
    group.add(gemLight);

    group.userData = { project, gem, wire, glow, ring1, ring2, gemLight, mat, wireMat };
    return group;
}

const gemGroups = [];
projects.forEach((project, i) => {
    const angle  = (i / projects.length) * Math.PI * 2 + Math.PI / 8;
    const radius = 8;
    const group  = buildGem(project);
    group.position.set(Math.cos(angle) * radius, Math.sin((i / projects.length) * Math.PI * 2) * 2.5, Math.sin(angle) * radius);
    group.userData.baseY  = group.position.y;
    group.userData.angle  = angle;
    group.userData.radius = radius;
    scene.add(group);
    gemGroups.push(group);
});

// ── Raycaster ────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredGroup = null;
let targetCamX = 0, targetCamY = 2;

window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / sizes.width)  *  2 - 1;
    mouse.y = (e.clientY / sizes.height) * -2 + 1;
    targetCamX =  -mouse.x * 1.5;
    targetCamY =  2 + mouse.y * 1.0;
});

window.addEventListener('click', () => {
    if (hoveredGroup) showProjectCard(hoveredGroup.userData.project);
});

// ── Project Card ─────────────────────────────────────────────
function showProjectCard(project) {
    const old = document.getElementById('project-card');
    if (old) { old.classList.remove('visible'); setTimeout(() => old.remove(), 300); }

    const hex = '#' + project.color.toString(16).padStart(6, '0');
    const card = document.createElement('div');
    card.id = 'project-card';
    card.innerHTML = `
        <div class="card-inner" style="--accent:${hex}">
            <button class="card-close" onclick="document.getElementById('project-card').classList.remove('visible')">✕</button>
            <div class="card-tag">◈ PROJECT</div>
            <h2 class="card-title">${project.name}</h2>
            <p class="card-desc">${project.desc}</p>
            <div class="card-tech">${project.tech.split(' · ').map(t=>`<span>${t}</span>`).join('')}</div>
            <a class="card-link" href="${project.link}" target="_blank">View Project <span>→</span></a>
        </div>`;
    document.body.appendChild(card);
    setTimeout(() => card.classList.add('visible'), 10);
}

// ── WASD ─────────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup',   e => keys[e.key.toLowerCase()] = false);

function move() {
    if (keys['w'] || keys['arrowup'])    camera.position.z -= 0.1;
    if (keys['s'] || keys['arrowdown'])  camera.position.z += 0.1;
    if (keys['a'] || keys['arrowleft'])  camera.position.x -= 0.1;
    if (keys['d'] || keys['arrowright']) camera.position.x += 0.1;
}

// ── Floating label ────────────────────────────────────────────
let labelEl = null;
function showLabel(name, worldPos) {
    if (!labelEl) { labelEl = document.createElement('div'); labelEl.id = 'gem-label'; document.body.appendChild(labelEl); }
    labelEl.textContent = name;
    labelEl.style.display = 'block';
    const v = worldPos.clone().project(camera);
    labelEl.style.left = ((v.x *  0.5 + 0.5) * sizes.width)  + 'px';
    labelEl.style.top  = ((v.y * -0.5 + 0.5) * sizes.height - 90) + 'px';
}
function hideLabel() { if (labelEl) labelEl.style.display = 'none'; }

// ── Animate ──────────────────────────────────────────────────
const clock = new THREE.Clock();
let orbit = 0;

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    orbit += 0.0008;

    move();

    // Smooth camera parallax
    camera.position.x += (targetCamX - camera.position.x) * 0.03;
    camera.position.y += (targetCamY - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    // Orbiting scene lights
    orbitLights[0].position.set(Math.sin(t * 0.4) * 12, 5,  Math.cos(t * 0.4) * 12);
    orbitLights[1].position.set(Math.cos(t * 0.3) * 10, -4, Math.sin(t * 0.3) * 10);
    orbitLights[2].position.set(Math.sin(t * 0.5 + 2) * 8, 2, Math.cos(t * 0.5 + 2) * 8);

    // Raycaster
    raycaster.setFromCamera(mouse, camera);
    const allGems = gemGroups.map(g => g.userData.gem);
    const hits = raycaster.intersectObjects(allGems);
    const newHov = hits.length ? gemGroups.find(g => g.userData.gem === hits[0].object) : null;
    if (newHov !== hoveredGroup) { hoveredGroup = newHov; document.body.style.cursor = hoveredGroup ? 'pointer' : 'default'; }

    // Per-gem animation
    gemGroups.forEach((group, i) => {
        const { gem, wire, glow, ring1, ring2, gemLight, mat, wireMat } = group.userData;
        const isHov  = group === hoveredGroup;
        const phase  = (i / projects.length) * Math.PI * 2;

        // Orbit + float
        const ba = group.userData.angle + orbit;
        group.position.x = Math.cos(ba) * group.userData.radius;
        group.position.z = Math.sin(ba) * group.userData.radius;
        group.position.y = group.userData.baseY + Math.sin(t * 0.7 + phase) * 0.5;

        // Spin
        gem.rotation.y  += 0.007;
        gem.rotation.x  += 0.003;
        wire.rotation.y -= 0.004;
        wire.rotation.z += 0.003;
        ring1.rotation.z += 0.012;
        ring2.rotation.x += 0.009;
        ring2.rotation.y += 0.006;

        if (isHov) {
            const pulse = 1 + Math.sin(t * 6) * 0.18;
            glow.scale.setScalar(8 * pulse);
            mat.emissiveIntensity = 1.4 + Math.sin(t * 8) * 0.3;
            wireMat.opacity = 0.55;
            gemLight.intensity = 6;
            const s = group.scale.x; group.scale.setScalar(s + (1.18 - s) * 0.12);
            showLabel(group.userData.project.name, group.position);
        } else {
            glow.scale.setScalar(5.5);
            mat.emissiveIntensity = 0.4 + Math.sin(t * 1.5 + phase) * 0.15;
            wireMat.opacity = 0.18;
            gemLight.intensity = 1.5;
            const s = group.scale.x; group.scale.setScalar(s + (1.0 - s) * 0.1);
            hideLabel();
        }
    });

    renderer.render(scene, camera);
}
animate();

// ── Resize ───────────────────────────────────────────────────
window.addEventListener('resize', () => {
    sizes.width  = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ── Loader ───────────────────────────────────────────────────
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) { setTimeout(() => { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 800); }, 1500); }
});