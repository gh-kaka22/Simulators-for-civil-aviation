import * as THREE from "three";
export class Plane {
    constructor(
        position,
        rotation,
        planeMass,
        fuelMass,
        Tempreture,
        massFlowRate,
        WindSpeed,
        WindAngle,
        cl,
        cd,
        s,
    ) {
        this.totalF = new THREE.Vector3(0, 0, 0);
        this.totalT = new THREE.Vector3(0, 0, 0);
        this.position = new THREE.Vector3(position.x, position.y, position.z);
        this.rotation = new THREE.Vector3(rotation.x, rotation.y, rotation.z);
        this.vilocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.angularAcceleration = new THREE.Vector3(0, 0, 0);
        this.angularVelocity = new THREE.Vector3(0, 0, 0);
        this.planeMass = planeMass;
        this.fuelMass = fuelMass;
        this.Tempreture = Tempreture;
        this.massFlowRate = massFlowRate;
        this.cl = cl;
        this.cd = cd;
        this.s = s;
        this.WindSpeed = WindSpeed;
        this.WindAngle = WindAngle * (Math.PI / 180);
        this.gravity = 9.8;
        this.centerOfMass = new THREE.Vector3(
            position.x,
            position.y,
            position.z,
        ); // Replace with actual coordinates
        // this.liftLeverArm = 0;
        this.windLeverArm = 0;
        this.ThrustLeverArm = 0;
        this.momentOfInertia = 0;
        this.g = new THREE.Vector3(0, 0, 0);
    }

    gravity_acceleration() {
        this.gravity = 9.8;
    }

    calc_air_rho(g, H, T) {
        let Rspecific = 287.058,
            R = 8.3148,
            Md = 0.028964;
        let P0 = 1.01325; // 1bar =100000pa
        let Tkelvin = T + 273.15;
        let P = P0 * Math.exp((-Md * g * H) / (R * Tkelvin)) * Math.pow(10, 5);
        let rho = P / (Rspecific * Tkelvin);
        console.log("this.rho:" , rho)
        return rho;
    }

    wind_Velocity() {
        this.wind = new THREE.Vector3(
            Number(Math.cos(this.WindAngle)) * this.WindSpeed,
            0,
            Math.sin(this.WindAngle) * this.WindSpeed,
        ); // Adjust the wind velocity as needed (e.g., 5 m/s in the X direction)
        console.log("this.wind : ", this.wind);
    }

    gravity_force() {
        //     // W = M * g
        console.log(`fule : ${this.fuelMass}`);
        console.log(`plane : ${this.planeMass}`);

        // Gravitational acceleration (m/s^2) at sea level
        const seaLevelGravity = 9.8;

        // Get the altitude of the airplane in meters
        const altitude = this.position.y;

        // Calculate gravity based on altitude (you can use any formula here)

        const currentGravity =
            seaLevelGravity *
            Math.pow(0.95, altitude / 1000) *
            (this.fuelMass + this.planeMass);

        const GravityONx =
            -1 * currentGravity * Math.sin(this.AngleOfInclination);
        const GravityONy =
            -1 * currentGravity * Math.cos(this.AngleOfInclination);

        // Create a gravity vector with the correct direction and magnitude
        this.g = new THREE.Vector3(GravityONx, GravityONy, 0);
    }

    lift_force(oldVelocity) {
        // Get the air density based on altitude and temperature
        const airDensity = this.calc_air_rho(
            this.gravity,
            this.position.y,
            this.Tempreture,
        );

        // Calculate the angle of attack of the airplane (you need to implement this)
        // const angleOfAttack = this.planeAngle;

        // Calculate lift force using more realistic formula
        var liftCoefficient;
        // liftCoefficient=this.cl;

        // liftCoefficient= 16*this.g.length() / this.s * this.vilocity.lengthSq()

        if (
            (this.AngleOfAttack > 0 && this.AngleOfAttack < Math.PI / 8) ||
            (this.AngleOfAttack > (7 * Math.PI) / 8 &&
                this.AngleOfAttack < Math.PI)
        )
            liftCoefficient = Math.sin(
                6 * this.AngleOfAttack,
            ); //sin(6*AngleOfAttack)
        else liftCoefficient = Math.sin(2 * this.AngleOfAttack); //sin(2*AngleOfAttack)

        const lift =
            0.5 *
            airDensity *
            oldVelocity.lengthSq() *
            this.s *
            liftCoefficient;

        const liftONy = lift * Math.cos(this.AngleOfInclination);
        const liftONz = lift * Math.sin(this.AngleOfInclination);
        console.log("liftONy : ", liftONy);
        console.log("liftONz : ", liftONz);

        this.l = new THREE.Vector3(0, liftONy, liftONz);

        console.log("liftCoefficient : ", liftCoefficient);
    }

    thrust_force() {
        // Define the velocity of the gas leaving the engine in m/s
        //const exitVelocity = 10; // You can adjust this value
        const exitVelocity = 500;
        //he Boeing 737 can have exhaust velocities ranging from approximately 500 to 900 meters per second

        // Define the pressure of the gas leaving the engine in Pa

        // const exitPressure = 1000000; // You can adjust this value
        const exitPressure = 1000; // You can adjust this value

        /*
        Modern jet engines like those used on the Boeing 737 can have exhaust pressures
         ranging from a few hundred to a few thousand pascals (Pa).
         However, the exact exhaust pressure will depend on various factors, including the engine's design, 

        قد تكون قيمة الضغط للغازات المغادرة من محرك طائرة بوينغ 737-
        700 في نطاق من حوالي500 باسكال (0.5 كيلوباسكال) إلى 2000 باسكال (2 كيلوباسكال). 
        هذه القيم تقديرية وتعتمد على مجموعة متنوعة من العوامل التي تؤثر على أداء المحرك.

        */

        // Define the ambient pressure in Pa
        const ambientPressure = 101325; // You can adjust this value

        // Define the area of the nozzle in m^2
        // const exitArea = 0.001; // You can adjust this value
        const exitArea = 1.5; // You can adjust this value

        /*
        on the Boeing 737-700 could be
        in the range of approximately 1 to 3 square meters
        */

        /*
        تحريك الطائرة: معدل احتراق الوقود أثناء التحريك
         قد يتراوح بين 1,200 إلى 2,000 كيلوغرام في الساعة (kg/h) 
         أو أكثر تبعًا لحجم الطائرة وتصميم المحرك.

        إقلاع الطائرة: معدل احتراق الوقود أثناء عملية الإقلاع قد يكون أعلى ويعتمد على وزن الطائرة
         ومتطلبات السحب (Thrust) اللازمة للتحليق.
         يمكن أن يكون في نطاق 2,500 إلى 4,000 كيلوغرام في الساعة (kg/h) أو أكثر.

        هبوط الطائرة: عادةً ما يكون معدل احتراق الوقود أثناء الهبوط أقل من
        معدل الاستهلاك أثناء الإقلاع والتحليق.
        تختلف قيمه حسب المسار والإجراءات المتبعة،
        وقد يكون في نطاق 1,000 إلى 1,500 كيلوغرام في الساعة (kg/h) أو أقل.
        */

        // Calculate the net force using the law of thrust
        let thrust;
        if (!this.massFlowRate) {
            thrust = 0;
        } else {
            thrust =
                this.massFlowRate * exitVelocity +
                (exitPressure - ambientPressure) * exitArea;
        }

        const thrustDirection = new THREE.Vector3(1, 0, 0); // Assuming thrust is along the X-axis
        this.t = thrustDirection.multiplyScalar(thrust);
    }

    drag_force(oldVelocity) {
        // Get the air density based on altitude and temperature
        const airDensity = this.calc_air_rho(
            this.gravity,
            this.position.y,
            this.Tempreture,
        );

        // Calculate drag force using more realistic formula
        var dragCoefficient; // You can adjust this value
        dragCoefficient = this.cd;

        //   if((this.AngleOfAttack>0 && this.AngleOfAttack< Math.PI/8) || (this.AngleOfAttack> 7*Math.PI/8 && this.AngleOfAttack< Math.PI) )
        //   dragCoefficient=1-Math.cos(6*this.AngleOfAttack) //sin(6*AngleOfAttack)
        // else
        // dragCoefficient=1-Math.sin(2*this.AngleOfAttack) //sin(2*AngleOfAttack)

        const dragMagnitude =
            0.5 *
            airDensity *
            oldVelocity.lengthSq() *
            this.s *
            dragCoefficient;
        const dragDirection = oldVelocity.clone().normalize().negate();
        this.d = dragDirection.multiplyScalar(dragMagnitude);

        console.log("dragCoefficient : ", dragCoefficient);
    }

    totalForces(oldVilocity) {

        if (this.position.y > 1) {
            this.gravity_force();
            this.totalF.add(this.g);
        }


        if (this.position.y >= -0.1) {
            this.lift_force(oldVilocity);
            this.totalF.add(this.l);
        }


        this.drag_force(oldVilocity);
        this.totalF.add(this.d);

        this.thrust_force();
        this.totalF.add(this.t);

        this.wind_Velocity();
        this.totalF.add(this.wind);
    }

    resetForces() {
        this.totalF.set(0, 0, 0);
    }

    // Step 1: Identify the Torques
    calculateTorques(oldVilocity) {
        // Calculate lift force and drag force (assuming you have already implemented these functions)
        // this.lift_force(oldVilocity);
        // this.drag_force(oldVilocity);
        this.wind_Velocity();
        this.thrust_force();
        // this.gravity_force();

        // Calculate lever arm for each force
        //r=v^2 / g.tagγ

        // this.liftLeverArm = this.vilocity.lengthSq()/(this.gravity*Math.tan(this.AngleOfInclination));

        // this.liftLeverArm = this.position.clone().sub(this.centerOfMass);
        this.windLeverArm = this.position.clone().sub(this.centerOfMass);
        this.thrustLeverArm = this.position.clone().sub(this.centerOfMass);

        console.log("this.windLeverArm : ", this.windLeverArm);
        console.log("this.thrustLeverArm : ", this.thrustLeverArm);


        // Calculate torques as cross products of forces and lever arms


        this.windTorque = this.windLeverArm.clone().cross(this.wind);
        this.thrustTorque = this.thrustLeverArm.clone().cross(this.t);



        // this.liftTorque = this.liftLeverArm.clone().cross(this.l);
        // this.dragTorque = this.dragLeverArm.clone().cross(this.d);
        // if (this.position.y > 1) {
        // this.gravityTorque = this.gravityLeverArm.clone().cross(this.g);
        // }


        // Get the torques as cross products of the forces with their respective positions from the airplane's center of mass
        // this.liftTorque = this.position.clone().cross(this.l);
        // this.dragTorque = this.position.clone().cross(this.d);
        // this.windTorque = this.position.clone().cross(this.wind);
        // if (this.position.y > 1) {
        // this.gravityTorque = this.position.clone().cross(this.g);

  
        // console.log("The netTorque is: ", netTorque);

    }

    totalTorques(oldVilocity) {
        this.calculateTorques(oldVilocity);
        // this.totalT.add(this.thrustTorque);
        // this.totalT.add(this.windTorque);


    
    }

    resetTorques() {
        this.totalT.set(0, 0, 0);
    }

    update(dTime, oldVilocity, angle, angle2) {
        console.log("this.gravity : ", this.g);
        console.log("this.lift : ", this.l);
        console.log("this.thrust : ", this.t);
        console.log("this.drag : ", this.d);
        console.log("this.TotalForces : ", this.totalF);
        console.log("this.acceleration : ", this.acceleration);
        console.log("this.vilocity : ", this.vilocity);
        console.log("this.vilocity.length : ", Math.ceil(this.vilocity.length()),);
        console.log("this.vilocity : ", this.vilocity);
        console.log("this.position : ", this.position);
        console.log("this.angularAcceleration : ", this.angularAcceleration);
        console.log("this.angularVelocity : ", this.angularVelocity);
        console.log("this.netTorque : ", this.totalT);
        console.log("this.momentOfInertia : ", this.momentOfInertia);

        let RotX = this.rotation.x + angle;
        let RotY = this.rotation.y + angle;
        let RotZ = this.rotation.z + angle2;

        // this.AngleOfInclination =  (angle * Math.PI) / 180;
        // this.AngleOfAttack =  (angle2 * Math.PI) / 180;

        this.AngleOfInclination = (RotY* Math.PI) / 180 ;

        this.AngleOfAttack = (RotZ* Math.PI) / 180 ;
        console.log("this.AngleOfInclination : ", this.AngleOfInclination);
        console.log("this.AngleOfAttack : ", this.AngleOfAttack);

        // this.velocityLength = this.vilocity.length();
        // console.log("Velocity Length:", this.velocityLength);

        // this.tanValue = Math.tan(this.AngleOfInclination);
        // console.log("Tan Value:", this.tanValue);

        // this.R = (Math.ceil(this.velocityLength) / this.gravity) * this.tanValue;

        // this.momentOfInertia = 100000000;
        // this.R= ( Math.ceil(this.vilocity.length()) / this.gravity) * Math.tan(this.AngleOfInclination)
        // this.R= ( 2 * (this.planeMass + this.fuelMass) * this.gravity) / Math.ceil(this.vilocity.length())

        // this.R = new THREE.Vector3(
        //     this.thrustLeverArm.x +
        //         this.windLeverArm.x ,

        //     this.thrustLeverArm.y +
        //         this.windLeverArm.y ,

        //     this.thrustLeverArm.z +
        //         this.windLeverArm.z,
        // );

        this.R = 10

        console.log("R:", this.R);
        // this.momentOfInertia = (1 / 2) * (this.planeMass + this.fuelMass) * this.R;

        this.momentOfInertia=(1 / 2) * (this.planeMass + this.fuelMass) * this.R;


        console.log("momentOfInertia:", this.momentOfInertia);
        // You need to adjust this value based on your airplane's mass distribution and shape.
        //momentOfInertia = 1/2MR^2 .  r=v^2 / g.tagγ

        this.resetForces();
        this.resetTorques();

        this.totalForces(oldVilocity);
        this.totalTorques(oldVilocity);

        this.acceleration = new THREE.Vector3(
            this.totalF.x / (this.fuelMass + this.planeMass),
            this.totalF.y / (this.fuelMass + this.planeMass),
            this.totalF.z / (this.fuelMass + this.planeMass),
        );

        // Calculate velocity using THREE.Vector3

        this.vilocity.add(this.acceleration.clone().multiplyScalar(dTime));

        this.position.add(this.vilocity.clone().multiplyScalar(dTime));

        if (
            this.position.y > -5 &&
            this.position.y < 2000 &&
            this.position.z < 400000 &&
            this.position.z > -400000
        ) {
            if (this.R > 0)
                this.angularAcceleration = new THREE.Vector3(
                    this.totalT.x / this.momentOfInertia,
                    this.totalT.y / this.momentOfInertia,
                    this.totalT.z / this.momentOfInertia,
                );

            this.angularVelocity.add(
                this.angularAcceleration.clone().multiplyScalar(dTime),
            );

            RotX = this.angularVelocity.x * dTime;
            RotY = this.angularVelocity.y * dTime;
            RotZ = this.angularVelocity.z * dTime;



            this.rotation.x += RotX;
            this.rotation.y += RotY;
            this.rotation.z += RotZ;
        }

        console.log("ROTATION MOVEMENT ON X : ", RotX);
        console.log("ROTATION MOVEMENT ON Y : ", RotY);
        console.log("ROTATION MOVEMENT ON Z : ", RotZ);
    }
}
