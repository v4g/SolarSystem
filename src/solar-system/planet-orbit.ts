import { EllipseInterpolation } from "../interpolation/ellipse-interpolation";
import { Planet } from "./planet";
import { Vector3, Vector, EllipseCurve, BufferGeometry, LineBasicMaterial, Line, Mesh } from "three";
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
    curve: Mesh;
    constructor(sun: Vector3, planet: Planet, a: number, b: number, t: number, x?: Vector3, y?: Vector3, z?: Vector3) {
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
        this.movementPerDay = (Math.PI * 2) / t;
    }
    getCurve(): Line {
        return this.orbit.ellipse;
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
    focus: Vector3;
    constructor(eccentricity: number, semiMajorAxis: number, period: number, inclination: number, rotation = 0) {
        this.eccentricity = eccentricity;
        this.semiMajorAxis = semiMajorAxis;
        this.period = period;
        this.inclination = inclination / 180 * Math.PI;
        this.semiMinorAxis = this.semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
        rotation = Math.PI * rotation / 180;
        this.x = new Vector3(1, 0, 0); 
        this.y = new Vector3(0,1,0).applyAxisAngle(this.x, this.inclination);
        this.z = new Vector3(0, 0, 1).applyAxisAngle(this.x, this.inclination);
        this.y = this.y.applyAxisAngle(new Vector3(0, 0, 1), rotation);
        this.x = this.x.applyAxisAngle(new Vector3(0, 0, 1), rotation);
        const c = Math.sqrt(this.semiMajorAxis * this.semiMajorAxis - this.semiMinorAxis * this.semiMinorAxis);
        this.focus = new Vector3(c, 0, 0);
    }
    convert(units: ScaledUnits) {
        this.semiMajorAxis = units.getScaledDistance(this.semiMajorAxis);
        this.period = units.getScaledTime(this.period);
        this.semiMinorAxis = units.getScaledDistance(this.semiMinorAxis);
        this.focus.x = units.getScaledDistance(this.focus.x);
    }
}