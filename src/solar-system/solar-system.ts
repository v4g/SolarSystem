import { Group } from "three";
import { Planet } from "./planet";
import { PlanetOrbit } from "./planet-orbit";

export class SolarSystem {
    ORBITS = [[10, 1],[20, 2]];
    group: Group;
    planets: Array<Planet>;
    orbits: Array<PlanetOrbit>;
    sun: Planet;
    constructor() {
        this.group = new Group();
        this.planets = [];
        this.orbits = [];
        this.sun = new Planet('sun', 5, '#ffff00');
        this.group.add(this.sun.mesh);
        this.createPlanets();
    }

    createPlanets() {
        this.planets.push(new Planet('mercury', 2, '#ffff00'));
        this.planets.push(new Planet('venus', 2, '#ffff00'));
        this.planets.forEach(planet => {
            this.group.add(planet.mesh);
        });
        for (var i = 0; i < this.ORBITS.length; i++) {
            this.orbits.push(new PlanetOrbit(this.sun.position(), this.planets[i], this.ORBITS[i][0], this.ORBITS[i][0], this.ORBITS[i][1]));
        }
    }
    update(t: number) {
        this.orbits.forEach(orbit => {
            orbit.update(t);
        });
    }
}