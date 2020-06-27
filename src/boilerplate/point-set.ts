import { Material, MeshBasicMaterial, CircleBufferGeometry, Group, Mesh, Vector3 } from "three";

export class PointSet {
  group = new Group();
  geometry: CircleBufferGeometry; 
  material: Material;
  idCount = 0;
  constructor(r=1, color=0xffff00) {
    this.material = new MeshBasicMaterial( {color} );
    this.geometry = new CircleBufferGeometry(r);
    } 
  
  createPoint(x: number, y: number, z=0) {
    let mesh = new Mesh(this.geometry, this.material);
    mesh.position.copy(new Vector3(x,y,z));
    mesh.userData.id = this.idCount;
    this.idCount += 1;
    this.group.add(mesh);
  }
  getPoint(index: number) {
    return this.group.children[index].position;
  }
  deleteAll(){
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
  }
}