import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('#main-canvas'),antialias: true,alpha: true})

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.set(0, 0, 45)
camera.lookAt(0,0,0)


const loader = new THREE.TextureLoader()
const earthMap = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');


const globe = new THREE.Mesh(
    new THREE.SphereGeometry(10, 64, 64),
    new THREE.MeshStandardMaterial({ map: earthMap, roughness: 0.8 })
)
scene.add(globe)


const glow = new THREE.Mesh(
    new THREE.SphereGeometry(10.4, 64, 64),
    new THREE.MeshLambertMaterial({
        color: 0x00ccff,
        transparent: true,
        opacity: 0.12
    })
);
scene.add(glow)


const sun = new THREE.DirectionalLight(0xffffff, 2.5)
sun.position.set(10, 10, 10)
scene.add(sun)
scene.add(new THREE.AmbientLight(0x222222))


function createStarfield() {
    const geo = new THREE.SphereGeometry(0.12, 8, 8)
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    for (let i = 0; i < 400; i++) {
        const star = new THREE.Mesh(geo, mat)
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(300))
        star.position.set(x, y, z)
        scene.add(star)
    }
}

createStarfield()

const orbitalNodes = []

function buildSatellite(lat, lon, height, label, info) {
    const satGroup = new THREE.Group()

    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    satGroup.add(frame)


    const wings = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x0055ff, side: THREE.DoubleSide })
    );
    satGroup.add(wings)

    const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    antenna.rotation.x = Math.PI / 2
    antenna.position.z = 0.5
    satGroup.add(antenna)

    const rad = 10 + height
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)


    satGroup.position.set(
        -(rad * Math.sin(phi) * Math.cos(theta)),
        rad * Math.cos(phi),
        rad * Math.sin(phi) * Math.sin(theta)
    );

    satGroup.lookAt(0, 0, 0)
    satGroup.userData = { label, coords: `${lat}° N, ${lon}° E`, info }

    
    orbitalNodes.push(satGroup);
    scene.add(satGroup);
}

buildSatellite(28.6, 77.2, 4, "IN", "Relaying encrypted data packets from Delhi.")
buildSatellite(40.7, -74.0, 5.5, "US", "Deep space relay node.")
buildSatellite(-33.8, 151.2, 3, "AU", "Monitoring oceanic atmospheric patterns.")

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(orbitalNodes, true)

    if (intersects.length > 0) {
        let selected = intersects[0].object;
        while (selected.parent && !selected.userData.label) {
            selected = selected.parent;
        }

        document.getElementById('telemetry-output').innerHTML = `
            <h2>${selected.userData.label}</h2>
            <p class="coords">POSITION: ${selected.userData.coords}</p>
            <p class="details">${selected.userData.info}</p>
        `;

        orbitalNodes.forEach(node => {
            node.children[0].material.color.set(0x444444)
        });
        selected.children[0].material.color.set(0x00f2ff)
    }});

function loop() {
    requestAnimationFrame(loop);
    
    globe.rotation.y += 0.001
    glow.rotation.y += 0.001
    
    orbitalNodes.forEach(sat => {
        sat.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.003)
        sat.lookAt(0, 0, 0)
    });

    renderer.render(scene, camera)
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

loop();

