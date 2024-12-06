import * as THREE from "/node_modules/three/build/three.module.js";

class SnowfallBackground {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
    this.snowParticles = null;
    this.particleData = [];

    this.initScene();
    this.animate();
  }

  createCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    return camera;
  }

  createRenderer() {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
    `;
    this.container.appendChild(renderer.domElement);
    return renderer;
  }

  initScene() {
    this.createSnowParticles();
    window.addEventListener("resize", () => this.onResize());
  }

  createSnowParticles() {
    const snowMaterial = new THREE.PointsMaterial({
      color: 0xffffff, // Blanco para simular nieve
      size: 0.05, // Tamaño de los copos
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8, // Opacidad para dar realismo
    });

    const geometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < 2000; i++) { // Aumentamos el número de partículas
      // Posición inicial aleatoria
      const x = (Math.random() - 0.5) * 20;
      const y = Math.random() * 20;
      const z = (Math.random() - 0.5) * 20;
      positions.push(x, y, z);

      // Velocidades de caída lentas para simular nieve
      this.particleData.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01, // Movimiento lateral suave
          -Math.random() * 0.02, // Caída lenta
          (Math.random() - 0.5) * 0.01 // Movimiento lateral en profundidad
        ),
      });
    }
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    this.snowParticles = new THREE.Points(geometry, snowMaterial);
    this.scene.add(this.snowParticles);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.snowParticles) {
      const positions = this.snowParticles.geometry.attributes.position.array;

      for (let i = 0; i < positions.length; i += 3) {
        const particleIndex = i / 3;
        const data = this.particleData[particleIndex];

        // Aplicar movimiento de caída
        positions[i] += data.velocity.x;
        positions[i + 1] += data.velocity.y;
        positions[i + 2] += data.velocity.z;

        // Reiniciar partículas si salen del rango
        if (positions[i + 1] < -10) { // Si caen fuera de la vista
          positions[i] = (Math.random() - 0.5) * 20;
          positions[i + 1] = 10; // Reaparecen en la parte superior
          positions[i + 2] = (Math.random() - 0.5) * 20;
        }
      }

      // Notificar a Three.js que los datos han cambiado
      this.snowParticles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  new SnowfallBackground(document.body);
});