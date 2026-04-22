import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#main-frame'),
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.set(0, 5, 55)

const loader = new THREE.TextureLoader();
const earthTex = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
const moonTex = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');

const earth = new THREE.Mesh(
    new THREE.SphereGeometry(12, 64, 64),
    new THREE.MeshStandardMaterial({ map: earthTex, roughness: 0.7 })
)
scene.add(earth)

const moonGroup = new THREE.Group()
const moon = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshStandardMaterial({ map: moonTex })
)

moon.position.set(60, 5, -20)
moonGroup.add(moon)
scene.add(moonGroup)


const sun = new THREE.DirectionalLight(0xffffff, 3)
sun.position.set(20, 15, 20)
scene.add(sun)
scene.add(new THREE.AmbientLight(0x111111, 2))


const starGeo = new THREE.BufferGeometry()
const starCount = 1500
const starPos = new Float32Array(starCount * 3)
for(let i=0; i<starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 1000
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 }))
scene.add(stars)


const orbitalFleet = []


function spawnAdvancedSat(lat, lon, alt, id, intel) {
    const group = new THREE.Group()

    const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
    )

    group.add(chassis);


    const solarArrays = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x0022ff, side: THREE.DoubleSide })
    )

    solarArrays.rotation.y = Math.PI/2;
    group.add(solarArrays);


    const comsMast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x999999 })
    )

    comsMast.position.y = 0.8
    group.add(comsMast)


    const dish = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 0.5, 16),
        new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
    )

    dish.rotation.x = -Math.PI / 2
    dish.position.z = 0.8
    group.add(dish)


    const dockingRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.05, 8, 24),
        new THREE.MeshStandardMaterial({ color: 0x00f2ff })
    )

    dockingRing.position.z = -0.6
    group.add(dockingRing)


    const radius = 12 + alt
    const p = (90 - lat) * (Math.PI / 180)
    const t = (lon + 180) * (Math.PI / 180)


    group.position.set(
        -(radius * Math.sin(p) * Math.cos(t)),
        radius * Math.cos(p),
        radius * Math.sin(p) * Math.sin(t)
    );

    group.lookAt(0, 0, 0)
    group.userData = { id, loc: `${lat}N / ${lon}E`, intel }
    orbitalFleet.push(group)
    scene.add(group)
}


spawnAdvancedSat(28.6, 77.2, 5, "DELHI", "Quantum encrypted relay active.")
spawnAdvancedSat(40.7, -74.0, 7, "GOTHAM", "Deep packet inspection in progress.")
spawnAdvancedSat(-33.8, 151.2, 4, "SYDNEY", "Tactical link established. Monitoring oceanic thermal anomalies.")


const ray = new THREE.Raycaster()
const cursor = new THREE.Vector2()

window.addEventListener('click', (e) => {
    cursor.x = (e.clientX / window.innerWidth) * 2 - 1
    cursor.y = -(e.clientY / window.innerHeight) * 2 + 1

    ray.setFromCamera(cursor, camera)
    const hits = ray.intersectObjects(orbitalFleet, true)


    if (hits.length > 0) {
        let active = hits[0].object;
        while (active.parent && !active.userData.id) active = active.parent


        document.getElementById('output-stream').innerHTML = `
            <div class="sat-card">
                <h2>${active.userData.id}</h2>
                <p class="pos">VIRTUAL_POS: ${active.userData.loc}</p>
                <p class="bio">${active.userData.intel}</p>
            </div>
        `;


        orbitalFleet.forEach(n => n.children[4].material.emissive.setHex(0x000000))
        active.children[4].material.emissive.setHex(0x00f2ff)
    }});


function tick() {
    requestAnimationFrame(tick);
    
    earth.rotation.y += 0.001;
    moonGroup.rotation.y += 0.002;
    moon.rotation.y += 0.005;
    

    orbitalFleet.forEach(s => {
        s.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.0025);
        s.lookAt(0, 0, 0)
    });
    renderer.render(scene, camera)
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

tick();


