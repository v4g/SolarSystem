import { Vector3 } from "three";

export interface IParticle {
    getMass(): number;
    setMass(mass: number): any;
    getVelocity(): Vector3;
    getPosition(): Vector3;
    setPosition(x: number, y: number, z: number): Vector3;
    setVelocity(x: number, y: number, z: number): Vector3;
}
export class Particle implements IParticle {
    private velocity: Vector3;
    private position: Vector3;
    private mass: number;
    constructor(mass?: number) {
        this.velocity = new Vector3();
        this.position = new Vector3();
        if (mass) this.mass = mass;
        else this.mass = 1;
    }
    getMass(): number {
        return this.mass;
    };
    setMass(m: number) {
        this.mass = m;
    }
    getVelocity(): Vector3 { return this.velocity.clone(); }
    getPosition(): Vector3 { return this.position.clone(); }
    setPosition(x: number, y: number, z: number): Vector3 {
        return this.position.set(x, y, z);
    }
    setVelocity(x: number, y: number, z: number): Vector3 {
        return this.velocity.set(x, y, z);
    };

}
export interface IForce {
    apply(p1: IParticle, p2: IParticle): Vector3[];
}

export class GravityForce implements IForce {
    G: number;
    constructor(G?: number) {
        if (G) this.G = G;
        else this.G = 1;
    }
    apply(p1: IParticle, p2: IParticle): Vector3[] {
        const r_vec = p1.getPosition().sub(p2.getPosition());
        let r = r_vec.length();
        r = r * r;
        let f1 = new Vector3();
        let f2 = new Vector3();
        if (r > 0) {
            const unit_r = r_vec.normalize();
            f1 = unit_r.clone().multiplyScalar(-this.G * p2.getMass() / r);
            f2 = unit_r.clone().multiplyScalar(this.G * p1.getMass() / r);
        }
        return [f1, f2];
    }
}
/**
 * Holds the derivative of a quantity
 * We should be able to specify the TYPE of a derivative explicitly instead of assuming
 * it will always be 6 numbers. 
 * TODO: make this generic
 */
export class ParticleDerivative {
    derivative: Array<Array<number>>;
    constructor() {
        this.derivative = new Array<Array<number>>();
    }
    addParticle() {
        this.derivative.push(new Array<number>(0, 0, 0, 0, 0, 0));
    }
    add(i: number, items: Array<number>) {
        // Could this be faster?
        for (let j = 0; j < items.length; j++)
            this.derivative[i][j] += items[j];
    }
    clear() {
        for (let i = 0; i < this.derivative.length; i++)
            for (let j = 0; j < this.derivative[i].length; j++) {
                this.derivative[i][j] = 0;
            }
    }
    scale(n: number) {
        for (let i = 0; i < this.derivative.length; i++)
            for (let j = 0; j < this.derivative[i].length; j++) {
                this.derivative[i][j] *= n;
            }
    }
    get(i: number): Array<number> {
        return this.derivative[i];
    }
    print() {
        this.derivative.forEach((p, i)=>{
            console.log("Particle "+i);
            console.log("Velocity ",p[0], p[1], p[2]);
            console.log("Acceleration ",p[3], p[4], p[5]);
            
        }, this);
    }
}
/**
 * The ParticleSystem class takes an array of particles and updates
 * them given some rules
 * These rules will be defined by the forces that act on these particles
 * which will be held in the forces array
 */
export class ParticleSystem {
    particles: Array<IParticle>;
    forces: Array<IForce>;
    derivative: ParticleDerivative;
    constructor() {
        this.particles = new Array<IParticle>();
        this.derivative = new ParticleDerivative();
        this.forces = new Array<IForce>();
    }
    addParticle(particle: IParticle) {
        this.particles.push(particle);
        this.derivative.addParticle();
    }
    addForce(force: IForce) {
        this.forces.push(force);
    }
    /**
     * Will calculate the derivative of the particles motion and updates them
     * according to the integration method (Midpoint, RK, Euler etc)
     * @param time_step The step by which to advance the system
     */
    update(time_step: number) {
        this.calculateDerivative();
        this.derivative.scale(time_step);
        this.updateAllParticles();
    }

    storeState(): Array<Array<number>> {
        const state = new Array<Array<number>>();
        this.particles.forEach((particle, i) => {
            const pos = particle.getPosition();
            const v = particle.getVelocity();
            state.push(new Array<number>(pos.x,pos.y,pos.z,v.x,v.y,v.z));
        }, this);
        return state;    
    }
    restoreState(state: Array<Array<number>>) {
        this.particles.forEach((particle, i) => {
            particle.setPosition(state[i][0], state[i][1], state[i][2]);
            particle.setVelocity(state[i][3], state[i][4], state[i][5]);
        }, this);
    }
    updateMidPoint(time_step: number) {
        const state = this.storeState();
        this.calculateDerivative();
        this.derivative.scale(time_step/2);
        // console.log('========Intermediate=======');
        // this.derivative.print();
        this.updateAllParticles();
        // console.log('--------Intermediate particle------');
        // this.print();
        this.calculateDerivative();
        this.derivative.scale(time_step);
        this.restoreState(state);
        this.updateAllParticles();
    }

    calculateDerivative() {
        // clear the derivative first
        this.derivative.clear();

        this.forces.forEach(force => {
            for (let i = 1; i < this.particles.length; i++) {
                for (let j = 0; j < i; j++) {
                    let forces = force.apply(this.particles[i], this.particles[j]);
                    const v1 = this.particles[i].getVelocity();
                    const v2 = this.particles[j].getVelocity();
                    this.derivative.add(i, [v1.x, v1.y, v1.z, forces[0].x, forces[0].y, forces[0].z]);
                    this.derivative.add(j, [v2.x, v2.y, v2.z, forces[1].x, forces[1].y, forces[1].z]);
                }
            }
        }, this);
    }

    updateAllParticles() {
        this.particles.forEach((particle, i) => {
            const d = this.derivative.get(i);
            const pos = particle.getPosition();
            const v = particle.getVelocity();
            particle.setPosition(pos.x + d[0], pos.y + d[1], pos.z + d[2]);
            particle.setVelocity(v.x + d[3], v.y + d[4], v.z + d[5]);
        }, this);
    }

    print() {
        console.log("----Particle System-----");
        
        this.particles.forEach((particle, i) => {
            console.log("--------------------------");
            const pos = particle.getPosition();
            const v = particle.getVelocity();
            console.log("Particle "+i);
            console.log("Mass ", particle.getMass());
            console.log("Position ",pos.x, pos.y, pos.z);
            console.log("Velocity ",v.x, v.y, v.z);
        }, this);
        console.log("------------X-----------");
        
    }

    printDerivative() {
        this.derivative.print();
    }

}