declare module 'three/examples/jsm/controls/OrbitControls' {
  import { EventDispatcher, Camera, Vector3 } from 'three';

  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement);
    target: Vector3;
    enabled: boolean;
    enableRotate: boolean;
    update(): void;
    dispose(): void;
  }

  export default OrbitControls;
}
