import { Matrix4, Vector3 } from "three";

export class EllipseInterpolation {
    
    // defines an ellipse with parameters a,b
    // f - frequency of revolution (n of ms in which to complete revolution)
    // c - center of the ellipse
    // x,y,z - the basis vectors for the frame of the ellipse
    transformMatrix = new Matrix4();
    A : number;
    B : number;
    F : number;
    constructor(A: number, B: number, F: number, C?:Vector3, x?:Vector3, y?:Vector3, z?:Vector3 ) {
        this.A = A;
        this.B = B;
        this.F = F;
        if (x !== undefined && y !== undefined && z !== undefined) {
            this.transformMatrix.makeBasis(x,y,z);
            this.transformMatrix.transpose();
        }
        if (C){
            this.transformMatrix.setPosition(C);
        }
        
    }

    //Returns the point at time t
    at(t: number) : Vector3 {
        var theta = (t/this.F) * Math.PI * 2;
        // Would still be three coordinate axes
        var position = new Vector3(this.A * Math.cos(theta), this.B * Math.sin(theta));
        position.applyMatrix4(this.transformMatrix);
        return position; 

    }

};