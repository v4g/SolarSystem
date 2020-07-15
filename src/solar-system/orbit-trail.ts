import { IParticle, Particle } from "../particle-system/particle-system";
import { Vector3, BufferGeometry, LineBasicMaterial, Line, Mesh, ConeBufferGeometry, MeshBasicMaterial, Material, Quaternion, MeshStandardMaterial, Color, Scene } from "three";

/**
 * This class will hold the trail of an orbit
 * This will be a path that would then be rendered 
 */
export class OrbitTrail {
    readonly SIZE = 50;
    particle: IParticle;
    counter = 0;
    trackedPoints: Array<Vector3>;
    geometry: BufferGeometry;
    material: MeshStandardMaterial;
    mesh: Mesh;
    constructor(particle: IParticle) {
        this.particle = particle;
        this.trackedPoints = new Array<Vector3>();
        this.geometry = new BufferGeometry().setFromPoints(this.trackedPoints);

        // this.material = new LineBasicMaterial({ color: 0xff0000 });

        // this.mesh = new Line(this.geometry, this.material);
        this.createVelocityTrail();
    }

    createVelocityTrail() {
        this.geometry = new ConeBufferGeometry(1, 1);

        this.material = new MeshStandardMaterial();
        this.material.emissive = new Color(0xff0000);
        this.mesh = new Mesh(this.geometry, this.material);

    }
    
    extractPosition() {
        if (this.trackedPoints.length >= this.SIZE)
            this.trackedPoints[this.counter] = this.particle.getPosition();
        else
            this.trackedPoints.push(this.particle.getPosition());
        this.counter += 1;
        this.counter %= this.SIZE;
    }
    update(simSpeed: number) {
        this.updateVelocityTrail(simSpeed);
        // this.geometry.setFromPoints(this.trackedPoints);
    }

    updateVelocityTrail(simSpeed:number) {
        const TRAIL_C = 10 ;
        const TRAIL_LENGTH = this.particle.getVelocity().length() * TRAIL_C;
        const newPos = this.particle.getPosition().sub(this.particle.getVelocity().multiplyScalar(TRAIL_C/2));
        this.mesh.scale.set(this.particle.getRadius() / 2 , TRAIL_LENGTH , this.particle.getRadius() / 2);
        this.mesh.position.copy(newPos);
        this.mesh.setRotationFromQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), this.particle.getVelocity().multiplyScalar(-1).normalize()));
    }
    destroy() {
        this.material.dispose();
        this.geometry.dispose();
    }

}
/**
 * Velocity vectors should also be done like this
 */
export class OrbitTrailManager {
    orbits: Array<OrbitTrail>;
    constructor(planets: IParticle[], scene: Scene){
        this.orbits = new Array<OrbitTrail>();
        planets.forEach(p => {
            let trail = new OrbitTrail(p);
            this.orbits.push(trail);
            scene.add(trail.mesh);
        });

    }
    update(simSpeed = 0.01) {
        this.orbits.forEach(o=> {
            o.update(simSpeed);
        });
    }
    destroy(scene: Scene) {
        this.orbits.forEach(o=> {
            scene.remove(o.mesh);
            o.destroy();
        });
    }
    visible(v: boolean) {
        this.orbits.forEach(o=> {
            o.mesh.visible = v;
        });
    }
}