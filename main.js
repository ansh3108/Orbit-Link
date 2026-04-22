import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true})


renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.setZ(35)


const textureLoader = new THREE.TextureLoader()
const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');

const earth = new THREE.Mesh(
    new THREE.SphereGeometry(10, 64, 64),
    new THREE.MeshStandardMaterial({ map: earthTexture })
)

scene.add(earth);

const atmos = new THREE.Mesh(
    new THREE.SphereGeometry(10.3, 64, 64),
    new THREE.MeshLambertMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.15
    }));

scene.add(atmos);

const sunLight = new THREE.PointLight(0xffffff, 2000)
sunLight.position.set(25, 15, 25)
const ambient = new THREE.AmbientLight(0x404040, 2)
scene.add(sunLight, ambient)


function addStar() {
    const star = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(250))
    star.position.set(x, y, z)
    scene.add(star)
}

Array(350).fill().forEach(addStar);


const sats = [];
function createSatModel(lat, lon, alt, name, data) {
    const group = new THREE.Group()

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    group.add(body);


    const panelGeo = new THREE.PlaneGeometry(1.5, 0.5)
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x0044ff, side: THREE.DoubleSide })
    const p1 = new THREE.Mesh(panelGeo, panelMat)
    p1.position.x = 1.1;
    const p2 = new THREE.Mesh(panelGeo, panelMat)
    p2.position.x = -1.1;
    group.add(p1, p2)

    const ant = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    ant.position.y = 0.5;
    group.add(ant)


    const dist = 10 + alt;
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)


    group.position.set(
        -(dist * Math.sin(phi) * Math.cos(theta)),
        dist * Math.cos(phi),
        dist * Math.sin(phi) * Math.sin(theta)
    );

    
    group.lookAt(0, 0, 0);
    group.userData = { name, data };
    sats.push(group);
    scene.add(group);

}

createSatModel(28.6, 77.2, 3, "IND-CORE", "Primary relay for Southeast Asia.");
createSatModel(40.7, -74.0, 4, "US-WEST", "Deep space packet inspector.");
createSatModel(-33.8, 151.2, 3.5, "AUS-LINK", "Oceanic climate monitor.");


const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()


window.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;


    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(sats, true);


    if (hits.length > 0) {
        let selected = hits[0].object;
        while (selected.parent && !selected.userData.name) {
            selected = selected.parent;
        }
        document.getElementById('data-panel').innerHTML = `
            <h2>${selected.userData.name}</h2>
            <p>${selected.userData.data}</p>
        `;
    }});


function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.0015;
    atmos.rotation.y += 0.0012;
    sats.forEach(s => {
        s.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.002);
        s.lookAt(0, 0, 0);
    });
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


animate();
