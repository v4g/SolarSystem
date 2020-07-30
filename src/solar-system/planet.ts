import { SphereBufferGeometry, MeshBasicMaterial, Mesh, Vector3, ArrowHelper, Material, TextGeometry, PointLight, Scene, MeshStandardMaterial, Color, Matrix4 } from "three";
import { IParticle, ParticleDerivative, Particle } from "../particle-system/particle-system";
import { ScaledUnits } from "./solar-system-starter";
import { PlanetOrbit } from "./planet-orbit";

export class PlanetParams {
    name: string;
    position: Vector3;
    velocity: Vector3;
    color: string;
    mass: number;
    radius: number
    constructor(name?: string, position?: Vector3, velocity?: Vector3, color?: string, mass?: number, radius = 0.5) {
        if (position) this.position = position; else this.position = new Vector3();
        if (velocity) this.velocity = velocity; else this.velocity = new Vector3();
        if (name) this.name = name; else this.name = "Planet";
        if (mass) this.mass = mass; else this.mass = 1;
        if (color) this.color = color; else this.color = "#ffff00";
        this.radius = radius;
    }

    clone(): PlanetParams {
        return new PlanetParams(this.name, this.position.clone(), this.velocity.clone(), this.color, this.mass, this.radius);
    }

    convertUnits(unit: ScaledUnits) {
        this.position.x = unit.getScaledDistance(this.position.x);
        this.position.y = unit.getScaledDistance(this.position.y);
        this.position.z = unit.getScaledDistance(this.position.z);
        this.velocity.x = unit.getScaledVelocity(this.velocity.x);
        this.velocity.y = unit.getScaledVelocity(this.velocity.y);
        this.velocity.z = unit.getScaledVelocity(this.velocity.z);
        this.mass = unit.getScaledMass(this.mass);
    }
}

export class Planet implements IParticle {

    name: string;
    geometry: SphereBufferGeometry;
    material: MeshStandardMaterial;
    mesh: Mesh;
    particle: Particle;
    color: string;
    orbit: PlanetOrbit;
    private _velocityMesh: ArrowHelper;
    constructor(name: string, radius: number, color: string, mass?: number) {
        this.name = name;
        this.geometry = new SphereBufferGeometry(radius);
        //color to be replaced with texture
        this.material = new MeshStandardMaterial({ color });
        this.mesh = new Mesh(this.geometry, this.material);
        this.particle = new Particle(mass, radius);
        this.color = color;
    }
    position(v?: Vector3) {
        if (v !== undefined)
            this.mesh.position.copy(v);
        return this.mesh.position.clone();
    }
    setMass(m: number) { this.particle.setMass(m) };
    getMass(): number { return this.particle.getMass() };
    getVelocity(): Vector3 { return this.particle.getVelocity(); };
    getPosition(): Vector3 { return this.position() };
    setPosition(x: number, y: number, z: number): Vector3 {
        const pos = this.position(new Vector3(x, y, z));
        return pos;
    };
    setVelocity(x: number, y: number, z: number): Vector3 {
        const vel = this.particle.setVelocity(x, y, z);
        this.updateArrowDirection();
        return vel;
    }
    getParams(): PlanetParams {
        return new PlanetParams(this.name, this.getPosition(), this.getVelocity(), this.color, this.getMass());
    }
    createFromJson(json: string) {
        const obj = (JSON.parse(json)) as any;
        this.name = obj.name;
        this.setPosition(obj.x_pos, obj.y_pos, obj.z_pos);
    }
    getRadius(): number {
        return this.particle.getRadius();
    }
    destroy() {
        this.geometry.dispose();
    }
    get velocityMesh() {
        return this._velocityMesh;
    }

    set velocityMesh(mesh: ArrowHelper) {
        this._velocityMesh = mesh;
        this.mesh.add(this._velocityMesh);
        this._velocityMesh.position.set(0, 0, 0);
        console.log(this._velocityMesh);
    }

    private updateArrowDirection() {
        if (this._velocityMesh) {
            this._velocityMesh.setDirection(this.getVelocity().normalize().multiplyScalar(-1));
            this._velocityMesh.scale.setY(this.getVelocity().length());
        }
    }

    velocityVisible(b: boolean) {
        this._velocityMesh.visible = b;
    }

    label(font: any, material: Material) {
        var geometry = new TextGeometry(this.name, {
            font: font,
            size: 20,
            height: 5,
            curveSegments: 12,
        });
        const mesh = new Mesh(geometry, material);
        mesh.scale.set(0.01, 0.01, 0.01);
        this.mesh.add(mesh);
    }

    addLightSource(color: string) {
        this.material.emissive = new Color(this.color);
        let light = new PointLight(color);
        this.mesh.add(light);
    }

    setOrbit(orbit: PlanetOrbit) {
        this.orbit = orbit;
        const pos = this.getPosition().sub(orbit.sun);
        const inv = orbit.orbit.transformMatrix;
        pos.applyMatrix4(inv);
        this.orbit.theta = Math.atan2(pos.y, pos.x);
    }

    getOrbit(): PlanetOrbit { return this.orbit; }
};