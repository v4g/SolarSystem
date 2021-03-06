import { Boilerplate } from "../boilerplate/boilerplate";
import { Vector3, Plane, Texture, TextureLoader, RepeatWrapping, MeshBasicMaterial, Mesh, BoxGeometry, BackSide, NearestFilter, Vector4, Matrix4, AudioListener, Audio, AudioLoader, Vector2 } from "three";
import { SolarSystem, SolarSystemParams } from "./solar-system";
import { PlanetParams } from "./planet"; import { GravityForce } from "../particle-system/particle-system";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { OrbitTrailManager } from "./orbit-trail";
import { EventUpdater } from "./events";
import { OrbitManager, IntegratedOrbitManager, EllipticalOrbitManager } from "./integrated-orbit-manager";
import { PlanetOrbit, OrbitalParameters } from "./planet-orbit";

export class SolarSystemStarter extends Boilerplate {
    readonly THRESHOLD = 24 * 3600;
    solarSystem: SolarSystem;
    orbitManager: OrbitManager;
    params: SolarSystemParams;
    gravity: GravityForce;
    selectedPlanetIndex = -1;
    inputView: ParamsInputView;
    pauseSimulation: boolean;
    mousemoveListener: any;
    startParams: SolarSystemParams;
    ellipticalOrbitManager: EllipticalOrbitManager
    integratedOrbitManager: IntegratedOrbitManager;

    velocityVisible: boolean;
    trailVisible: boolean;
    simulationSpeed: number;
    musicPlay: boolean;
    sound: Audio;
    simMode: boolean;

    gConstant: HTMLInputElement
    pauseSimButton: HTMLInputElement;
    checkbox: HTMLInputElement;
    trailCheckbox: HTMLInputElement;
    simSpeedHTML: HTMLInputElement;
    targetDateHTML: HTMLInputElement;
    currentDateHTML: HTMLInputElement;
    newsTickerHTML: HTMLInputElement;
    simButtonHTML: HTMLInputElement;
    launchCometHTML: HTMLInputElement;

    units: ScaledUnits;
    controls: TrackballControls;
    background: Texture;
    orbits: OrbitTrailManager;
    cyclesInOneYear: number;
    elapsedCycles = 0; // time elapsed in scaled units since the sim started
    dateAtStart: number;
    targetTime: number;
    labelsHTML: HTMLElement[];
    speedVarier: SimSpeedVarier;
    events: EventUpdater;
    labelWidth = new Vector2();
    // Post creation hook 
    postInitHook() {
        // this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        // this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        this.mousemoveListener = this.mouseDragPoint.bind(this);
        this.t = 0;
        this.elapsedCycles = 0;
        this.simulationSpeed = 0.001;
        this.cyclesInOneYear = 31.54;
        this.pauseSimButton = document.getElementById("pause-sim") as HTMLInputElement;
        this.pauseSimButton.addEventListener("click", this.pauseResume.bind(this));
        this.dateAtStart = new Date(2020, 6, 7).getTime();
        this.simMode = true;

        document.getElementById("reset-sim").addEventListener("click", this.simulate.bind(this));
        document.getElementById("add-planet").addEventListener("click", this.addNewPlanet.bind(this));
        document.getElementById("remove-planet").addEventListener("click", this.removePlanet.bind(this));
        document.getElementById("lock-value").addEventListener("click", this.lockValues.bind(this));
        document.getElementById("planet-list").addEventListener("change", this.selectPlanet.bind(this));
        document.getElementById("fast-travel").addEventListener("click", this.fastTravel.bind(this));
        // document.getElementById("goto-date").addEventListener("click", this.gotoDate.bind(this));
        // document.getElementById("toggle-music").addEventListener("click", this.toggleMusic.bind(this));

        this.simSpeedHTML = document.getElementById("sim-speed") as HTMLInputElement;
        this.targetDateHTML = document.getElementById("target-date") as HTMLInputElement;
        this.currentDateHTML = document.getElementById("current-date") as HTMLInputElement;
        this.gConstant = document.getElementById("g-constant") as HTMLInputElement;
        this.checkbox = document.getElementById("velocity-visible") as HTMLInputElement;
        this.trailCheckbox = document.getElementById("trail-visible") as HTMLInputElement;
        this.newsTickerHTML = document.getElementById("news-ticker") as HTMLInputElement;
        // this.simButtonHTML = document.getElementById("sim-mode") as HTMLInputElement;
        this.launchCometHTML = document.getElementById("launch-comet") as HTMLInputElement;

        this.simSpeedHTML.addEventListener("change", this.updateSimSpeed.bind(this));
        this.simSpeedHTML.valueAsNumber = this.simulationSpeed;
        this.gConstant.addEventListener("change", this.updateGConstant.bind(this));
        this.checkbox.addEventListener("change", this.setVelocityVisibility.bind(this));
        this.trailCheckbox.addEventListener("change", this.setTrailVisibility.bind(this));
        // this.simButtonHTML.addEventListener("click", this.toggleSimMode.bind(this));
        // this.simButtonHTML.addEventListener("click", this.fastTravel.bind(this));
        this.launchCometHTML.addEventListener("click", this.launchComet.bind(this));
        this.targetDateHTML.addEventListener("change", this.gotoDate.bind(this));

        this.inputView = this.getInputView();

        this.gravity = new GravityForce();
        this.velocityVisible = false;
        this.trailVisible = false;
        this.calculateScaledG();
        this.params = this.defaultSimParams();
        this.startParams = this.params.clone();
        this.solarSystem = new SolarSystem(this.params);
        this.setPlanetOrbits();
        this.integratedOrbitManager = new IntegratedOrbitManager(this.gravity);
        this.ellipticalOrbitManager = new EllipticalOrbitManager();
        this.orbitManager = this.integratedOrbitManager;
        this.integratedOrbitManager.setSolarSystem(this.solarSystem);
        this.ellipticalOrbitManager.setSolarSystem(this.solarSystem);
        this.updateGConstant();
        this.scene.add(this.solarSystem.group);

        this.buildPlanetOptions();
        this.resume();
        this.createSkybox();

        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.orbits = new OrbitTrailManager(this.solarSystem.planets, this.scene);
        this.orbits.visible(this.trailVisible);

        this.createLabels();
        this.speedVarier = new SimSpeedVarier(0.2, 0.001, 3600 * 24 * 365);
        this.setViewMode();
        this.events = new EventUpdater();
        // this.pause();
        // this.music();
        this.controls.target = this.solarSystem.planets[0].getPosition();
    }

    music() {
        // create an AudioListener and add it to the camera
        let listener = new AudioListener();
        this.camera.add(listener);

        // create a global audio source
        this.sound = new Audio(listener);

        // load a sound and set it as the Audio object's buffer
        var audioLoader = new AudioLoader();
        audioLoader.load('res/music.ogg', function (buffer: any) {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(true);
            this.sound.setVolume(0.2);
            this.sound.play();
        }.bind(this));
    }

    toggleMusic() {
        if (this.sound.isPlaying) {
            this.sound.pause();
        } else {
            this.sound.play();
        }
    }
    setOrbitMode() {
        this.simMode = false;
        // this.simButtonHTML.textContent = "Orbit Mode";
        this.launchCometHTML.disabled = true;
        this.simulate();
    }
    setSimulationMode() {
        this.simMode = true;
        // this.simButtonHTML.textContent = "Simulation Mode";
        this.launchCometHTML.disabled = false;
        this.simulate();

    }
    toggleSimMode() {
        if (this.simMode) {
            this.setOrbitMode();
        } else {
            this.setSimulationMode();
        }
    }
    launchComet() {
        if (this.simMode) {
            const pos = this.solarSystem.planets[7].getPosition().applyAxisAngle(new Vector3(0, 0, 1), Math.random() * Math.PI);
            const vel = pos.clone().normalize().applyAxisAngle(new Vector3(0, 0, 1), Math.PI / 9 + Math.random() * Math.PI / 9).multiplyScalar(-1);
            const param = new PlanetParams("Comet", pos, vel, '0xff0000', this.units.getScaledMass(SolarSystem.MOONS_MASS), 0.5);
            const comet = this.solarSystem.addPlanet(param);
            this.orbitManager.addPlanet(comet);
        }
    }

    updateNews(d: Date) {
        this.newsTickerHTML.textContent = this.events.update(d);
        // console.log(this.solarSystem.planets[0].getPosition());
    }
    setViewMode() {
        document.getElementById("menu1").style.display = "none";
        document.getElementById("menu2").style.display = "none";
        document.getElementById("menu3").style.display = "none";
        document.getElementById("menu4").style.display = "none";
        // this.simSpeedHTML.style.display = "none";
        // this.gConstant.style.display = "none";
        // this.checkbox.style.display = "none";
        // this.trailCheckbox.style.display = "none";
        // this.inputView.hide();
        // document.getElementById("planet-list").style.display = "none";            
    }

    createSkybox() {
        let skyBoxGeometry = new BoxGeometry(10000, 10000, 10000);
        let skyBoxMaterials = new Array<MeshBasicMaterial>();
        let loader = new TextureLoader();
        loader.setPath('res/');
        const texts = ['starsr.jpg', 'starsl.jpg', 'starst.jpg', 'starst.jpg', 'starsc.jpg', 'starsb.jpg'];
        texts.forEach(n => {
            let skyBoxMaterial = new MeshBasicMaterial({ color: 0x9999ff, side: BackSide });
            skyBoxMaterials.push(skyBoxMaterial);
            this.background = loader.load(n);
            this.background.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            this.background.wrapS = RepeatWrapping;
            this.background.wrapT = RepeatWrapping;
            this.background.magFilter = NearestFilter;
            skyBoxMaterial.map = this.background;
            skyBoxMaterial.map.minFilter = NearestFilter;
            skyBoxMaterial.needsUpdate = true;

        }, this);
        let skyBox = new Mesh(skyBoxGeometry, skyBoxMaterials);
        skyBox.rotateOnAxis(new Vector3(1, 0, 0), Math.PI / 2);
        this.scene.add(skyBox);
    }

    setPlanetOrbits() {
        const planets = this.solarSystem.planets;
        const orbits = new Array<PlanetOrbit>();
        const orbitParams = [];
        orbitParams.push(new OrbitalParameters(0.2056, 57.91e9, 87.968 * 3600 * 24, 1.850, 45)); // Mercury
        orbitParams.push(new OrbitalParameters(0.0067, 108.21e9, 224.695 * 3600 * 24, 3.39)); // Venus
        orbitParams.push(new OrbitalParameters(0.01672, 149.60e9, 365.242 * 3600 * 24, 0)); // Earth
        orbitParams.push(new OrbitalParameters(0.0935, 227.92e9, 686.973 * 3600 * 24, 1.850, 45)); // Mars
        orbitParams.push(new OrbitalParameters(0.0489, 778.57e9, 4332.589 * 3600 * 24, 1.304)); // Jupiter
        orbitParams.push(new OrbitalParameters(0.0565, 1433.53e9, 10746.94 * 3600 * 24, 2.485, 45)); // Saturn
        orbitParams.push(new OrbitalParameters(0.0457, 2872.46e9, 30588.740 * 3600 * 24, 0.772, 90)); // Uranus
        orbitParams.push(new OrbitalParameters(0.0113, 4495.06e9, 59799.9 * 3600 * 24, 1.769)); // Neptune
        // orbitParams.push(new OrbitalParameters(0.2488, 5906.38e9, 90560 * 3600 * 24, -17.16, 45)); // Pluto

        orbitParams.forEach((p, i) => {
            p.convert(this.units);
            orbits.push(new PlanetOrbit(p.focus, planets[i + 1], p.semiMajorAxis, p.semiMinorAxis, p.period, p.x, p.y, p.z));
            planets[i + 1].setOrbit(orbits[i]);
            this.scene.add(orbits[i].getCurve());
        });
    }
    defaultSimParams(): SolarSystemParams {
        let params = new SolarSystemParams();
        const values = new Array<Array<any>>(); // Values on 7th July
        values.push(new Array<any>('Sun', 0, 0, 0, 0, 0, 0, '#d6d01e', SolarSystem.SUNS_MASS, 0.7)); //sun
        values.push(new Array<any>('Mercury', 2.969770142937778E+10, -5.834674421582220E+10, -7.492028038583037E+09,
            3.366903971984620E+04, 2.452271301668723E+04, -1.084683781571878E+03, '#fcd703', 3.302e23, 0.3)); //mars
        values.push(new Array<any>('Venus', 6.392025365556467E+10, -8.807847170353863E+10, -4.897273894079294E+09,
            2.811050684887783E+04, 2.044576948803772E+04, -1.341593734249432E+03, '#fcba03', 48.685e23, 0.4)); //mars
        values.push(new Array<any>('Earth', 3.954577361582965E+10, -1.468626167963164E+11, 6.990276396304369E+06,
            2.826885958675343E+04, 7.627209736985429E+03, 4.962096518887904E-01, '#57a5c9', SolarSystem.EARTHS_MASS, 0.4)); //earth
        values.push(new Array<any>('Mars', 1.559338989683880E+11, -1.366673941517965E+11, -6.689125437910400E+09,
            1.689119984009652E+04, 2.029578319586353E+04, 1.091272190740256E+01, '#f54f40', 6.4171e23, 0.3)); //mars
        values.push(new Array<any>('Jupiter', 2.820250486756812E+11, -7.183389321689687E+11, -3.326334195901930E+09,
            1.201775975241539E+04, 5.396479630321678E+03, -2.913036386668424E+02, '#b8b18a', 1898.13e24, 0.6)); //mars
        values.push(new Array<any>('Saturn', 7.016376298753586E+11, -1.323367975983804E+12, -4.918155507721782E+09,
            8.013002174446694E+03, 4.504475475243400E+03, -3.972410034484997E+02, '#aeb55e', 5.6834e26, 0.6)); //mars
        values.push(new Array<any>('Uranus', 2.361547009430319E+12, 1.786580025186876E+12, -2.395450073663449E+10,
            -4.147403865575232E+03, 5.118871847171336E+03, 7.279300901810748E+01, '#5e84b5', 86.813e24, 0.6)); //mars
        values.push(new Array<any>('Neptune', 4.392215141217960E+12, -8.654609667080582E+11, -8.341322119960582E+10,
            1.027226060586543E+03, 5.371496217312306E+03, -1.347116154450971E+02, '#9cb7db', 102.413e24, 0.6)); //mars
        // values.push(new Array<any>('Pluto', 2.024845322005403E+12, -4.67724453930847E+12, -8.510007415275407E+10,
        // 5.139960569970635E+03, 1.005455099131228E+03, -1.606943799584174E+03, '#9cb7db', 0.01303e24, 0.6)); //mars
        // DEC 4 1991
        // values.push(new Array<any>('Mercury', 3.215586514076374E+10, 3.502320983159295E+10, -1.002055050515439E+08,
        //     3.366903971984620E+04, 2.452271301668723E+04, -1.084683781571878E+03, '#fcd703', 3.302e23, 0.3)); //mars
        // values.push(new Array<any>('Venus', -7.542591837835687E+10, 7.638275429026571E+10, 5.398960282087028E+09,
        //     2.811050684887783E+04, 2.044576948803772E+04, -1.341593734249432E+03, '#fcba03', 48.685e23, 0.4)); //mars
        // values.push(new Array<any>('Earth', 4.727574231452822E+10, 1.401219502560267E+11, -8.781901660040021E+06,
        //     2.826885958675343E+04, 7.627209736985429E+03, 4.962096518887904E-01, '#57a5c9', SolarSystem.EARTHS_MASS, 0.4)); //earth
        // values.push(new Array<any>('Mars', -1.189250804796563E+11, -1.948415064818083E+11, -1.167391950507954E+09,
        //     1.689119984009652E+04, 2.029578319586353E+04, 1.091272190740256E+01, '#f54f40', 6.4171e23, 0.3)); //mars
        // values.push(new Array<any>('Jupiter', -7.173393581711400E+11, 3.650711247876566E+11, 1.455140822182910E+10,
        //     1.201775975241539E+04, 5.396479630321678E+03, -2.913036386668424E+02, '#b8b18a', 1898.13e24, 0.6)); //mars
        // values.push(new Array<any>('Saturn', 7.016376298753586E+11, -1.323367975983804E+12, -4.918155507721782E+09,
        //     8.013002174446694E+03, 4.504475475243400E+03, -3.972410034484997E+02, '#aeb55e', 5.6834e26, 0.6)); //mars
        // values.push(new Array<any>('Uranus', 2.361547009430319E+12, 1.786580025186876E+12, -2.395450073663449E+10,
        //     -4.147403865575232E+03, 5.118871847171336E+03, 7.279300901810748E+01, '#5e84b5', 86.813e24, 0.6)); //mars
        // values.push(new Array<any>('Neptune', 4.392215141217960E+12, -8.654609667080582E+11, -8.341322119960582E+10,
        //     1.027226060586543E+03, 5.371496217312306E+03, -1.347116154450971E+02, '#9cb7db', 102.413e24, 0.6)); //mars
        values.forEach(v => {
            const p = new PlanetParams(v[0], new Vector3(v[1], v[2], v[3]), new Vector3(v[4], v[5], v[6]), v[7], v[8], v[9]);
            p.convertUnits(this.units);
            params.planets.push(p);
        })
        return params;
    }

    calculateScaledG() {
        const units = new ScaledUnits();
        units.setKgsScale(SolarSystem.EARTHS_MASS);
        units.setMetresScale(SolarSystem.EARTH_TO_SUN, 10);
        units.setTimeScale(SolarSystem.YEAR_IN_SECONDS, this.cyclesInOneYear);
        const g = GravityForce.calculate(units.kgs, units.metres, units.seconds);
        this.gConstant.valueAsNumber = g;
        this.units = units;
    }

    // Use this function to place all animation code
    animateHook() {
        if (this.solarSystem != null && !this.pauseSimulation) {
            this.orbitManager.update(this.simulationSpeed);
            this.updateParamsWithLiveValues();
            if (this.selectedPlanetIndex >= 0) {
                this.inputView.set(this.params.planets[this.selectedPlanetIndex]);
            }
            if (this.trailVisible == true) this.orbits.update(this.simulationSpeed);
            this.elapsedCycles += this.simulationSpeed;
            let currentTime = this.calculatePresentDate();
            if (Math.abs(this.targetTime) > 0) {
                this.simulationSpeed = this.speedVarier.calculateSpeed(this.targetTime, currentTime, this.simulationSpeed);
            }

            this.updateLabels();
            this.updateNews(new Date(currentTime * 1000));
        }
        this.controls.update();
    }

    toScreenXY(pos: Vector3) {
        let projScreenMat = new Matrix4();
        projScreenMat.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
        pos.applyMatrix4(projScreenMat);
        let viewport = new Vector4();
        this.renderer.getViewport(viewport);
        return {
            x: ((pos.x + 1) * viewport.z / 2 + viewport.x),
            y: ((- pos.y + 1) * viewport.w / 2 + viewport.y)
        };

    }
    updateLabels() {
        if (this.labelsHTML) {
            this.labelsHTML.forEach((l, i) => {
                let obj = this.toScreenXY(this.solarSystem.planets[i].getPosition());
                if (obj.y > (window.innerHeight - l.offsetHeight) || obj.x > (window.innerWidth - l.offsetWidth)) {
                    if (l.offsetWidth > 0) this.labelWidth.x = l.offsetWidth;
                    if (l.offsetWidth > 0) this.labelWidth.y = l.offsetHeight;
                    l.style.display = "none";
                } else if (l.style.display == "none" && (obj.y < window.innerHeight - (2 * this.labelWidth.y) && obj.x < window.innerWidth - (2 * this.labelWidth.x))) {
                    l.style.display = "block";
                }
                l.style.top = obj.y + "px";
                l.style.left = obj.x + "px";

            });
        }
    }
    createLabels() {
        this.labelsHTML = [];
        const outerDiv = document.createElement("div");
        outerDiv.className = "label-collection";
        outerDiv.style.height = window.innerHeight + "px";
        this.solarSystem.planets.forEach((p, i) => {
            const ele = document.createElement("div");
            ele.id = "planet-label" + i;
            ele.className = "planet-label";
            ele.textContent = p.name;
            outerDiv.appendChild(ele);
            this.labelsHTML.push(ele);
        }, this);
        document.body.appendChild(outerDiv);
    }

    calculatePresentDate(): number {
        let elapsedInMillis = 1000 * this.units.getUnscaledTime(this.elapsedCycles);
        let currentTime = this.dateAtStart + elapsedInMillis;
        this.currentDateHTML.value = new Date(currentTime).toDateString();
        return currentTime / 1000;
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
        this.setPlanetOrbits();
        this.elapsedCycles = 0;
        this.params = this.startParams.clone();
        this.solarSystem.velocitiesVisible(this.velocityVisible);
        this.buildPlanetOptions();
        this.calculateScaledG();
        if (this.simMode)
            this.orbitManager = new IntegratedOrbitManager(this.gravity);
        else {
            this.orbitManager = new EllipticalOrbitManager();
        }
        this.orbitManager.setSolarSystem(this.solarSystem);

        this.updateGConstant();
        this.orbits.destroy(this.scene);
        this.orbits = new OrbitTrailManager(this.solarSystem.planets, this.scene);
        this.orbits.visible(this.trailVisible);

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

    onMouseUp() {
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
    setVelocityVisibility() {
        this.velocityVisible = this.checkbox.checked;
        if (this.checkbox.checked) {
            this.velocitiesVisible(true);
        } else {
            this.velocitiesVisible(false);
        }
    }
    setTrailVisibility() {
        this.trailVisible = this.trailCheckbox.checked;
        this.orbits.visible(this.trailVisible);
    }

    updateGConstant() {
        this.gravity.G = this.gConstant.valueAsNumber;
    }

    updateSimSpeed() {
        this.simulationSpeed = this.simSpeedHTML.valueAsNumber;
    }

    gotoDate() {
        const d = this.targetDateHTML.valueAsDate;
        console.log("Date event triggered");
        if (d == null) {
            // Display error message no date selected
            console.log("D was null")
            this.targetTime = new Date().getTime() / 1000 + (24 * 3600);
        } else {
            this.targetTime = d.getTime() / 1000 + (24 * 3600);
            // Set simulation speed forward or backward
        }
    }
    fastTravel() {
        this.gotoDate();
        this.setOrbitMode();
        this.elapsedCycles = this.units.getScaledTime(this.targetTime - this.dateAtStart / 1000);
        this.orbitManager.setTo(this.elapsedCycles);
        console.log(this.elapsedCycles);
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

    hide() {
        this.x_pos.style.display = "none";
        this.y_pos.style.display = "none";
        this.z_pos.style.display = "none";
        this.x_vel.style.display = "none";
        this.y_vel.style.display = "none";
        this.z_vel.style.display = "none";
        this.mass.style.display = "none";
        this.name.style.display = "none";
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
     * Returns value of the time in seconds
     * @param val The time in new units you want in seconds
     */
    getUnscaledTime(val: number): number {
        return val * this._seconds;
    }

    /**
     * Returns value of the velocity in new units
     * @param val The velocity in metres/second you want in the new units
     */
    getScaledVelocity(val: number): number {
        return val * this.seconds / this.metres;
    }
}

export class SimSpeedVarier {
    LIMIT: number;
    STEP_SIZE: number
    SLOW_DOWN_PERIOD: number;
    MIN_SPEED = 0.01;
    constructor(limit: number, step_size: number, slow_down_period: number) {
        this.LIMIT = limit;
        this.STEP_SIZE = step_size;
        this.SLOW_DOWN_PERIOD = slow_down_period;
    }
    /**
     * @param to The time in seconds to go to 
     * @param time The time in seconds right now
     * @param speed The simulation speed right now
     */
    calculateSpeed(to: number, current: number, speed: number): number {
        let direction = 0;
        if (Math.abs(to - current) > 0)
            direction = (to - current) / Math.abs(to - current);
        let accelerate = 1;
        if (Math.abs(to - current) < this.SLOW_DOWN_PERIOD) {
            accelerate = -1;
        }
        let final_speed = Math.max(Math.min(Math.abs(speed) + (accelerate * this.STEP_SIZE), this.LIMIT), this.MIN_SPEED);
        final_speed = final_speed * direction;
        return final_speed;
    }
}
