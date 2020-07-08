import { Boilerplate } from "../boilerplate/boilerplate";
import { Vector3, Plane } from "three";
import { SolarSystem, SolarSystemParams } from "./solar-system";
import { PlanetParams } from "./planet"; import { GravityForce } from "../particle-system/particle-system";
;

export class SolarSystemStarter extends Boilerplate {
    solarSystem: SolarSystem;
    params: SolarSystemParams;
    selectedPlanetIndex = -1;
    inputView: ParamsInputView;
    pauseSimulation: boolean;
    mousemoveListener: any;
    startParams: SolarSystemParams;
    velocityVisible: boolean;
    simulationSpeed: number;
    gConstant: HTMLInputElement
    pauseSimButton: HTMLInputElement;
    checkbox: HTMLInputElement;
    simSpeedHTML: HTMLInputElement;
    units: ScaledUnits;
    // Post creation hook 
    postInitHook() {
        this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        this.mousemoveListener = this.mouseDragPoint.bind(this);
        this.t = 0;
        this.simulationSpeed = 0.01;

        this.pauseSimButton = document.getElementById("pause-sim") as HTMLInputElement;
        this.pauseSimButton.addEventListener("click", this.pauseResume.bind(this));

        document.getElementById("reset-sim").addEventListener("click", this.simulate.bind(this));
        document.getElementById("add-planet").addEventListener("click", this.addNewPlanet.bind(this));
        document.getElementById("remove-planet").addEventListener("click", this.removePlanet.bind(this));
        document.getElementById("lock-value").addEventListener("click", this.lockValues.bind(this));
        document.getElementById("planet-list").addEventListener("change", this.selectPlanet.bind(this));
        this.simSpeedHTML = document.getElementById("sim-speed") as HTMLInputElement;
        this.simSpeedHTML.addEventListener("change", this.updateSimSpeed.bind(this));
        this.simSpeedHTML.valueAsNumber = this.simulationSpeed;
        this.gConstant = document.getElementById("g-constant") as HTMLInputElement;
        this.gConstant.addEventListener("change", this.updateGConstant.bind(this));
        this.checkbox = document.getElementById("velocity-visible") as HTMLInputElement;
        this.checkbox.addEventListener("change", this.setVelocityVisibility.bind(this));
        this.inputView = this.getInputView();
        this.velocityVisible = false;
        this.calculateScaledG();

        this.params = this.defaultSimParams();
        this.startParams = this.params.clone();

        this.solarSystem = new SolarSystem(this.params);
        this.updateGConstant();
        this.scene.add(this.solarSystem.group);

        this.buildPlanetOptions();
        this.resume();

    }

    defaultSimParams(): SolarSystemParams {
        let params = new SolarSystemParams();
        const values = new Array<Array<any>>(); // Values on 7th July
        values.push(new Array<any>('Sun', 0, 0, 0, 0, 0, 0, '#d6d01e', SolarSystem.SUNS_MASS, 0.5)); //sun
        values.push(new Array<any>('Mercury', 2.969770142937778E+10, -5.834674421582220E+10, -7.492028038583037E+09,
        3.366903971984620E+04, 2.452271301668723E+04, -1.084683781571878E+03, '#f54f40', 3.302e23, 0.4)); //mars
            values.push(new Array<any>('Venus', 6.392025365556467E+10, -8.807847170353863E+10, -4.897273894079294E+09,
            2.811050684887783E+04, 2.044576948803772E+04, -1.341593734249432E+03, '#f54f40', 48.685e23, 0.4)); //mars
        values.push(new Array<any>('Earth', 3.954577361582965E+10, -1.468626167963164E+11, 6.990276396304369E+06,
            2.826885958675343E+04, 7.627209736985429E+03, 4.962096518887904E-01, '#57a5c9', SolarSystem.EARTHS_MASS, 0.4)); //earth
            values.push(new Array<any>('Mars', 1.559338989683880E+11, -1.366673941517965E+11, -6.689125437910400E+09,
            1.689119984009652E+04, 2.029578319586353E+04, 1.091272190740256E+01, '#f54f40', 6.4171e23, 0.4)); //mars
            values.push(new Array<any>('Jupiter', 2.820250486756812E+11, -7.183389321689687E+11, -3.326334195901930E+09,
            1.201775975241539E+04, 5.396479630321678E+03, -2.913036386668424E+02, '#f54f40', 1898.13e24, 0.4)); //mars
            values.push(new Array<any>('Saturn', 7.016376298753586E+11, -1.323367975983804E+12, -4.918155507721782E+09,
            8.013002174446694E+03, 4.504475475243400E+03, -3.972410034484997E+02, '#f54f40', 5.6834e26, 0.4)); //mars
            values.push(new Array<any>('Uranus', 2.361547009430319E+12, 1.786580025186876E+12, -2.395450073663449E+10,
            -4.147403865575232E+03, 5.118871847171336E+03, 7.279300901810748E+01, '#f54f40', 86.813e24, 0.4)); //mars
            values.push(new Array<any>('Neptune', 4.392215141217960E+12, -8.654609667080582E+11, -8.341322119960582E+10,
            1.027226060586543E+03, 5.371496217312306E+03, -1.347116154450971E+02, '#f54f40', 102.413e24, 0.4)); //mars
        values.forEach(v => {
            const p = new PlanetParams(v[0], new Vector3(v[1], v[2], v[3]), new Vector3(v[4], v[5], v[6]), v[7], v[8]);
            p.convertUnits(this.units);
            params.planets.push(p);
        })
        // const earth_distance = this.units.getScaledDistance(SolarSystem.EARTH_TO_SUN);
        // const earth_vel = this.units.getScaledVelocity(SolarSystem.EARTHS_VELOCITY);
        // const sun_mass = this.units.getScaledMass(SolarSystem.SUNS_MASS);
        // const earth_mass = this.units.getScaledMass(SolarSystem.EARTHS_MASS);
        // const moon_dist = earth_distance + this.units.getScaledDistance(SolarSystem.EARTH_TO_MOON);
        // const moon_vel = this.units.getScaledVelocity(SolarSystem.MOONS_VELOCITY);
        // const moon_mass = this.units.getScaledMass(SolarSystem.MOONS_MASS);
        // const mars_dist = this.units.getScaledDistance(SolarSystem.MARS_TO_SUN);
        // const mars_vel = this.units.getScaledVelocity(SolarSystem.MARS_VELOCITY);
        // const mars_mass = this.units.getScaledMass(SolarSystem.MARS_MASS);
        // params.planets.push(new PlanetParams('Sun', new Vector3(0, 0, 0), new Vector3(0, 0, 0), '#d6d01e', sun_mass));
        // params.planets.push(new PlanetParams('Earth', new Vector3(earth_distance, 0, 0), new Vector3(0, earth_vel, 0),
        //     '#57a5c9', earth_mass, 0.1));
        // params.planets.push(new PlanetParams('Moon', new Vector3(moon_dist, 0, 0), new Vector3(0, moon_vel, 0),
        //     '#b4bfbe', moon_mass, 0.1));
        // params.planets.push(new PlanetParams('Mars', new Vector3(mars_dist, 0, 0), new Vector3(0, mars_vel, 0),
        //     '#f54f40', mars_mass, 0.1));
        return params;
    }

    calculateScaledG() {
        const units = new ScaledUnits();
        units.setKgsScale(SolarSystem.EARTHS_MASS);
        units.setMetresScale(SolarSystem.EARTH_TO_SUN, 10);
        units.setTimeScale(SolarSystem.YEAR_IN_SECONDS, 20 * 10);
        const g = GravityForce.calculate(units.kgs, units.metres, units.seconds);
        this.gConstant.valueAsNumber = g;
        this.units = units;
    }
    // Use this function to place all animation code
    animateHook() {
        if (this.solarSystem != null && !this.pauseSimulation) {
            this.solarSystem.update(this.simulationSpeed);
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
        this.solarSystem.velocitiesVisible(true);
    }
    resume() {
        this.pauseSimButton.textContent = "Pause";
        this.pauseSimulation = false;
        this.inputView.disable();
        this.solarSystem.velocitiesVisible(this.velocityVisible);

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
        this.solarSystem.velocitiesVisible(this.velocityVisible);
        this.buildPlanetOptions();
        this.calculateScaledG();

        this.updateGConstant();
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
            this.params.planets.splice(this.selectedPlanetIndex, 1);
            const list = document.getElementById('planet-list') as HTMLSelectElement;
            list.options.remove(this.selectedPlanetIndex);
        }
        this.solarSystem.removePlanet(this.selectedPlanetIndex);
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

    velocitiesVisible(b: boolean) {
        this.solarSystem.velocitiesVisible(b);
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
    onMouseDown(e: MouseEvent) {
        let intersected = this.raycast(e);
        if (intersected) {
            this.pause();
            this.renderer.domElement.addEventListener('mousemove', this.mousemoveListener);
            this.onPlanetClicked(e);
            if (e.button == 2)
                e.preventDefault();
        }
    }

    mouseDragPoint(e: MouseEvent) {
        if (this.pointSelected != null) {
            this.onPlanetClicked(e);
        }
    }

    onMouseUp(e: any) {
        this.renderer.domElement.removeEventListener('mousemove', this.mousemoveListener);
    }

    onPlanetClicked(e: MouseEvent) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
        let target = new Vector3();
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.raycaster.ray.intersectPlane(new Plane(new Vector3(0, 0, -1), 0), target)
        const index = this.pointSelected.userData.index;
        console.log(e.buttons);
        if (e.buttons == 1) { //left button clicked
            this.solarSystem.planets[index].setPosition(target.x, target.y, target.z);
        }
        else if (e.buttons == 2) { //right button clicked
            const planet = this.solarSystem.planets[index];
            const vel = target.sub(planet.getPosition()).divideScalar(SolarSystem.ARROW_SCALE);
            planet.setVelocity(vel.x, vel.y, vel.z);
        }
        const list = document.getElementById('planet-list') as HTMLSelectElement;
        list.selectedIndex = index;
        this.selectPlanet();
        this.updateParamsWithLiveValue(index);
    }
    setVelocityVisibility(e: InputEvent) {
        this.velocityVisible = this.checkbox.checked;
        if (this.checkbox.checked) {
            this.velocitiesVisible(true);
        } else {
            this.velocitiesVisible(false);
        }
    }

    updateGConstant() {
        this.solarSystem.gravity.G = this.gConstant.valueAsNumber;
    }

    updateSimSpeed() {
        this.simulationSpeed = this.simSpeedHTML.valueAsNumber;
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

export class ScaledUnits {
    private _metres: number; // the number of metres in new unit
    private _kilograms: number; // the number of kilograms in new unit
    private _seconds: number; // the number of kilograms in new unit

    constructor(metres = 1, kgs = 1, seconds = 1) {
        this._metres = metres;
        this._kilograms = kgs;
        this._seconds = seconds;
    }
    /**
     * Sets the new unit of metres
     * @param val The number of meters that go into the new unit wrt to the value given in to
     * @param to 
     */
    setMetresScale(val: number, to = 1) {
        this._metres = val / to;
    }

    /**
     * Sets the new unit of kgs
     * @param val The number of kgs that go into the new unit wrt to the value given in to
     * @param to 
     */
    setKgsScale(val: number, to = 1) {
        this._kilograms = val / to;
    }
    /**
      * Sets the new unit of time
      * @param val The number of seconds that go into the new unit wrt to the value given in to
      * @param to 
      */
    setTimeScale(val: number, to = 1) {
        this._seconds = val / to;
    }
    get metres(): number { return this._metres; };
    get kgs(): number { return this._kilograms; };
    get seconds(): number { return this._seconds; };

    /**
     * Returns value of the distance in new units
     * @param val The distance in metres you want in the new units
     */
    getScaledDistance(val: number): number {
        return val / this._metres;
    }

    /**
     * Returns value of the mass in new units
     * @param val The mass in kgs you want in the new units
     */
    getScaledMass(val: number): number {
        return val / this._kilograms;
    }

    /**
     * Returns value of the time in new units
     * @param val The time in seconds you want in the new units
     */
    getScaledTime(val: number): number {
        return val / this._seconds;
    }

    /**
     * Returns value of the velocity in new units
     * @param val The velocity in metres/second you want in the new units
     */
    getScaledVelocity(val: number): number {
        return val * this.seconds / this.metres;
    }
}