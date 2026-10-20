import * as THREE from 'three';
import { STLLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/STLLoader.js';

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('a[href^="#"]').forEach((item) => item.removeAttribute('data-active'));
    link.setAttribute('data-active', 'true');
  });
});

const canvas = document.querySelector('#icon-canvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas) {
  const host = canvas.parentElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0.15, 4.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.add(new THREE.HemisphereLight(0xf4f0e8, 0x163f72, 2.4));
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
  keyLight.position.set(3, 4, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);
  const blueFill = new THREE.PointLight(0x2364aa, 2.4, 8);
  blueFill.position.set(-3, -1, 3);
  scene.add(blueFill);

  const modelGroup = new THREE.Group();
  scene.add(modelGroup);
  let targetRotationX = 0;
  let targetRotationY = 0;
  let model;
  const baseRotationX = 0;

  const loader = new STLLoader();
  loader.load('./assets/famfort-icon.stl', (geometry) => {
    geometry.computeVertexNormals();
    geometry.center();
    geometry.computeBoundingSphere();
    const radius = geometry.boundingSphere?.radius || 1;
    const scale = 1.22 / radius;
    geometry.scale(scale, scale, scale);

    const material = new THREE.MeshStandardMaterial({
      color: 0x2364aa,
      roughness: 0.32,
      metalness: 0.12,
    });
    model = new THREE.Mesh(geometry, material);
    model.castShadow = true;
    model.receiveShadow = true;
    model.rotation.x = baseRotationX;
    modelGroup.add(model);
  }, undefined, (error) => {
    console.warn('FAMFORT STL could not be loaded.', error);
  });

  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  host.addEventListener('pointermove', (event) => {
    if (reducedMotion) return;
    const rect = host.getBoundingClientRect();
    targetRotationY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.45;
    targetRotationX = ((event.clientY - rect.top) / rect.height - 0.5) * -0.3;
  });
  host.addEventListener('pointerleave', () => {
    targetRotationX = 0;
    targetRotationY = 0;
  });

  const clock = new THREE.Clock();
  const render = () => {
    const elapsed = clock.getElapsedTime();
    if (model) {
      // الدوران حول المحور الطولي للمجسم: Y هو المحور الرأسي بعد ضبط الوضع الأمامي.
      model.rotation.y = reducedMotion ? 0 : elapsed * 0.72 + targetRotationY * 0.35;
      model.rotation.x = baseRotationX + targetRotationX;
      model.position.y = reducedMotion ? 0 : Math.sin(elapsed * 1.15) * 0.04;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };
  render();
}
