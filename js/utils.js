import * as THREE from "three";

export const W = "w";
export const A = "a";
export const S = "s";
export const D = "d";
export const I = "i";
export const J = "j";
export const K = "k";
export const L = "l";
export const SHIFT = "shift";
export const DIRECTIONS = [W, A, S, D];
export const ACTIONS = [I, J, K, L];

export class DegRadHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return THREE.MathUtils.radToDeg(this.obj[this.prop]);
  }
  set value(v) {
    this.obj[this.prop] = THREE.MathUtils.degToRad(v);
  }
}
