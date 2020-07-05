import { Boilerplate } from "../boilerplate/boilerplate";
import { Vector3, Plane } from "three";
import { SolarSystem, SolarSystemParams } from "./solar-system";
import { PlanetParams } from "./planet";

export class SolarSystemStarter extends Boilerplate {
    solarSystem: SolarSystem;
    params: SolarSystemParams;
    selectedPlanetIndex = -1;
    inputView: ParamsInputView;
    pauseSimulation: boolean;
    pauseSimButton: HTMLInputElement;
    mousemoveListener: any;
    // Post creation hook 
    postInitHook() {
        this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        this.mousemoveListener = this.mouseDragPoint.bind(this);
        this.t = 0;

        this.solarSystem = new SolarSystem(SolarSystem.defaultSimParams());
        this.scene.add(this.solarSystem.group);
        this.params = SolarSystem.defaultSimParams();
        this.pauseSimButton = document.getElementById("pause-sim") as HTMLInputElement;
        this.pauseSimButton.addEventListener("click", this.pauseResume.bind(this));

        document.getElementById("reset-sim").addEventListener("click", this.simulate.bind(this));
        document.getElementById("add-planet").addEventListener("click", this.addNewPlanet.bind(this));
        document.getElementById("remove-planet").addEventListener("click", this.removePlanet.bind(this));
        document.getElementById("planet-list").addEventListener("change", this.selectPlanet.bind(this));
        const list = document.getElementById("planet-list") as HTMLSelectElement;
        this.params.planets.forEach(planet => {
            const option = document.createElement("option");
            option.textContent = planet.name;
            option.value = planet.name;
            list.options.add(option);

        });
        this.inputView = this.getInputView();
        this.pauseSimulation = false;
    }

    // Use this function to place all animation code
    animateHook() {
        if (this.solarSystem != null && !this.pauseSimulation) {
            this.t += 0.001;
            this.solarSystem.update(this.t);
        }
    }
    pauseResume() {
        if (this.pauseSimulation) {
            this.resume();
        } else {
            this.pause();
        }
    }
    pause() {
        this.pauseSimButton.value = "Resume Simulation";
        this.pauseSimulation = true;
    }
    resume() {
        this.pauseSimButton.value = "Pause Simulation";
        this.pauseSimulation = false;
    }
    /** 
     * This function destroys the old simulation and starts a new one based on
     * the current value in the parameters object
     */
    simulate() {
        if (this.solarSystem) {
            this.scene.remove(this.solarSystem.group);
            this.solarSystem.destroy();
        }
        this.selectPlanet();
        this.solarSystem = new SolarSystem(this.params);
        this.scene.add(this.solarSystem.group);
    }

    /**
     * When a planet is selected from the list, this function is called
     * First, it updates the currently selected planet by updating its 
     * parameters.
     * Then it retrieves the values for the new planet params and sets it on the
     * input boxes
     */
    selectPlanet() {
        const list = document.getElementById('planet-list') as HTMLSelectElement;
        if (this.selectedPlanetIndex >= 0) {
            this.params.planets[this.selectedPlanetIndex] = this.buildPlanetSimParamsObj();
        }
        console.log("Selected Befoe", this.selectedPlanetIndex);
        this.selectedPlanetIndex = list.selectedIndex;
        this.updateParamsView();
    }
    /**
     * Updates the input boxes with the value of the current params 
     */
    updateParamsView() {
        if (this.selectedPlanetIndex >= 0) {
            const planet = this.params.planets[this.selectedPlanetIndex];
            this.inputView.set(planet);
            this.updatePlanetOptions();
        }
    }

    updatePlanetOptions() {
        const list = document.getElementById('planet-list') as HTMLSelectElement;
        this.params.planets.forEach((planet, i)  => {
            const option = list.options.item(i);
            option.textContent = planet.name;
            option.value = planet.name;
        });
        
    }
    updateParamsWithLiveValue(index: number) {
        this.params.planets[index]= this.solarSystem.planets[index].getParams();
        const planet = this.params.planets[index]; 
        this.inputView.set(planet);
    }
    addNewPlanet() {
        this.params.planets.push(new PlanetParams());
        this.addPlanetOption(new PlanetParams());
        const list = document.getElementById('planet-list') as HTMLSelectElement;
        list.selectedIndex = list.length - 1;
    }

    removePlanet() {
        const list = document.getElementById('planet-list') as HTMLSelectElement;
        this.selectedPlanetIndex = list.selectedIndex;
        if (this.selectedPlanetIndex >= 0) {
            this.params.planets.splice(this.selectedPlanetIndex);
            const list = document.getElementById('planet-list') as HTMLSelectElement;
            list.options.remove(this.selectedPlanetIndex);
        }
        this.selectedPlanetIndex -= 1;
        list.selectedIndex = this.selectedPlanetIndex;

    }
    addPlanetOption(planet: PlanetParams) {
        const list = document.getElementById('planet-list') as HTMLSelectElement;
        const option = document.createElement("option");
        option.textContent = planet.name;
        option.value = planet.name;
        list.options.add(option);
    }
    buildPlanetSimParamsObj(): PlanetParams {
        if (this.selectedPlanetIndex >= 0) {
            let obj = this.params.planets[this.selectedPlanetIndex];

            obj.position = new Vector3(this.inputView.x_pos.valueAsNumber,
                this.inputView.y_pos.valueAsNumber,
                this.inputView.z_pos.valueAsNumber);
            obj.velocity = new Vector3(this.inputView.x_vel.valueAsNumber,
                this.inputView.y_vel.valueAsNumber,
                this.inputView.z_vel.valueAsNumber);
            obj.mass = this.inputView.mass.valueAsNumber;
            obj.name = this.inputView.name.value;
            return obj;
        }
    }

    getInputView(): ParamsInputView {
        let view = new ParamsInputView();
        view.x_pos = (document.getElementById("x_pos") as HTMLInputElement);
        view.y_pos = (document.getElementById("y_pos") as HTMLInputElement);
        view.z_pos = (document.getElementById("z_pos") as HTMLInputElement);
        view.x_vel = (document.getElementById("x_vel") as HTMLInputElement);
        view.y_vel = (document.getElementById("y_vel") as HTMLInputElement);
        view.z_vel = (document.getElementById("z_vel") as HTMLInputElement);
        view.mass = (document.getElementById("mass") as HTMLInputElement);
        view.name = (document.getElementById("p_name") as HTMLInputElement);
        return view;
    }

    raycast(e: any) {
        let intersected = false;

        if (this.solarSystem) {
            //1. sets the mouse position with a coordinate system where the center
            //   of the screen is the origin
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

            //2. set the picking ray from the camera position and mouse coordinates
            this.raycaster.setFromCamera(this.mouse, this.camera);
            //3. compute intersections
            var intersects = this.raycaster.intersectObjects(this.solarSystem.group.children);
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
        }
        return intersected;
    }
    onMouseDown(e: any) {
        let intersected = this.raycast(e);
        if (intersected) {
            this.pause();
            this.renderer.domElement.addEventListener('mousemove', this.mousemoveListener);
        }
    }

    mouseDragPoint(e: any) {
        if (this.pointSelected != null) {

            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
            let target = new Vector3();
            this.raycaster.setFromCamera(this.mouse, this.camera);
            this.raycaster.ray.intersectPlane(new Plane(new Vector3(0, 0, -1), 0), target)
            const index = this.pointSelected.userData.index;
            this.solarSystem.planets[index].setPosition(target.x, target.y, target.z);
            const list = document.getElementById('planet-list') as HTMLSelectElement;
            list.selectedIndex = index;
            this.selectPlanet();
            this.updateParamsWithLiveValue(index);
        }
    }

    onMouseUp(e: any) {
        this.renderer.domElement.removeEventListener('mousemove', this.mousemoveListener);
    }
}

/**
 * This class contains the different input structures that are contained in the HTML
 * view of the simulation parameters
 */
export class ParamsInputView {
    x_pos: HTMLInputElement;
    y_pos: HTMLInputElement;
    z_pos: HTMLInputElement;
    x_vel: HTMLInputElement;
    y_vel: HTMLInputElement;
    z_vel: HTMLInputElement;
    mass: HTMLInputElement;
    name: HTMLInputElement;
    set(planet: PlanetParams) {
        this.x_pos.valueAsNumber = planet.position.x;
        this.y_pos.valueAsNumber = planet.position.y;
        this.z_pos.valueAsNumber = planet.position.z;
        this.x_vel.valueAsNumber = planet.velocity.x;
        this.y_vel.valueAsNumber = planet.velocity.y;
        this.z_vel.valueAsNumber = planet.velocity.z;
        this.mass.valueAsNumber = planet.mass;
        this.name.value = planet.name;
    }
}