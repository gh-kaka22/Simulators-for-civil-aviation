import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Plane } from "./planePhy.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/*
 *Debug
 */
const gui = new dat.GUI();
const Worldfolder = gui.addFolder("World");
const AirplaneFolder = gui.addFolder("Airplane");
const CoefficientsFolder = AirplaneFolder.addFolder("Coefficients");
CoefficientsFolder.open();
Worldfolder.open();
AirplaneFolder.open();

const parameters = {
    // planeMass: 100,
    planeMass: 39500,
    fuelMass: 21300,
    // fuelMass: 50,
    Tempreture: 15,
    // massFlowRate: 10,
    massFlowRate: 1000,
    LiftCoefficient: 0.1,
    DragCoefficient: 0.1,
    // WingArea: 120,
    WingArea: 124,
    WindSpeed: 10,
    WindAngle: 0,
};

/*
 *Base
 */

//canvas
const canvas = document.querySelector("canvas.webgl");

//Scene
var scene = new THREE.Scene();

//Textures

//البيئة الخارجية

var textureLoader = new THREE.TextureLoader();
var textures = [
    textureLoader.load("px.png"),
    textureLoader.load("nx.png"),
    textureLoader.load("py.png"),
    textureLoader.load("ny.png"),
    textureLoader.load("pz.png"),
    textureLoader.load("nz.png"),
];

// إنشاء مجموعة من المواد المختلفة لكل وجه
var materials = [];
for (var i = 0; i < 6; i++) {
    materials.push(
        new THREE.MeshBasicMaterial({ map: textures[i], side: THREE.BackSide }),
    );
}

// إنشاء المكعب باستخدام المواد المختلفة لكل وجه
var cubeGeometry = new THREE.BoxGeometry(5000000, 50000, 5000000);
var cube = new THREE.Mesh(cubeGeometry, materials);
scene = new THREE.Scene();
cube.position.y = 50000 / 2 - 10;
scene.add(cube);

// Create the ground plane
const groundSize = 50000;
const groundGeometry = new THREE.PlaneGeometry(groundSize, 1000);
const groundtexture = textureLoader.load("down.jpg");
const groundMaterial = new THREE.MeshPhongMaterial({
    map: groundtexture,
    side: THREE.DoubleSide,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -8;
ground.receiveShadow = true;
// groundtexture.repeat.z = 2;
groundtexture.wrapT = THREE.RepeatWrapping;
scene.add(ground);

//raghad sky box

//Object

const model = new THREE.Object3D();
const gLTFLoader = new GLTFLoader();
gLTFLoader.load(
    "RedAirplane.gltf",
    (gltf) => {
        console.log("success");
        console.log(gltf);

        // استخراج مسرح المشهد من gltf
        const gltfScene = gltf.scene || gltf.scenes[0];

        // إضافة مسرح المشهد إلى النموذج
        model.add(gltfScene);

        // model.scale.set(0.1, 0.1, 0.1); // scale down the object
        // model.rotation.y = Math.PI/2

        scene.add(model);
    },
    (progress) => {
        console.log("progress");
        console.log(progress);
    },
    (error) => {
        console.log(error);
    },
);

const planeW = new THREE.Group();
planeW.add(model);
model.position.set(0, 0, 0);
planeW.position.copy(model.position);

const p = new Plane(
    new THREE.Vector3(planeW.position.x, planeW.position.y, planeW.position.z),
    new THREE.Vector3(planeW.rotation.x, planeW.rotation.y, planeW.rotation.z),
    parameters.planeMass,
    parameters.fuelMass,
    parameters.Tempreture,
    parameters.massFlowRate,
    parameters.WindSpeed,
    parameters.WindAngle,
    parameters.LiftCoefficient,
    parameters.DragCoefficient,
    parameters.WingArea,
);

//Axes Helper
const axesHelper = new THREE.AxesHelper(100000);
axesHelper.position.set(0, 0, 0);
scene.add(axesHelper);

/*
 *Debug
 */

gui.add(model, "visible");

AirplaneFolder.add(p, "planeMass")
    .onChange(() => {
        p.planeMass = parameters.mass;
    })
    .min(50)
    .max(1000000);

AirplaneFolder.add(p, "fuelMass")
    .onChange(() => {
        p.fuelMass = parameters.fuelMass;
    })
    .min(50)
    .max(1000000);

Worldfolder.add(p, "Tempreture")
    .onChange(() => {
        p.Tempreture = parameters.Tempreture;
    })
    .min(-100)
    .max(100)
    .step(1);

AirplaneFolder.add(p, "massFlowRate")
    .onChange(() => {
        p.massFlowRate = parameters.massFlowRate;
    })
    .min(0)
    .max(7000)
    .step(100);

CoefficientsFolder.add(p, "cl")
    .onChange(() => {
        p.cl = parameters.LiftCoefficient;
    })
    .min(0)
    .max(2)
    .step(0.1);

CoefficientsFolder.add(p, "cd")
    .onChange(() => {
        p.cd = parameters.DragCoefficient;
    })
    .min(0)
    .max(2)
    .step(0.1);

AirplaneFolder.add(p, "s")
    .onChange(() => {
        p.s = parameters.WingArea;
    })
    .min(0)
    .max(500)
    .step(10);

Worldfolder.add(p, "WindSpeed")
    .onChange(() => {
        p.WindSpeed = parameters.WindSpeed;
    })
    .min(0)
    .max(2000)
    .step(5);

Worldfolder.add(p, "WindAngle")
    .onChange(() => {
        p.WindAngle = parameters.WindAngle;
    })
    .min(0)
    .max(360)
    .step(1);

//Sizes
const sizes = {
    width: window.innerWidth,
    hight: window.innerHeight,
};

//Camera
const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.hight,
    1,
    30000000,
);
camera.position.set(
    planeW.position.x - 200,
    planeW.position.y + 100,
    planeW.position.z,
);

//RRRR
const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);
// const directionaLLight=new THREE.DirectionalLight();
// scene.add(directionaLLight);

//Render

const renderer = new THREE.WebGLRenderer();
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//rrrrrr
// renderer.render(scene,camera);

window.addEventListener("resize", function () {
    //update size
    sizes.width = window.innerWidth;
    sizes.hight = window.innerHeight;

    //update the camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.hight);
});
//rrrrr
// skybox.wrapS=THREE.RepeatWrapping;
// skybox.wrapT=THREE.RepeatWrapping;
// skybox.repeat.set(50,50);

//هبد
let angle = 0;
let angle2 = 0;

function moveCamera(event) {
    switch (event.keyCode) {
        //32= المسطرة
        case 32:
            if (go) {
                isLunch = true;
                go = false;
            } else if (!go) {
                isLunch = false;
                go = true;
            }
            break;

        //D:68 , Arrow Right 39
        //,Arrow Left 37 ,A 65
        // Arrow Down 40, S 83
        //Arrow Up 38 , W 87

        case 68:
        case 39:
            //      if(angle < 45)
            angle += 1;
            console.log("angle", angle);
            break;

        case 65:
        case 37: {
            //   if(angle> -45)
            angle -= 1;
            console.log(angle);
            break;
        }

        case 38:
        case 87:
            //  if(angle2 < 45)
            angle2 += 1;
            console.log("angle2", angle2);
            break;

        case 40:
        case 83:
            // if(angle2 > -45)
            angle2 -= 1;
            console.log("angle2", angle2);
            break;
    }
}
document.addEventListener("keydown", moveCamera, false);

let go = true;
let isLunch = false;

//controls
const orbit = new OrbitControls(camera, renderer.domElement);

//Animaition

// create a new clock instance
//   const clock = new THREE.Clock();

function animate() {
    ////////////////////////////

    // get the elapsed time since the last frame
    //  var dtime = clock.getDelta();

    //update the camera

    // camera.lookAt(model.position)

    var cubePosition = new THREE.Vector3();
    cubePosition.setFromMatrixPosition(model.matrixWorld);
    camera.position.lerp(
        cubePosition.clone().add(new THREE.Vector3(-200, 100, 0)),
        0.09,
    );
    orbit.target.lerp(cubePosition, 0.5);
    orbit.update();

    let dTime = 0.1;
    // model.rotation.x = +angle * 0.01;
    // model.rotation.y = -angle * 0.01;
    // model.rotation.z = +angle2 * 0.01;

    //update objects
    let xx = p.position.x;
    let yy = p.position.y;
    let zz = p.position.z;

    //update objects
    let xxRot = p.rotation.x + angle * 0.01;
    let yyRot = p.rotation.y ; //
    let zzRot = p.rotation.z + angle2 * 0.01;

    if (isLunch) {
        console.log("this.rotation : ", model.rotation);

        if (model.position.y >= 0 && model.position.y < 20000)
            model.position.set(xx * 0.1, yy * 0.1, zz * 0.1);


        // model.position.set(xx* 0.1, yy* 0.1, zz* 0.1);

        // model.rotation.set(xxRot+angle * 0.001, yyRot-angle * 0.01, zzRot+angle2 * 0.01);

        model.rotation.set(xxRot, yyRot, zzRot);

        p.update(dTime, p.vilocity, angle, angle2);
        renderer.render(scene, camera);
    }

    //renderer
    renderer.render(scene, camera);
    //window.requestAnimationFrame(animate)
}

renderer.setAnimationLoop(animate);
