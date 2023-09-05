//import vector from "./vector";
import * as THREE from 'three' 
import { Vector3 } from 'three';
import * as dat from 'dat.gui' ;


export class Plane {

    // gui.add(parameters, 'v', 0, 1000);
    // gui.add(parameters, 'm', 0, 1000);
    // gui.add(parameters, 'airSpeed', -100, 100);
   
    //       gui.add(parameters, 'v', 0, 1).onChange(function(value) 
    //       {
    //       object.speed = value;
    //      });
  


    
    constructor(
        position,
        planeMass,
        fuelMass,
        massFlowRate,
        ambientPressure,
        // planeHeight ,
        //planeRadius ,
        //engineType ,
        //temerature ,

    ) {
        //this.totalF = vector.create(0,0,0);
        this.position = new Vector3(position.x, position.y, position.z);
        this.vilocity = new Vector3(0, 0, 0);
        this.planeMass = planeMass; 
        this.fuelMass = fuelMass;
       this.massFlowRate = massFlowRate; //10
       this.ambientPressure = ambientPressure; //101325
        this.timeCorrection = 0.1
        this.v = 24;
        this.cl = 0.97;
        this.cd = 0.5;
        this.s = 120;

// Define the mass flow rate of the exhaust gas in kg/s
//this.massFlowRate = 10;

// Define the velocity of the gas leaving the engine in m/s
this.exitVelocity = 1000;

 // Define the pressure of the gas leaving the engine in Pa
this.exitPressure = 100000;

// Define the ambient pressure in Pa
//this.ambientPressure = 101325;

 // Define the area of the nozzle in m^2
this.exitArea = 0.01;



        //     this.planeHeight = planeHeight ;
        //    // this.planeRadius = planeRadius ;
        //     this.totalMass = planeMass + fuelMass ;
        this.gravity = 9.8;
        //     this.t = new Vector3(0, 0,0);  console.log
        this.g = new Vector3(0, 0, 0);
    }






     gravity_force() {
         // W = M * g
         console.log(`fule : ${this.fuelMass}`);
         console.log(`plane : ${this.planeMass}`);
        var grav =(this.fuelMass + this.planeMass) * this.gravity

        console.log(`gravity : ${grav}`);
         this.g = new Vector3(0,
            -1 *  grav, 0);
         console.log("this.gravity", this.g);
     }




    lift_force() {
      
        var liftOnY=0.5 * 1 * this.v * this.v * this.s * this.cl;
        //liftOnX=
        //liftonZ=
        this.l = new Vector3(0,liftOnY , 0)

     }


     drag_force() {

         this.d = new Vector3(-1 * 0.5 * 1 * this.v * this.v * this.s * this.cd, 0, 0)

     }



     thrust_force()
      {


        this.t = new Vector3(this.massFlowRate * this.exitVelocity + (this.exitPressure - this.ambientPressure) * this.exitArea, 0, 0);

    }




    totalForces(dTime) {
        this.gravity_force();
        //this.lift_force();
        //this.drag_force();
       this.thrust_force();


        this.totalF = this.totalF.add(this.g);
        //this.totalF = this.totalF.add(this.l);
        //this.totalF = this.totalF.add(this.d);
        this.totalF = this.totalF.add(this.t);

    }

    isFreeFall() {
        return this.vilocity.y() <= 0;
    }
    noFuel() {
        return this.fuelMass <= 0;
    }
    resetForces() {
        this.totalF = new Vector3(0, 0);
    }

    /*
    isOutAthomspere() {
        return  this.position.y() > 670000;
    }
    */

    gravity_acceleration() {
        this.gravity = 9.8;
    }
    update(dTime, oldVilocity) {
        /*if (this.isOutAthomspere()) {
            console.log("I'm out !!!!!!!!!");
        }
        */
        /*        let newAngle = angle * 5.625;
                // console.log('newAngle', newAngle)
                this.rocketAngel = 90 + newAngle;
                // console.log('ra new', this.rocketAngel)
          */
        this.resetForces();
        this.gravity_acceleration();
        this.fuelMass = Math.max(this.fuelMass - this.massFlowRate * dTime, 0);
        this.totalForces(dTime);

        let acceleration;
        if (this.noFuel()) {
            acceleration = new Vector3(
                (this.totalF.x/ (this.fuelMass + this.planeMass)) *
                this.timeCorrection,
                (this.totalF.y / (this.fuelMass + this.planeMass)) *
                this.timeCorrection
            );
        }
        else {
            acceleration = new Vector3(
                this.totalF.x / (this.fuelMass + this.planeMass),
                this.totalF.y / (this.fuelMass + this.planeMass)
            );
        }

            this.vilocity = new Vector3(
            oldVilocity.x + acceleration.x * dTime,
            oldVilocity.y + acceleration.y * dTime
        );
        console.log(`po ${this.position.y}`);
        this.position.setX(this.position.x + this.vilocity.x * dTime);
        this.position.setY(this.position.y + this.vilocity.y * dTime);



    }
}
