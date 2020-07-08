import { Group, Vector3, Geometry, ArrowHelper } from "three";
import { Planet, PlanetParams } from "./planet";
import { PlanetOrbit } from "./planet-orbit";
import { ParticleSystem, GravityForce } from "../particle-system/particle-system";

export class SolarSystemParams {
    time_step: number;
    planets: Array<PlanetParams>
    constructor() {
        this.time_step = 0.01;
        this.planets = new Array<PlanetParams>();
    }
    clone(): SolarSystemParams {
        const params = new SolarSystemParams();
        params.time_step = this.time_step;
        params.planets = new Array<PlanetParams>();
        this.planets.forEach(p => {
            params.planets.push(p.clone());
        });
        return params;
    }
}

export class SolarSystem {
    static ARROW_SCALE = 4;
    group: Group;
    planets: Array<Planet>;
    orbits: Array<PlanetOrbit>;
    sun: Planet;
    particleSystem: ParticleSystem;
    velocityArrows: Group;
    velocityGeometry: ArrowHelper;
    gravity: GravityForce;
    static readonly YEAR_IN_SECONDS = 3.154e7;
    static readonly SUNS_MASS = 1.989e30;
    // Earth
    static readonly EARTH_TO_SUN = 147091144e3;
    static readonly EARTHS_MASS = 5.972e24;
    static readonly EARTHS_VELOCITY = 30300; // at perihelion m/s
    // Mars
    static readonly MARS_TO_SUN = 206.62e9;
    static readonly MARS_MASS = 0.64171e24;
    static readonly MARS_VELOCITY = 26.50e3; // at perihelion m/s
    // Moon
    static readonly MOONS_MASS = 0.07346e24;
    static readonly MOONS_VELOCITY = 31270; // at apogee m/s
    static readonly EARTH_TO_MOON = 405.5e6; // at apogee m
    constructor(simParams?: SolarSystemParams) {
        this.group = new Group();
        this.planets = [];
        this.orbits = [];
        this.particleSystem = new ParticleSystem();
        this.gravity = new GravityForce();
        this.particleSystem.addForce(this.gravity);
        this.velocityGeometry = new ArrowHelper(new Vector3(1, 0, 0), new Vector3(), SolarSystem.ARROW_SCALE, 0xff0000);
        this.velocityGeometry.scale.set(2, 1, 1);
        this.createPlanets(simParams);
        this.velocitiesVisible(false);
    }
    static defaultSimParams() {
        let params = new SolarSystemParams();
        params.planets.push(new PlanetParams('Sun', new Vector3(0, 0, 0), new Vector3(0, 1, 0), '#d6d01e', 10));
        params.planets.push(new PlanetParams('Earth', new Vector3(10, 0, 0), new Vector3(0, -1, 0), '#57a5c9', 10));
        return params;
    }

    addPlanet(params: PlanetParams) {
        const planet = new Planet(params.name, params.radius, params.color, params.mass)
        this.planets.push(planet);
        planet.mesh.userData.index = this.planets.length - 1;
        this.group.add(planet.mesh);
        planet.velocityMesh = new ArrowHelper(new Vector3(1, 0, 0), new Vector3(), SolarSystem.ARROW_SCALE, 0xff0000);
        this.particleSystem.addParticle(planet);
        planet.setPosition(params.position.x, params.position.y, params.position.z);
        planet.setVelocity(params.velocity.x, params.velocity.y, params.velocity.z);
    }
    createPlanets(simParams?: SolarSystemParams) {
        if (!simParams) {
            simParams = SolarSystem.defaultSimParams();
        }
        simParams.planets.forEach((p) => {
            this.addPlanet(p);
        }, this);
    }
    update(time_step: number) {
        this.particleSystem.updateRK4(time_step);
    }

    destroy() {
        this.planets.forEach(p => {
            p.destroy();
        });
        this.planets = [];
        this.particleSystem.destroy();

    }

    velocitiesVisible(b: boolean) {
        this.planets.forEach(p=> {
            p.velocityVisible(b);
        });
    }
}