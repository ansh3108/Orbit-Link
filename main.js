const canvas = document.getElementById('renderCanvas');
const ctx = canvas.getContext('2d');
const sidebar = document.getElementById('active-satellite');

let width, height, centerX, centerY;
let angleY = 0;
let angleX = 0.2;

const satellites = [
    {lat: 28.6, lon: 77.2, name: "DELHI", desc: "Stable orbit over Delhi."},
    {lat: 40.7, lon: -74.0, name: "NYC", desc: "Data relay node."},
    {lat: -33.8, lon: 151.2, name: "SYD", desc: "Atmospheric monitor."},
    {lat: 51.5, lon: -0.1, name: "LDN", desc: "Encrypted secure line"}
];

const stars = Array.from({length: 400}, () => ({
    x: (Math.random() - 0.5) * 2000,
    y: (Math.random() - 0.5) * 2000,
    z: (Math.random() - 0.5) * 2000,
}));

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
}

window.addEventListener('resize', resize);
resize();

function project(x, y, z) {
    const scale = 800 / (800 + z);
    return {
        x: x * scale + centerX,
        y: y * scale + centerY,
        scale: scale
    };
}

function rotateY(x, z, theta) {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    return [x * cos - z * sin, x * sin + z * cos];
}

function rotateX(y, z, theta) {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    return [y * cos - z * sin, y * sin + z * cos];
}

function draw() {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, width, height);

    angleY += 0.003;

    ctx.fillStyle = "white";
    stars.forEach(star => {
        let [sx, sz] = rotateY(star.x, star.z, angleY * 0.1);
        let p = project(sx, star.y, sz);
        if (p.scale > 0) {
            ctx.globalAlpha = Math.max(0, p.scale * 0.5);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    const radius = 180;
    const segments = 24;
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;

    for (let i = 0; i <= segments; i++) {
        let lat = (i / segments) * Math.PI - Math.PI / 2;
        ctx.beginPath();
        for (let j = 0; j <= segments; j++) {
            let lon = (j / segments) * 2 * Math.PI;

            let x = radius * Math.cos(lat) * Math.cos(lon);
            let y = radius * Math.sin(lat);
            let z = radius * Math.cos(lat) * Math.sin(lon);

            let [rx, rz] = rotateY(x, z, angleY);
            let [ry, finalZ] = rotateX(y, rz, angleX);
            let p = project(rx, ry, finalZ);

            if (j === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
    }

    satellites.forEach(sat => {
        const phi = (90 - sat.lat) * (Math.PI / 180);
        const theta = (sat.lon + 180) * (Math.PI / 180);
        const r = radius + 40;

        let x = r * Math.sin(phi) * Math.cos(theta);
        let y = r * Math.cos(phi);
        let z = r * Math.sin(phi) * Math.sin(theta);

        let [rx, rz] = rotateY(x, z, angleY);
        let [ry, finalZ] = rotateX(y, rz, angleX);
        let p = project(rx, ry, finalZ);

        if (finalZ > -radius) {
            ctx.fillStyle = "#00f2ff";
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#00f2ff";
            ctx.beginPath();
            ctx.rect(p.x - 3, p.y - 3, 6, 6);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.font = "10px Courier New";
            ctx.fillText(sat.name, p.x + 10, p.y);
        }
    });

    requestAnimationFrame(draw);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    satellites.forEach(sat => {
        const phi = (90 - sat.lat) * (Math.PI / 180);
        const theta = (sat.lon + 180) * (Math.PI / 180);
        const r = 180 + 40;

        let x = r * Math.sin(phi) * Math.cos(theta);
        let y = r * Math.cos(phi);
        let z = r * Math.sin(phi) * Math.sin(theta);

        let [rx, rz] = rotateY(x, z, angleY);
        let [ry, finalZ] = rotateX(y, rz, angleX);
        let p = project(rx, ry, finalZ);

        const dist = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
        if (dist < 20) {
            sidebar.innerHTML = `
                <h2>${sat.name}</h2>
                <p>COORDINATES: ${sat.lat}, ${sat.lon}</p>
                <p>MESSAGE: ${sat.desc}</p>
                <p class="status">LINK ESTABLISHED</p>
            `;
        }
    });
});

draw();

