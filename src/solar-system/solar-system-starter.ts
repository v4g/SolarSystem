import { Boilerplate } from "../boilerplate/boilerplate";
import { Vector3, Plane } from "three";
import { SolarSystem } from "./solar-system";

export class SolarSystemStarter extends Boilerplate {
    solarSystem: SolarSystem;
    // Post creation hook 
    postInitHook() {
        this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);

        this.t = 0;

        this.solarSystem = new SolarSystem();
        this.scene.add(this.solarSystem.group);
    }

    // Use this function to place all animation code
    animateHook() {
        if (this.solarSystem != null) {
            this.t += 0.001;
            this.solarSystem.update(this.t);
        }
    }

    raycast(e: any) {

        //1. sets the mouse position with a coordinate system where the center
        //   of the screen is the origin
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

        //2. set the picking ray from the camera position and mouse coordinates
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersected = false;
        //3. compute intersections
        var intersects = this.raycaster.intersectObjects(this.pointSet.group.children);
        this.pointSelected = null;
        for (var i = 0; i < intersects.length; i++) {
            this.pointSelected = intersects[i].object;
            /*
                An intersection has the following properties :
                    - object : intersected object (THREE.Mesh)
                    - distance : distance from camera to intersection (number)
                    - face : intersected face (THREE.Face3)
                    - faceIndex : intersected face index (number)
                    - point : intersection point (THREE.Vector3)
                    - uv : intersection point in the object's UV coordinates (THREE.Vector2)
            */
            intersected = true;
        }
        return intersected;
    }
    onMouseDown(e: any) {
        let intersected = this.raycast(e);
        if (intersected) {
            this.renderer.domElement.addEventListener('mousemove', this.mouseDragPoint);
        }
    }

    mouseDragPoint(e: any) {
        if (this.pointSelected != null) {

            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
            let target = new Vector3();
            this.raycaster.setFromCamera(this.mouse, this.camera);
            this.raycaster.ray.intersectPlane(new Plane(new Vector3(0, 0, -1), 0), target)
            this.pointSelected.position.copy(target);
        }
    }

    onMouseUp(e: any) {
        this.renderer.domElement.removeEventListener('mousemove', this.mouseDragPoint);
    }
}