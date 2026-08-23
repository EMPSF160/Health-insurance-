/* ==========================================================================
   ApexShield - Three.js 3D Background & Visualizer
   ========================================================================== */

(function () {
  let scene, camera, renderer, particles;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  function initThree() {
    const container = document.getElementById('three-canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080c14, 0.0012);

    // Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 400;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f2fe, 2, 800);
    pointLight1.position.set(200, 200, 200);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7000ff, 1.5, 800);
    pointLight2.position.set(-200, -200, 100);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x00e676, 1.5, 600);
    pointLight3.position.set(0, -100, 300);
    scene.add(pointLight3);

    // Create Background Particle Network
    createParticleNetwork();

    // Event listeners
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    // Animation Loop
    animate();
  }

  function createParticleNetwork() {
    const particleCount = 700;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f2fe);
    const color2 = new THREE.Color(0x00e676);
    const color3 = new THREE.Color(0x7000ff);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1200;
      positions[i + 1] = (Math.random() - 0.5) * 1200;
      positions[i + 2] = (Math.random() - 0.5) * 800;

      const mixColor = Math.random();
      let pColor;
      if (mixColor < 0.4) pColor = color1;
      else if (mixColor < 0.7) pColor = color2;
      else pColor = color3;

      colors[i] = pColor.r;
      colors[i + 1] = pColor.g;
      colors[i + 2] = pColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.1;
    mouseY = (event.clientY - windowHalfY) * 0.1;
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    if (camera) {
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
    }

    renderer.render(scene, camera);
  }

  // Initialize on Window Load
  window.addEventListener('DOMContentLoaded', initThree);
})();
