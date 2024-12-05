import * as THREE from '/node_modules/three/build/three.module.js';
import { EffectComposer } from '/node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';

class SmokeBackground {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
    this.composer = this.setupPostProcessing();
    this.smokeParticles = null;
    this.clock = new THREE.Clock();

    this.initScene();
    this.animate();
  }

  createCamera() {
    const aspectRatio = this.container.clientWidth / this.container.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.z = 5;
    return camera;
  }

  createRenderer() {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: -1;
    `;
    this.container.appendChild(renderer.domElement);
    return renderer;
  }

  setupPostProcessing() {
    const composer = new EffectComposer(this.renderer);
    composer.addPass(new RenderPass(this.scene, this.camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    composer.addPass(bloomPass);

    return composer;
  }

  initScene() {
    this.createSmokeParticles();
    window.addEventListener('resize', () => this.onResize());
  }

  createSmokeParticles() {
    const smokeTexture = new THREE.TextureLoader().load('smoke-texture.jpg');
    const smokeMaterial = new THREE.PointsMaterial({
      color: 0x333333,
      size: 0.5,
      map: smokeTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.5,
    });

    const positions = Array.from({ length: 500 * 3 }, () => Math.random() * 10 - 5);
    for (let i = 2; i < positions.length; i += 3) {
      positions[i] -= 5; // Adjust Z positions
    }

    const smokeGeometry = new THREE.BufferGeometry();
    smokeGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    this.smokeParticles = new THREE.Points(smokeGeometry, smokeMaterial);
    this.scene.add(this.smokeParticles);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    this.updateSmokeParticles(delta);
    this.composer.render();
  }

  updateSmokeParticles(delta) {
    if (!this.smokeParticles) return;

    const positions = this.smokeParticles.geometry.attributes.position.array;
    for (let i = 2; i < positions.length; i += 3) {
      positions[i] += delta * 0.5; // Move along Z axis
      if (positions[i] > 5) positions[i] = -10;
    }
    this.smokeParticles.geometry.attributes.position.needsUpdate = true;
  }

  onResize() {
    const aspectRatio = this.container.clientWidth / this.container.clientHeight;
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}

// Initialize the smoke background when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');
  if (container) new SmokeBackground(container);
});