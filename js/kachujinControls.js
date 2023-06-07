import { CharacterControls } from "./characterControls";
import { I, J, K, L, DIRECTIONS, ACTIONS } from "./utils";

export class KachujinControls extends CharacterControls {
  runVelocity = 15;

  constructor(model, mixer, animationsMap, camera, currentAction) {
    super(model, mixer, animationsMap, camera, currentAction, 4);
  }

  update(delta, keysPressed) {
    // changing state
    const directionPressed = DIRECTIONS.some((key) => keysPressed[key] == true);

    var play = "";
    if (directionPressed && this.toggleRun) {
      play = "run";
    } else if (directionPressed) {
      play = "walk";
    } else if (keysPressed[I]) {
      play = "dropkick";
    } else if (keysPressed[J]) {
      play = "flyingcombo";
    } else if (keysPressed[K]) {
      play = "huricanekick";
    } else if (keysPressed[L]) {
      play = "martelo";
    } else {
      play = "idle";
    }

    if (this.currentAction != play) {
      const toPlay = this.animationsMap.get(play);
      const current = this.animationsMap.get(this.currentAction);

      current.fadeOut(this.fadeDuration);
      toPlay.reset().fadeIn(this.fadeDuration).play();

      this.currentAction = play;
    }

    //
    if (this.currentAction == "walk" || this.currentAction == "run") {
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
      const velocity =
        this.currentAction == "run" ? this.runVelocity : this.walkVelocity;

      // move model & camera
      const moveX = this.walkDirection.x * velocity * delta;
      const moveZ = this.walkDirection.z * velocity * delta;
      this.model.position.x += moveX;
      this.model.position.z += moveZ;
    } else if (this.currentAction == "flyingcombo") {
      // run/walk velocity
      const velocity = 1;

      // move model & camera
      const moveX = this.walkDirection.x * velocity * delta;
      const moveZ = this.walkDirection.z * velocity * delta;
      this.model.position.x += moveX * 6;
      this.model.position.z += moveZ * 6;
    }

    this.mixer.update(delta);
  }
}
