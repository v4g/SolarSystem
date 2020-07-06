import { SphereBufferGeometry, MeshBasicMaterial, Mesh, Vector3, ArrowHelper } from "three";
import { IParticle, ParticleDerivative, Particle } from "../particle-system/particle-system";

export class PlanetParams {
    name: string;
    position: Vector3;
    velocity: Vector3;
    color: string;
    mass: number;
    constructor(name?: string, position?: Vector3, velocity?: Vector3, color?: string, mass?: number) {
        if (position) this.position = position; else this.position = new Vector3();
        if (velocity) this.velocity = velocity; else this.velocity = new Vector3();
        if (name) this.name = name; else this.name = "Planet";
        if (mass) this.mass = mass; else this.mass = 1;
        if (color) this.color = color; else this.color = "#ffff00";        
    }

    clone(): PlanetParams {
        return new PlanetParams(this.name, this.position.clone(), this.velocity.clone(), this.color, this.mass)
    }
}

export class Planet implements IParticle{

    name: string;
    geometry: SphereBufferGeometry;
    material: MeshBasicMaterial;
    mesh: Mesh;
    particle: Particle;
    color: string;
    private _velocityMesh: ArrowHelper;
    constructor(name: string, radius: number, color: string, mass?: number) {
        this.name = name;
        this.geometry = new SphereBufferGeometry(radius);
        //color to be replaced with texture
        this.material = new MeshBasicMaterial( {color} );  
        this.mesh = new Mesh(this.geometry, this.material);
        this.particle = new Particle(mass); 
        this.color = color;         
    }
    position(v?: Vector3) {
        if (v !== undefined)
            this.mesh.position.copy(v);
        return this.mesh.position.clone();
    }
    setMass(m: number){ this.particle.setMass(m) } ;
    getMass(): number { return this.particle.getMass() } ;
    getVelocity(): Vector3 { return this.particle.getVelocity(); };
    getPosition(): Vector3 { return this.position()};
    setPosition(x: number, y: number, z: number): Vector3 {
        const pos = this.position(new Vector3(x,y,z));
        return pos;
    };
    setVelocity(x: number, y: number, z: number): Vector3 {
        const vel = this.particle.setVelocity(x, y, z);
        this.updateArrowDirection();
        return vel;
    }
    getParams():PlanetParams {
        return new PlanetParams(this.name, this.getPosition(), this.getVelocity(), this.color, this.getMass());
    }
    createFromJson(json: string) {
        const obj = (JSON.parse(json)) as any;
        this.name = obj.name;
        this.setPosition(obj.x_pos, obj.y_pos, obj.z_pos);
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
            this._velocityMesh.setDirection(this.getVelocity().normalize());
            this._velocityMesh.scale.setY(this.getVelocity().length());
        }
    }

    velocityVisible(b: boolean) {
        this._velocityMesh.visible = b;
    }
};