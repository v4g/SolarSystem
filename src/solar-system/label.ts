import { FontLoader, TextGeometry, Mesh, MeshStandardMaterial, Scene, Group } from "three";

export class Label {
    loader: FontLoader;
    mesh: Mesh;
    constructor(planets: Array<string>) {
        this.loader = new FontLoader();
        let material = new MeshStandardMaterial({color:0xffff00});
        this.loader.load('fonts/helvetiker_regular.typeface.json', function (font:any) {
            planets.forEach(n => {
                var geometry = new TextGeometry(n, {
                    font: font,
                    size: 80,
                    height: 5,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 10,
                    bevelSize: 8,
                    bevelOffset: 0,
                    bevelSegments: 5
                });
                this.meshes.add(new Mesh(geometry, material));
            }, this);
        }.bind(this));
    }
}