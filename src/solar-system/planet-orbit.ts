import { EllipseInterpolation } from "../interpolation/ellipse-interpolation";
import { Planet } from "./planet";
import { Vector3, Vector } from "three";
import { ScaledUnits } from "./solar-system-starter";

export class PlanetOrbit {

    // Creates an orbit around sun with radius a and b
    // Will create an elliptical interpolation and update the position of the
    // planet
    orbit: EllipseInterpolation;
    planet: Planet;
    movementPerDay: number; // number of degrees to move per time period
    theta: number;
    sun: Vector3;
    constructor(sun: Vector3, planet: Planet, a: number,b: number, t: number, x?:Vector3, y?:Vector3, z?:Vector3) {
        this.orbit = new EllipseInterpolation(a, b, t, sun, x, y, z);
        this.planet = planet;
        this.setPeriod(t);
        this.theta = 0;
        this.sun = sun;
    }
    /**
     * 
     * @param t is the time in seconds in the new unit by which to move the planet
     */
    update(t: number) {
        let step = t * this.movementPerDay;
        step += this.theta;
        this.planet.position(this.orbit.at(step));
    }
    setPeriod(t: number) {
        this.movementPerDay = (Math.PI * 2)/t;
    }
};

export class OrbitalParameters {
    eccentricity: number;
    semiMajorAxis: number;
    semiMinorAxis: number;
    period: number;
    inclination: number;
    x: Vector3;
    y: Vector3;
    z: Vector3;
    constructor(eccentricity: number, semiMajorAxis: number, period: number, inclination: number) {
        this.eccentricity = eccentricity;
        this.semiMajorAxis = semiMajorAxis;
        this.period = period;
        this.inclination = inclination / 180 * Math.PI;
        this.semiMinorAxis = this.semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
        this.y = new Vector3(Math.sin(this.inclination), Math.cos(this.inclination), 0);
        this.x = new Vector3(Math.cos(this.inclination), Math.sin(this.inclination), 0);
        this.z = new Vector3(0, 0, 1);
    }
    convert(units: ScaledUnits) {
        this.semiMajorAxis = units.getScaledDistance(this.semiMajorAxis);
        this.period = units.getScaledTime(this.period);
        this.semiMinorAxis = units.getScaledDistance(this.semiMinorAxis);
    }
}