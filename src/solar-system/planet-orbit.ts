import { EllipseInterpolation } from "../interpolation/ellipse-interpolation";
import { Planet } from "./planet";
import { Vector3 } from "three";

export class PlanetOrbit {

    // Creates an orbit around sun with radius r
    // WIll create an elliptical interpolation and update the position of the
    // planet
    orbit: EllipseInterpolation;
    planet: Planet;
    constructor(sun: Vector3, planet: Planet, a: number,b: number, t: number) {
        this.orbit = new EllipseInterpolation(a, b, t, sun);
        this.planet = planet;
    }
    update(t: number) {
        this.planet.position(this.orbit.at(t));
    }
};