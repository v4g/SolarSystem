import { Boilerplate } from "../boilerplate/boilerplate";
import { Vector3, Plane } from "three";
import { SolarSystem, SolarSystemParams } from "./solar-system";
import { PlanetParams } from "./planet";
import { timeStamp } from "console";

export class SolarSystemStarter extends Boilerplate {
    solarSystem: SolarSystem;
    params: SolarSystemParams;
    selectedPlanetIndex = -1;
    inputView: ParamsInputView;
    pauseSimulation: boolean;
    pauseSimButton: HTMLInputElement;
    mousemoveListener: any;
    startParams: SolarSystemParams;
    // Post creation hook 
    postInitHook() {
        this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        this.mousemoveListener = this.mouseDragPoint.bind(this);
        this.t = 0;

        this.solarSystem = new SolarSystem(SolarSystem.defaultSimParams());
        this.scene.add(this.solarSystem.group);
        this.params = SolarSystem.defaultSimParams();
        this.startParams = this.params.clone();
        this.pauseSimButton = document.getElementById("pause-sim") as HTMLInputElement;
        this.pauseSimButton.addEventListener("click", this.pauseResume.bind(this));

        document.getElementById("reset-sim").addEventListener("click", this.simulate.bind(this));
        document.getElementById("add-planet").addEventListener("click", this.addNewPlanet.bind(this));
        document.getElementById("remove-planet").addEventListener("click", this.removePlanet.bind(this));
        document.getElementById("lock-value").addEventListener("click", this.lockValues.bind(this));
        document.getElementById("planet-list").addEventListener("change", this.selectPlanet.bind(this));
        this.inputView = this.getInputView();
        this.buildPlanetOptions();
        this.resume();
    }

    // Use this function to place all animation code
    animateHook() {
        if (this.solarSystem != null && !this.pauseSimulation) {
            this.t += 0.001;
            this.solarSystem.update(this.t);
            this.updateParamsWithLiveValues();
            if (this.selectedPlanetIndex >= 0) {
                this.inputView.set(this.params.planets[this.selectedPlanetIndex]);
            }
        }
    }

    buildPlanetOptions() {
        const list = document.getElementById("planet-list") as HTMLSelectElement;
        for (let i = list.options.length; i >= 0; i--) {
            list.options.remove(i);
        }
        this.params.planets.forEach(planet => {
            const option = document.createElement("option");
            option.textContent = planet.name;
            option.value = planet.name;
            list.options.add(option);
        });        
    }
    pauseResume() {
        if (this.pauseSimulation) {
            this.resume();
        } else {
            this.pause();
        }
    }
    pause() {
        this.pauseSimButton.textContent = "Resume";
        this.pauseSimulation = true;
        this.inputView.enable();
    }
    resume() {
        this.pauseSimButton.textContent = "Pause";
        this.pauseSimulation = false;
        this.inputView.disable();
    }

    /**
     * Saves the current state of the inputs as the values to reset the simulation
     * to
     */
    lockValues() {
        this.selectPlanet();
        console.log("Locking");
        this.startParams = this.params.clone();
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
        this.solarSystem = new SolarSystem(this.startParams);
        this.params = this.startParams.clone();
        this.buildPlanetOptions();
        if (this.selectedPlanetIndex >= this.params.planets.length)
            this.selectedPlanetIndex = -1;
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
        this.params.planets.forEach((planet, i) => {
            const option = list.options.item(i);
            option.textContent = planet.name;
            option.value = planet.name;
        });

    }
    updateParamsWithLiveValues() {
        for (let i = 0; i < this.params.planets.length; i++) {
            this.params.planets[i] = this.solarSystem.planets[i].getParams();
        }
    }

    updateParamsWithLiveValue(index: number) {
        this.params.planets[index] = this.solarSystem.planets[index].getParams();
        const planet = this.params.planets[index];
        this.inputView.set(planet);
    }
    addNewPlanet() {
        const len = this.params.planets.push(new PlanetParams());
        this.addPlanetOption(new PlanetParams());
        const list = document.getElementById('planet-list') as HTMLSelectElement;
        // Why isn't the list on change being called here?
        list.selectedIndex = list.options.length - 1;
        this.selectedPlanetIndex = list.selectedIndex;
        this.solarSystem.addPlanet(this.params.planets[len - 1]);
        this.updateParamsWithLiveValue(this.selectedPlanetIndex);
        this.pause();
    }

    removePlanet() {
        const list = document.getElementById('planet-list') as HTMLSelectElement;
        this.selectedPlanetIndex = list.selectedIndex;
        const selected = list.selectedIndex;
        if (this.selectedPlanetIndex >= 0) {
            this.params.planets.splice(this.selectedPlanetIndex);
            const list = document.getElementById('planet-list') as HTMLSelectElement;
            list.options.remove(this.selectedPlanetIndex);
        }
        this.selectedPlanetIndex = -1;
        list.selectedIndex = selected - 1;
        this.selectedPlanetIndex = list.selectedIndex;
        this.updateParamsView();

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
            this.onPlanetClicked(e);
        }
    }

    mouseDragPoint(e: any) {
        if (this.pointSelected != null) {
            this.onPlanetClicked(e);
        }
    }

    onMouseUp(e: any) {
        this.renderer.domElement.removeEventListener('mousemove', this.mousemoveListener);
    }

    onPlanetClicked(e: any) {
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
        this.x_pos.valueAsNumber = parseFloat(planet.position.x.toPrecision(2));
        this.y_pos.valueAsNumber = parseFloat(planet.position.y.toPrecision(2));
        this.z_pos.valueAsNumber = parseFloat(planet.position.z.toPrecision(2));
        this.x_vel.valueAsNumber = parseFloat(planet.velocity.x.toPrecision(2));
        this.y_vel.valueAsNumber = parseFloat(planet.velocity.y.toPrecision(2));
        this.z_vel.valueAsNumber = parseFloat(planet.velocity.z.toPrecision(2));
        this.mass.valueAsNumber = planet.mass;
        this.name.value = planet.name;
    }

    enable() {
        this.x_pos.disabled = false;
        this.y_pos.disabled = false;
        this.z_pos.disabled = false;
        this.x_vel.disabled = false;
        this.y_vel.disabled = false;
        this.z_vel.disabled = false;
        this.mass.disabled = false;
        this.name.disabled = false;
    }

    disable() {
        this.x_pos.disabled = true;
        this.y_pos.disabled = true;
        this.z_pos.disabled = true;
        this.x_vel.disabled = true;
        this.y_vel.disabled = true;
        this.z_vel.disabled = true;
        this.mass.disabled = true;
        this.name.disabled = true;
    }
}