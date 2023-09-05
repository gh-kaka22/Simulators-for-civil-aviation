import * as THREE from 'three' 
import { OrbitControls } from  'three/examples/jsm/controls/OrbitControls'
import {Plane} from './planePhy.js' 
//import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
//import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import * as dat from 'dat.gui' ;
//import vector from './vector.js';
import { Vector3 } from 'three';


const scene = new THREE.Scene();
const sizes = {
    width : window.innerWidth  ,
    hight : window.innerHeight }

const canvas = document.querySelector('Canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100);


const orbit = new OrbitControls(camera , renderer.domElement);
camera.position.set(500,100,400);


window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  chasingCamera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  chasingCamera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
// هبد
const gui = new dat.GUI({
    width: 400,
  });

  const parameters = {
    
    fuelMass:0.1,
    planeMass:0.1,
    massFlowRate:1,
    ambientPressure:101325,


    //airSpeed:0

 };

 gui.add(parameters, 'fuelMass', 1, 100).step(1).name('fuelMass (kg)');
 gui.add(parameters, 'planeMass', 1, 1000).step(1).name('planeMass (kg)');
 gui.add(parameters, 'massFlowRate', 1, 100).step(10).name('massFlowRate (m/s)');
 gui.add(parameters, 'ambientPressure', 200000, 1000000).step(100).name('ambientPressure (pa)');





 




//const planeW = new THREE.Group();
//planeW.position.set(0, 200, 0);
const planeW = new THREE.Group();
planeW.position.set(10, 10, 10) ;

const p = new Plane(
    new THREE.Vector3 (planeW.position.x ,
        planeW.position.y , 
        planeW.position.z ) ,
    100,
    100
    );


//creat gui




    // Create a new OBJLoader
      const cube = new THREE.Object3D();
       const loader = new OBJLoader();
      loader.load("airplane.obj", (parent) => {
        console.log("Airplane model loaded successfully:", parent);
        cube.add(parent)
         scene.add(cube);

         cube.scale.set(0.1, 0.1, 0.1); // scale down the object
         cube.position.set(0,-10,0)
        cube.rotation.x = - Math.PI/2
        scene.add(cube);
         // Rotate the object to face forward
         //cube.rotation.x= -Math.PI / 2;



      });

      camera.lookAt(cube)

//البيئة الخارجية 
//  const texture = new THREE.TextureLoader();
//  const road = texture.load('/img/road.jpg');
// const cubeTextureLoader = new THREE.CubeTextureLoader();
// const cubeTexture = cubeTextureLoader.load([
//     '/img/meadow_lf.jpg','/img/meadow_rt.jpg' ,
//     '/img/meadow_up.jpg' ,'/img/meadow_dn.jpg' ,
//     '/img/meadow_ft.jpg' ,'/img/meadow_bk.jpg']);
//     scene.background = cubeTexture;



const cubeTextureLoader = new THREE.CubeTextureLoader();
const enviromentMap = cubeTextureLoader.load([
  "px.png",
  "nx.png",
  "py.png",
  "ny.png",
  "pz.png",
  "nz.png",
]);
  scene.enviroment= enviromentMap;
  scene.background = enviromentMap;


const ambientLight = new THREE.AmbientLight(0xffFF00);
scene.add(ambientLight);
//plan 1 
// const textureLoader = new THREE.TextureLoader();
// const planGeomatry = new THREE.PlaneGeometry(5000,100);
// const planMaterial = new THREE.MeshBasicMaterial({
//     color : 0xffffff,
//     side : THREE.DoubleSide , 
//     map : road
// });
// const plan = new THREE.Mesh(planGeomatry,planMaterial);
// scene.add(plan);
// plan.position.y = -500;
// plan.rotation.x = -0.5 * Math.PI ;
// plan.receiveShadow = true ;

// // plan 2
// const plan2Texture = textureLoader.load('/img/meadow_dn.jpg');
// const plane2Geometry = new THREE.PlaneGeometry(5000,5000);
// const plane2Material = new THREE.MeshBasicMaterial({
//    // color : 0xffff00 ,
//     side : THREE.DoubleSide , 
//     map : plan2Texture 
// });
// const plan2 = new THREE.Mesh(plane2Geometry, plane2Material) ;
// scene.add(plan2);
// plan2.position.y = -500 ;
// plan2.rotation.x = -0.5 * Math.PI ;
// plan2.receiveShadow = true ;
/*
// Plane Model 
const armyLoader = new OBJLoader();
armyLoader.load('./Models_G0402A425/F-15C Eagle.obj',function(obj){
   // const model = obj.scene;
    scene.add(obj);
    obj.position.set(0,1,10);
    obj.scale.set(15,15,15);
    obj.rotation.y = -0.5 * Math.PI ;
},undefined,function(error){
    console.error(error);
});
*/


//Axes Helper 
const axesHelper = new THREE.AxesHelper(800);
scene.add(axesHelper)


//cube
// const geometry = new THREE.BoxGeometry(100,100,100) 
//  const material = new THREE.MeshBasicMaterial ({ 
//      color : 'blue' ,
//      wireframe : false
// })
//  const cube = new THREE.Mesh( geometry , material )
//  scene.add(cube)  
//camera.rotation.y= -Math.PI/2;
camera.position.set(0,0,0);
//camera.rotation.y = Math.PI
camera.lookAt(cube)


let oldV = p.vilocity
function animate(){
    renderer.render(scene,camera);
    ////////////////////////////
    let xx = p.position.x
    let yy = p.position.y
    let zz = p.position.z
    let dTime = 0.1
    
    p.fuelMass = parameters.fuelMass;
    p.planeMass = parameters.planeMass;
    p.massFlowRate= parameters.massFlowRate;
    p.ambientPressure = parameters.ambientPressure;
    // console.log(yy);

    //camera.position.z = cube.position.z;
    //camera.position.y =cube.position.y
    camera.position.x = p.position.x - 500 ;
    cube.position.set(xx, yy, zz);

// set the target of the controls to the position of the object
orbit.target.copy(p.position);
// update the controls and render the scene
orbit.update();




    p.update(dTime,oldV);
}

renderer.setAnimationLoop(animate);
window.addEventListener('resize',function(){
    camera.aspect = window.innerWidth / window.innerHeight ;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
});
