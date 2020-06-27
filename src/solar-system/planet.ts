import { SphereBufferGeometry, MeshBasicMaterial, Mesh, Vector3 } from "three";

export class Planet {

    name: string;
    geometry: SphereBufferGeometry;
    material: MeshBasicMaterial;
    mesh: Mesh;
    constructor(name: string, radius: number, color: string) {
        this.name = name;
        this.geometry = new SphereBufferGeometry(radius);
        //color to be replaced with texture
        this.material = new MeshBasicMaterial( {color} );  
        this.mesh = new Mesh(this.geometry, this.material);          
    }
    position(v?: Vector3) {
        if (v !== undefined)
            this.mesh.position.copy(v);
        return this.mesh.position;
    }
};