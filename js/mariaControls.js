import { CharacterControls } from "./characterControls";
import { W, A, S, D, DIRECTIONS, ACTIONS } from "./utils";

export class MariaControls extends CharacterControls {
  constructor(model, mixer, animationsMap, camera, currentAction) {
    super(model, mixer, animationsMap, camera, currentAction, 8);
  }

  update(delta, keysPressed) {
    // changing state
    const directionPressed = DIRECTIONS.some((key) => keysPressed[key] == true);
    const actionPressed = ACTIONS.some((key) => keysPressed[key] == true);

    var play = "";
    if (directionPressed) {
      play = "walk";
    } else if (actionPressed) {
      play = "slash";
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
    if (this.currentAction == "walk") {
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
    } else if (this.currentAction == "slash") {
      // run/walk velocity
      const velocity = 8;

      // move model & camera
      const moveX = this.walkDirection.x * velocity * delta;
      const moveZ = this.walkDirection.z * velocity * delta;
      this.model.position.x += moveX;
      this.model.position.z += moveZ;
    }

    this.mixer.update(delta);
  }
}
