import { ParticleSystem, GravityForce, IParticle } from "../particle-system/particle-system";
import { SolarSystem } from "./solar-system";
import { PlanetOrbit } from "./planet-orbit";

export interface OrbitManager {
    update(time_step: number): any;
    destroy(): any;
    removePlanet(i: number): any;
    addPlanet(planet: IParticle): any;
    setSolarSystem(system: SolarSystem): any;
    setTo(time: number): any;
}
export class IntegratedOrbitManager implements OrbitManager {
    particleSystem: ParticleSystem;
    gravity: GravityForce;
    constructor(gravity = new GravityForce()) {
        this.particleSystem = new ParticleSystem();
        this.gravity = gravity;
        this.particleSystem.addForce(this.gravity);        
    }
    setTo(time: number) {
    }

    update(time_step: number): any {
        const N_ITERATIONS = 100;
        time_step = time_step/N_ITERATIONS;
        for (let i = 0; i < N_ITERATIONS; i++)
        this.particleSystem.updateRK4(time_step);
    }

    setSolarSystem(system: SolarSystem) {
        system.planets.forEach(planet => {
            this.particleSystem.addParticle(planet);     
        });
    }

    removePlanet(i: number) {
        this.particleSystem.removeParticle(i);
    }

    addPlanet(planet: IParticle) {
        this.particleSystem.addParticle(planet);         
    }
    destroy() {
        this.particleSystem.destroy();
    }
}

export class EllipticalOrbitManager implements OrbitManager {
    orbits: PlanetOrbit[];
    totalTime: number;
    constructor() {
        this.orbits = [];
        this.totalTime = 0;
    }
    setTo(time: number) {
        this.totalTime = time;
    }
    update(time_step: number) {
        this.totalTime += time_step;
        this.orbits.forEach(o => {
            o.update(this.totalTime);
        })
    }
    destroy() {

    }
    removePlanet(i: number) {

    }
    addPlanet(planet: IParticle) {
    }
    setSolarSystem(system: SolarSystem){
        system.planets.forEach(p => {
            if (p.getOrbit())
                this.orbits.push(p.getOrbit());
        });  
    }
    
}