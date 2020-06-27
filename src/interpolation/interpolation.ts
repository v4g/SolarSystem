import { Vector3 } from "three";

export class Interpolation {
    
    // 3 point interpolation. Goes from A to B. Accelerates until point P and then retards
    // It is important to note that point P only serves to provide a ratio. Ultimately, this
    // will interpolate from point A to B in a straight line and not necessarily through point P
    // Point P will be hit at the half-time t = 0.5
    A: Vector3;
    B: Vector3;
    P: Vector3;
    AB: Vector3;
    a: Vector3;
    na: Vector3;
    constructor(A: Vector3, B: Vector3, P: Vector3) {
        this.A = A;
        this.B = B;
        this.P = P;
        let t_a = new Vector3().subVectors(A, P).length() * 2; 
        let t_b = new Vector3().subVectors(B, P).length() * 2; 
        this.AB = new Vector3().subVectors(B,A);

        this.a = this.AB.clone().multiplyScalar(t_a / (t_a + t_b));
        this.na = this.AB.clone().multiplyScalar(t_b / (t_a + t_b));
        
    }

    //Returns the point at time t
    at(t: number) {
        // S = U + AT^2
        let S;
        t = t * 2
        if (t > 1)
        {
            S = this.na.clone().multiplyScalar((2-t) * (2-t));
            S.multiplyScalar(-1);
            S.add(this.B)
        }
        else {
            S = this.a.clone().multiplyScalar(t * t);
            S.add(this.A);
        }
        // acceleration should flip at t = 0.5
        // new distance shold be calculated from B to A with t inverted
        return S;
    }

}