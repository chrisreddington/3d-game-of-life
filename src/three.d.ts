declare module 'three/examples/jsm/controls/OrbitControls' {
    import { Camera, Object3D, MOUSE, TOUCH, Vector3 } from 'three';

    export class OrbitControls {
        constructor(object: Camera, domElement?: HTMLElement);

        object: Camera;
        domElement: HTMLElement | Document;

        enabled: boolean;
        target: Vector3;

        minDistance: number;
        maxDistance: number;

        minZoom: number;
        maxZoom: number;

        minPolarAngle: number;
        maxPolarAngle: number;

        minAzimuthAngle: number;
        maxAzimuthAngle: number;

        enableDamping: boolean;
        dampingFactor: number;

        enableZoom: boolean;
        zoomSpeed: number;

        enableRotate: boolean;
        rotateSpeed: number;

        enablePan: boolean;
        panSpeed: number;
        screenSpacePanning: boolean;
        keyPanSpeed: number;

        autoRotate: boolean;
        autoRotateSpeed: number;

        keys: { LEFT: string; UP: string; RIGHT: string; BOTTOM: string; };
        mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE; };
        touches: { ONE: TOUCH; TWO: TOUCH; };

        update(): boolean;
        dispose(): void;
        getAzimuthalAngle(): number;
        getPolarAngle(): number;
        saveState(): void;
        reset(): void;
    }
}