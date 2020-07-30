import { equal } from "assert";
import { Particle, ParticleSystem, GravityForce } from "./particle-system";

describe("Typescript usage suite", () => {

  it("should be able to execute a test", () => {

    equal(true, true);

  });

  it("Test Particle System", () => {
    let p1 = new Particle(1);
    let p2 = new Particle(1);
    p1.setPosition(10, 0, 0);
    p2.setPosition(20,0,0);
    const ps = new ParticleSystem();
    ps.addParticle(p1);
    ps.addParticle(p2);
    ps.addForce(new GravityForce());
    ps.updateMidPoint(0.1);
    ps.print();
    ps.printDerivative();
    ps.updateMidPoint(0.1);
    ps.print();
    ps.printDerivative();
    ps.updateMidPoint(0.1);
    ps.print();
    ps.printDerivative();
    equal(true, true);
  });

  it("Test Gravity", () => {
    let p1 = new Particle(1);
    let p2 = new Particle(1);
    p1.setPosition(10, 0, 0);
    p2.setPosition(20,0,0);
    let gf = new GravityForce(1);
    const forces = gf.apply(p1, p2);
    const true_values = [[0.01, 0, 0],
    [-0.01, 0, 0]];
    true_values.forEach((v,i)=> {
        equal(v[0], forces[i].x);
        equal(v[1], forces[i].y);
        equal(v[2], forces[i].z);
    });
  });

  it("Test Solar System", () => {
    // const solarSystem = new SolarSystem();
    // solarSystem.update(0.1);
    // solarSystem.particleSystem.print();
    // solarSystem.particleSystem.printDerivative();
    // solarSystem.update(0.1);
    // solarSystem.particleSystem.print();
    // solarSystem.particleSystem.printDerivative();
    // solarSystem.update(0.1);
    // solarSystem.particleSystem.print();
    // solarSystem.particleSystem.printDerivative();
    // equal(true, true);
  });

//   let derivative = [
//     [[0, 0, 0, -.25, 0, 0],
//     [0, 0, 0, 0.025, 0, 0],     
//     ],
//     [[-.25, 0, 0, -2.5, 0, 0],
//     [0, 0, 0, 0.25, 0, 0],     
//     ]
// ]
});