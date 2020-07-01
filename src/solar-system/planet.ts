import { SphereBufferGeometry, MeshBasicMaterial, Mesh, Vector3 } from "three";
import { IParticle, ParticleDerivative, Particle } from "../particle-system/particle-system";
export class Planet implements IParticle{

    name: string;
    geometry: SphereBufferGeometry;
    material: MeshBasicMaterial;
    mesh: Mesh;
    particle: Particle;
    constructor(name: string, radius: number, color: string, mass?: number) {
        this.name = name;
        this.geometry = new SphereBufferGeometry(radius);
        //color to be replaced with texture
        this.material = new MeshBasicMaterial( {color} );  
        this.mesh = new Mesh(this.geometry, this.material);
        this.particle = new Particle(mass);          
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
        return this.position(new Vector3(x,y,z));
    };
    setVelocity(x: number, y: number, z: number): Vector3 {
        return this.particle.setVelocity(x, y, z);
    }

};