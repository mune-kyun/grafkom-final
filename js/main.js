import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "dat.gui";

import bg2 from "../img/bg2.jpg";
import bg3 from "../img/bg3.jpg";
import shion1 from "../img/shion1.png";
import shion2 from "../img/shion2.jpg";
import shion3 from "../img/shion3.png";

const arissaURL = new URL("../assets/arissa.glb", import.meta.url);

// canvas
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//
// START
//

// Camera
const fov = 75;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 2, 5);

// Orbit Camera
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

// Scene
const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();

// Background
const backgroundCubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = backgroundCubeTextureLoader.load([
  bg2,
  bg2,
  bg3,
  bg3,
  bg2,
  bg2,
]);

// Raycaster
const rayCaster = new THREE.Raycaster();

// Mouse
const mousePosition = new THREE.Vector2();
window.addEventListener("mousemove", function (e) {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener("click", function (e) {
  rayCaster.setFromCamera(mousePosition, camera);
  const intersects = rayCaster.intersectObjects(scene.children);

  // handle middle cube
  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.id === cubeId) {
      cubeState = (cubeState + 1) % 3;
      const cubeImg =
        cubeState == 0 ? shion1 : cubeState == 1 ? shion2 : shion3;
      cube.material = [
        new THREE.MeshBasicMaterial({ map: textureLoader.load(cubeImg) }),
        new THREE.MeshBasicMaterial({ map: textureLoader.load(cubeImg) }),
        new THREE.MeshBasicMaterial({ map: textureLoader.load(cubeImg) }),
        new THREE.MeshBasicMaterial({ map: textureLoader.load(cubeImg) }),
        new THREE.MeshBasicMaterial({ map: textureLoader.load(cubeImg) }),
        new THREE.MeshBasicMaterial({ map: textureLoader.load(cubeImg) }),
      ];
    }
  }
});

// Axes helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Grid
const gridHelper = new THREE.GridHelper(50);
scene.add(gridHelper);

// Plane
const planeGeometry = new THREE.PlaneGeometry(100, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(directionalLight);
directionalLight.position.set(-30, 50, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -12;

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(dLightHelper);

const dLightShadowHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
scene.add(dLightShadowHelper);

// Sphere
const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0x0000ff,
  wireframe: false,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.position.set(-10, 10, 0);
sphere.castShadow = true;

// Cube
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMultiMaterial = [
  new THREE.MeshBasicMaterial({ map: textureLoader.load(shion1) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(shion1) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(shion1) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(shion1) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(shion1) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(shion1) }),
];
const cube = new THREE.Mesh(cubeGeometry, cubeMultiMaterial);
scene.add(cube);
cube.position.y = 2;
const cubeId = cube.id;
let cubeState = 0;

// GUI
const gui = new dat.GUI();
const options = {
  sphereColor: "#ffea00",
};
gui.addColor(options, "sphereColor").onChange(function (e) {
  sphere.material.color.set(e);
});

let mixer;

// Arissa Model
const assetLoader = new GLTFLoader();
assetLoader.load(
  arissaURL.href,
  function (gltf) {
    const model = gltf.scene;
    model.position.set(-10, 2, 10);
    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    const clip = THREE.AnimationClip.findByName(clips, "hiphop");
    const action = mixer.clipAction(clip);
    action.play();
  },
  undefined,
  function (error) {
    console.log(error);
  }
);

// Clock
const clock = new THREE.Clock();

// Animate loop
function animate(time) {
  cube.rotation.x = time / 1000;
  cube.rotation.y = time / 1000;

  if (mixer) mixer.update(clock.getDelta());

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
