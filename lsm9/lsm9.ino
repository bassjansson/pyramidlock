// Include libraries
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM9DS0.h>


// Assign a unique base ID for this sensor
Adafruit_LSM9DS0 lsm = Adafruit_LSM9DS0(1000);  // Use I2C, ID #1000

// Sensor events
sensors_event_t accel, mag, gyro, temp;

// Time
unsigned long previousMillis = 0;

// Gyro
float gyroX = 0.0;
float gyroY = 0.0;
float gyroZ = 0.0;
float filter = 0.6;

// Orientation
float XX = 0.0;
float YY = 0.0;
float ZZ = 0.0;


/*
 *  Arduino setup function (automatically called at startup)
 */
void setup()
{
    Serial.begin(9600);

    initialiseSensor();

    //displaySensorDetails();

    // Set time
    previousMillis = millis();
}


/*
 * Arduino loop function, called once 'setup' is complete
 */
void loop()
{
    //displaySensorValues();

    // Get sensor events
    lsm.getEvent(&accel, &mag, &gyro, &temp);

    // Set time
    float diffSeconds = (millis() - previousMillis) / 1000.0;
    previousMillis = millis();

    // Update gyro
    gyroX = filter * gyroX + (1.0 - filter) * gyro.gyro.x;
    gyroY = filter * gyroY + (1.0 - filter) * gyro.gyro.y;
    gyroZ = filter * gyroZ + (1.0 - filter) * gyro.gyro.z;

    // Update orientation
    XX += (gyroX + 0.4) * diffSeconds;
    YY += (gyroY - 2.5) * diffSeconds;
    ZZ += (gyroZ + 5.8) * diffSeconds;

    // Display gyro
    Serial.print("Gyro - X: "); Serial.print(XX); Serial.print(" , ");
    Serial.print("Y: "); Serial.print(YY); Serial.print(" , ");
    Serial.print("Z: "); Serial.print(ZZ); Serial.print("\n");

    // Delay
    delay(100);
}


/*
 *  Begins the sensor and configures the gain and integration time for the TSL2561
 */
void initialiseSensor()
{
    // Begin the sensor
    if(!lsm.begin())
    {
        //Serial.print(F("Ooops, no LSM9DS0 detected ... Check your wiring or I2C ADDR!"));
        while (1);
    }

    //Serial.println(F("Yeeaah, found LSM9DS0 9DOF Sensor!"));

    // 1.) Set the accelerometer range
    lsm.setupAccel(lsm.LSM9DS0_ACCELRANGE_2G);
    //lsm.setupAccel(lsm.LSM9DS0_ACCELRANGE_4G);
    //lsm.setupAccel(lsm.LSM9DS0_ACCELRANGE_6G);
    //lsm.setupAccel(lsm.LSM9DS0_ACCELRANGE_8G);
    //lsm.setupAccel(lsm.LSM9DS0_ACCELRANGE_16G);

    // 2.) Set the magnetometer sensitivity
    lsm.setupMag(lsm.LSM9DS0_MAGGAIN_2GAUSS);
    //lsm.setupMag(lsm.LSM9DS0_MAGGAIN_4GAUSS);
    //lsm.setupMag(lsm.LSM9DS0_MAGGAIN_8GAUSS);
    //lsm.setupMag(lsm.LSM9DS0_MAGGAIN_12GAUSS);

    // 3.) Setup the gyroscope
    lsm.setupGyro(lsm.LSM9DS0_GYROSCALE_245DPS);
    //lsm.setupGyro(lsm.LSM9DS0_GYROSCALE_500DPS);
    //lsm.setupGyro(lsm.LSM9DS0_GYROSCALE_2000DPS);
}


/*
 *  Reads and displays the current sensor values
 *//*
void displaySensorValues()
{
    // Get a new sensor event
    sensors_event_t accel, mag, gyro, temp;
    lsm.getEvent(&accel, &mag, &gyro, &temp);

    // print out accelleration data
    Serial.print("Accel X: "); Serial.print(accel.acceleration.x); Serial.print(" ");
    Serial.print("  \tY: "); Serial.print(accel.acceleration.y);       Serial.print(" ");
    Serial.print("  \tZ: "); Serial.print(accel.acceleration.z);     Serial.println("  \tm/s^2");

    // print out magnetometer data
    Serial.print("Magn. X: "); Serial.print(mag.magnetic.x); Serial.print(" ");
    Serial.print("  \tY: "); Serial.print(mag.magnetic.y);       Serial.print(" ");
    Serial.print("  \tZ: "); Serial.print(mag.magnetic.z);     Serial.println("  \tgauss");

    // print out gyroscopic data
    Serial.print("Gyro  X: "); Serial.print(gyro.gyro.x); Serial.print(" ");
    Serial.print("  \tY: "); Serial.print(gyro.gyro.y);       Serial.print(" ");
    Serial.print("  \tZ: "); Serial.print(gyro.gyro.z);     Serial.println("  \tdps");

    // print out temperature data
    Serial.print("Temp: "); Serial.print(temp.temperature); Serial.println(" *C");

    Serial.println("**********************\n");

    delay(1000);
}*/


/*
 *  Displays some basic information on this sensor from the unified
 *  sensor API sensor_t type (see Adafruit_Sensor for more information)
 *//*
void displaySensorDetails()
{
    sensor_t accel, mag, gyro, temp;

    lsm.getSensor(&accel, &mag, &gyro, &temp);

    Serial.println(F("------------------------------------"));
    Serial.print  (F("Sensor:       ")); Serial.println(accel.name);
    Serial.print  (F("Driver Ver:   ")); Serial.println(accel.version);
    Serial.print  (F("Unique ID:    ")); Serial.println(accel.sensor_id);
    Serial.print  (F("Max Value:    ")); Serial.print(accel.max_value); Serial.println(F(" m/s^2"));
    Serial.print  (F("Min Value:    ")); Serial.print(accel.min_value); Serial.println(F(" m/s^2"));
    Serial.print  (F("Resolution:   ")); Serial.print(accel.resolution); Serial.println(F(" m/s^2"));
    Serial.println(F("------------------------------------"));
    Serial.println(F(""));

    Serial.println(F("------------------------------------"));
    Serial.print  (F("Sensor:       ")); Serial.println(mag.name);
    Serial.print  (F("Driver Ver:   ")); Serial.println(mag.version);
    Serial.print  (F("Unique ID:    ")); Serial.println(mag.sensor_id);
    Serial.print  (F("Max Value:    ")); Serial.print(mag.max_value); Serial.println(F(" uT"));
    Serial.print  (F("Min Value:    ")); Serial.print(mag.min_value); Serial.println(F(" uT"));
    Serial.print  (F("Resolution:   ")); Serial.print(mag.resolution); Serial.println(F(" uT"));
    Serial.println(F("------------------------------------"));
    Serial.println(F(""));

    Serial.println(F("------------------------------------"));
    Serial.print  (F("Sensor:       ")); Serial.println(gyro.name);
    Serial.print  (F("Driver Ver:   ")); Serial.println(gyro.version);
    Serial.print  (F("Unique ID:    ")); Serial.println(gyro.sensor_id);
    Serial.print  (F("Max Value:    ")); Serial.print(gyro.max_value); Serial.println(F(" rad/s"));
    Serial.print  (F("Min Value:    ")); Serial.print(gyro.min_value); Serial.println(F(" rad/s"));
    Serial.print  (F("Resolution:   ")); Serial.print(gyro.resolution); Serial.println(F(" rad/s"));
    Serial.println(F("------------------------------------"));
    Serial.println(F(""));

    Serial.println(F("------------------------------------"));
    Serial.print  (F("Sensor:       ")); Serial.println(temp.name);
    Serial.print  (F("Driver Ver:   ")); Serial.println(temp.version);
    Serial.print  (F("Unique ID:    ")); Serial.println(temp.sensor_id);
    Serial.print  (F("Max Value:    ")); Serial.print(temp.max_value); Serial.println(F(" C"));
    Serial.print  (F("Min Value:    ")); Serial.print(temp.min_value); Serial.println(F(" C"));
    Serial.print  (F("Resolution:   ")); Serial.print(temp.resolution); Serial.println(F(" C"));
    Serial.println(F("------------------------------------"));
    Serial.println(F(""));

    delay(500);
}*/
