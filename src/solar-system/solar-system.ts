import { Group, Vector3 } from "three";
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
    PLANETS = [
        //name  radii color    x_pos y_vel mass
        // ['sun', 2.5, '#ffff00', 0, 26,  1,    0, 40],
        // ['mercury', 0.5, '#ffff00', -10, -10, 0, 1, 40],
        // ['venus', 0.5, '#ffff00', -10, 10,  1, 0, 40],
        // ['earth', 0.5, '#ffff00', 10, 10, 0, -1, 40],
        // ['mars', 0.5, '#ffff00', 10, -10, -1, 0, 40],
        ['mercury', 0.5, '#ffff00', -10, 0, 0, 1, 40],
        ['venus', 0.5, '#ffff00', -10, 10, 0.866, -0.5, 40],
        ['earth', 0.5, '#ffff00', -2.33, 5, -0.866, -0.5, 40],
    ];
    group: Group;
    planets: Array<Planet>;
    orbits: Array<PlanetOrbit>;
    sun: Planet;
    particleSystem: ParticleSystem;
    constructor(simParams?: SolarSystemParams) {
        this.group = new Group();
        this.planets = [];
        this.orbits = [];
        this.particleSystem = new ParticleSystem();
        this.particleSystem.addForce(new GravityForce());
        this.createPlanets(simParams);
    }
    static defaultSimParams() {
        let params = new SolarSystemParams();
        params.planets.push(new PlanetParams('mercury', new Vector3(0, 0, 0), new Vector3(0, 1, 0), '#ffff00', 10));
        params.planets.push(new PlanetParams('venus', new Vector3(10, 0, 0), new Vector3(0, -1, 0), '#ffff00', 10));
        return params;
    }

    addPlanet(params: PlanetParams) {
        const planet = new Planet(params.name, 0.5, params.color, params.mass)
        this.planets.push(planet);
        planet.mesh.userData.index = this.planets.length - 1;
        this.group.add(planet.mesh);
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
    update(t: number) {
        const time_step = 0.01;
        this.particleSystem.updateMidPoint(time_step);
    }

    destroy() {
        this.planets.forEach(p => {
            p.destroy();
        });
        this.planets = [];
        this.particleSystem.destroy();

    }
}