import * as THREE from "three";
import { W, A, S, D, DIRECTIONS } from "./utils";

export class CharacterControls {
  model;
  mixer;
  animationsMap = new Map(); // Walk, Idle
  camera;

  // state
  currentAction;

  // temporary data
  walkDirection = new THREE.Vector3();
  rotateAngle = new THREE.Vector3(0, 1, 0);
  rotateQuarternion = new THREE.Quaternion();
  cameraTarget = new THREE.Vector3();

  // constants
  fadeDuration = 0.2;
  walkVelocity = 4;
  angleTuned = -135;

  constructor(
    model,
    mixer,
    animationsMap,
    camera,
    currentAction,
    walkVelocity = 4
  ) {
    this.model = model;
    this.mixer = mixer;
    this.animationsMap = animationsMap;
    this.camera = camera;
    this.currentAction = currentAction;
    this.walkVelocity = walkVelocity;

    this.animationsMap.forEach((value, key) => {
      if (key == currentAction) {
        value.play();
      }
    });
  }

  // calculate offset
  directionOffset(keysPressed) {
    var directionOffset = 0; // w

    if (keysPressed[W]) {
      if (keysPressed[A]) {
        directionOffset = Math.PI / 4; // w+a
      } else if (keysPressed[D]) {
        directionOffset = -Math.PI / 4; // w+d
      }
    } else if (keysPressed[S]) {
      if (keysPressed[A]) {
        directionOffset = Math.PI / 4 + Math.PI / 2; // s+a
      } else if (keysPressed[D]) {
        directionOffset = -Math.PI / 4 - Math.PI / 2; // s+d
      } else {
        directionOffset = Math.PI; // s
      }
    } else if (keysPressed[A]) {
      directionOffset = Math.PI / 2; // a
    } else if (keysPressed[D]) {
      directionOffset = -Math.PI / 2; // d
    }

    return directionOffset;
  }

  // @Override this in subclass
  // like requestAnimationFrame
  update(delta, keysPressed) {
    // changing state
    const directionPressed = DIRECTIONS.some((key) => keysPressed[key] == true);

    var play = "";
    if (directionPressed) {
      play = "catwalk";
    } else {
      play = "hiphop";
    }

    if (this.currentAction != play) {
      const toPlay = this.animationsMap.get(play);
      const current = this.animationsMap.get(this.currentAction);

      current.fadeOut(this.fadeDuration);
      toPlay.reset().fadeIn(this.fadeDuration).play();

      this.currentAction = play;
    }

    //
    if (this.currentAction == "catwalk") {
      // calculate towards camera direction
      var angleYCameraDirection = Math.atan2(
        this.camera.position.x - this.model.position.x,
        this.camera.position.z - this.model.position.z
      );
      // diagonal movement angle offset
      var directionOffset = this.directionOffset(keysPressed);

      // rotate model
      this.rotateQuarternion.setFromAxisAngle(
        this.rotateAngle,
        angleYCameraDirection + this.angleTuned + directionOffset
      );
      this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2);

      // calculate direction
      this.camera.getWorldDirection(this.walkDirection);
      this.walkDirection.y = 0;
      this.walkDirection.normalize();
      this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

      // run/walk velocity
      const velocity = this.walkVelocity;

      // move model & camera
      const moveX = this.walkDirection.x * velocity * delta;
      const moveZ = this.walkDirection.z * velocity * delta;
      this.model.position.x += moveX;
      this.model.position.z += moveZ;
    }

    this.mixer.update(delta);
  }
}
