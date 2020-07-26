import { WebGLRenderer, Scene, PerspectiveCamera, Raycaster, Color, Vector3, Plane, Object3D } from "three";
import { PointSet } from "./point-set";
import { Interpolation } from "../interpolation/interpolation";

export class Boilerplate {

    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    raycaster: Raycaster;
    mouse = { x: 0, y: 0 };
    pointSet: PointSet;
    interpolatedPoints: PointSet;
    pointSelected !: Object3D | null;
    interpolation: Interpolation;
    t: number;
    aspectRatio: number;
    constructor() {

        var container = document.createElement('div');
        this.raycaster = new Raycaster();
        document.body.appendChild(container);
        this.renderer = new WebGLRenderer();
        // this.renderer.setPixelRatio(window.devicePixelRatio);
        var width = window.outerWidth;
        var height = window.outerHeight;
        this.renderer.setSize(width, height);
        container.appendChild(this.renderer.domElement);
        console.log(window.devicePixelRatio);
        this.aspectRatio = window.innerWidth / window.innerHeight;
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
        this.camera.position.set(0, 0, 200);
        this.camera.lookAt(0, 0, 0);
        setTimeout(this.onWindowResize.bind(this), 3000);
        this.scene = new Scene();
        this.scene.background = new Color('#000000');
        console.log(window.innerWidth, window.innerHeight);
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        this.postInitHook();

    }

    // Post creation hook 
    postInitHook() {
    }

    onWindowResize() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        console.log("Resize was called", width, height);
        this.camera.aspect = width /height;
        this.camera.updateProjectionMatrix();
        this.aspectRatio = width / height;
        document.body.style.maxWidth = width+"px";
        document.body.style.maxHeight = height+"px";
        
        this.renderer.setSize(width, height);

    }

    //

    animate() {
        // this.onWindowResize();
        this.animateHook();
        requestAnimationFrame(this.animate.bind(this));
        this.render();
        this.t += 1;
    }

    // Use this function to place all animation code
    animateHook() {
    }

    render() {

        this.renderer.render(this.scene, this.camera);
    }

    
}
