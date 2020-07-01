import { Group } from "three";
import { Planet } from "./planet";
import { PlanetOrbit } from "./planet-orbit";
import { ParticleSystem, GravityForce } from "../particle-system/particle-system";

export class SolarSystem {
    ORBITS = [[10, 1],[20, 2]];
    MASSES = [1000, 1, 1];
    group: Group;
    planets: Array<Planet>;
    orbits: Array<PlanetOrbit>;
    sun: Planet;
    particleSystem: ParticleSystem;
    constructor() {
        this.group = new Group();
        this.planets = [];
        this.orbits = [];
        this.sun = new Planet('sun', 5, '#ffff00');
        this.sun.setMass(this.MASSES[0]);
        this.group.add(this.sun.mesh);
        this.particleSystem = new ParticleSystem();
        this.particleSystem.addForce(new GravityForce());
        this.createPlanets();
    }

    createPlanets() {
        this.planets.push(new Planet('mercury', 2, '#ffff00'));
        this.planets.push(new Planet('venus', 2, '#ffff00'));
        this.planets.forEach((planet,i) => {
            this.group.add(planet.mesh);
            this.particleSystem.addParticle(planet);
            planet.setPosition(this.ORBITS[i][0], 0, 0);
            planet.setVelocity(0, 5, 0);
            planet.setMass(this.MASSES[i+1]);
        }, this);
        this.particleSystem.addParticle(this.sun);
        // for (var i = 0; i < this.ORBITS.length; i++) {
        //     this.orbits.push(new PlanetOrbit(this.sun.position(), this.planets[i], this.ORBITS[i][0], this.ORBITS[i][0], this.ORBITS[i][1]));
        // }
    }
    update(t: number) {
        // this.orbits.forEach(orbit => {
        //     orbit.update(t);
        // });
        const time_step = 0.01;
        this.particleSystem.updateMidPoint(time_step);
    }
}