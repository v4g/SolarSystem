import { Matrix4, Vector3, EllipseCurve, BufferGeometry, LineBasicMaterial, Line, Mesh } from "three";

export class EllipseInterpolation {
    
    // defines an ellipse with parameters a,b
    // f - frequency of revolution (n of ms in which to complete revolution)
    // c - center of the ellipse
    // x,y,z - the basis vectors for the frame of the ellipse
    transformMatrix = new Matrix4();
    transformMatrixInv = new Matrix4();
    A : number;
    B : number;
    F : number;
    ellipse : Line;
    constructor(A: number, B: number, F: number, C?:Vector3, x?:Vector3, y?:Vector3, z?:Vector3 ) {
        this.A = A;
        this.B = B;
        this.F = F;
        if (x !== undefined && y !== undefined && z !== undefined) {
            this.transformMatrix.makeBasis(x,y,z);
            this.transformMatrix.transpose();
        }
        if (C){
            C.applyMatrix4(this.transformMatrixInv.getInverse(this.transformMatrix));
            this.transformMatrix.setPosition(C);
        }
        this.transformMatrixInv.getInverse(this.transformMatrix);
        this.show();
    }

    //Returns the point at angle t
    at(t: number) : Vector3 {
        var theta = t;
        // Would still be three coordinate axes
        var position = new Vector3(this.A * Math.cos(theta), this.B * Math.sin(theta));
        position.applyMatrix4(this.transformMatrixInv);
        return position; 

    }
    show() {
        var curve = new EllipseCurve(
            0, 0,            // ax, aY
            this.A, this.B,           // xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );

        var points = curve.getPoints(50);
        var points3 = new Array<Vector3>();
        points.forEach(p => {
            var p3 = new Vector3(p.x, p.y, 0);
            points3.push(p3.applyMatrix4(this.transformMatrixInv));
        })
        var geometry = new BufferGeometry().setFromPoints(points3);

        var material = new LineBasicMaterial({ color: 0x5d7c85 });

        // Create the final object to add to the scene
        this.ellipse = new Line(geometry, material);
        // this.ellipse.applyMatrix4(this.transformMatrix);
    }


};