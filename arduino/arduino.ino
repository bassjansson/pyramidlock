// Include libraries
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM9DS0.h>
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
    #include <avr/power.h>
#endif


// Data defines
#define DATA_DELIMITER  ','
#define DATA_ENDLINE    '\n'
#define DATA_SIZE        4 // [Control, Red, Green, Blue]

// Control defines
#define CONTROL_COLOR_WIPE  200
#define CONTROL_PUSH_FRONT  201
#define CONTROL_RAINBOW     202

// Pixel defines
#define PIXELS_COUNT       172 // 86
#define PIXELS_DATA_PIN    6
#define PIXELS_DIMINISH    2 // Inverted brightness
#define PIXELS_TYPE_FLAGS  (NEO_GRB + NEO_KHZ800)


// Data variables
int dataValues[DATA_SIZE];
int dataIndex = 0;
String dataString = "";

// Pixel variables
Adafruit_NeoPixel neoPixels = Adafruit_NeoPixel(PIXELS_COUNT, PIXELS_DATA_PIN, PIXELS_TYPE_FLAGS);

// Rainbow variables
float phaseFreq = 0.023;
float hueFreq = 0.003;

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

// Control
int control = 200;


// Setup
void setup()
{
    // Initialize serial communication
    Serial.begin(9600);

    // Initialize sensor
    initializeSensor();

    // Set time
    previousMillis = millis();

    // Initialize data values
    for (int i = 0; i < DATA_SIZE; ++i)
        dataValues[i] = 0;

    // Initialize neo pixels
    neoPixels.begin();
    neoPixels.show();
}

// Loop
void loop()
{
    // Read serial data
    readSerialData();

    // Read sensor
    readSensor();

    // Control LED strip
    uint8_t rr = cos(XX / 360.0 * 4.0 * PI) * -127.0 + 127.0;
    uint8_t gg = cos(YY / 360.0 * 4.0 * PI) * -127.0 + 127.0;
    uint8_t bb = cos(ZZ / 360.0 * 4.0 * PI) * -127.0 + 127.0;

    switch (control)
    {
        case CONTROL_COLOR_WIPE:
            colorWipe(rr, gg, bb);
            break;

        case CONTROL_PUSH_FRONT:
            pushFront(rr, gg, bb);
            break;

        case CONTROL_RAINBOW:
            rainbow();
            break;

        default:
            colorWipe(0, 0, 0);
            break;
    }

    // Delay a little bit for stability
    delay(50);
}


// Set entire strip to one color
void colorWipe(uint8_t r, uint8_t g, uint8_t b)
{
    uint8_t d = PIXELS_DIMINISH;

    for (uint16_t i = 0; i < neoPixels.numPixels(); ++i)
        neoPixels.setPixelColor(i, r / d, g / d, b / d);

    neoPixels.show();
}

// Push a color to the front of the strip
void pushFront(uint8_t r, uint8_t g, uint8_t b)
{
    uint8_t d = PIXELS_DIMINISH;

    for (uint16_t i = neoPixels.numPixels() - 1; i > 0; --i)
        neoPixels.setPixelColor(i, neoPixels.getPixelColor(i - 1));

    neoPixels.setPixelColor(0, r / d, g / d, b / d);
    neoPixels.show();
}

// Input a hue (0 to 255) to get a color value
uint32_t hueToColor(uint8_t hue)
{
    uint8_t d = PIXELS_DIMINISH;

    if (hue < 85)
    {
        return neoPixels.Color((255 - hue * 3) / d, 0, hue * 3 / d);
    }

    if (hue < 170)
    {
        hue -= 85;
        return neoPixels.Color(0, hue * 3 / d, (255 - hue * 3) / d);
    }

    hue -= 170;
    return neoPixels.Color(hue * 3 / d, (255 - hue * 3) / d, 0);
}

// Display rainbow with a phase and hue shifting frequency
void rainbow()
{
    if (phaseFreq < 0.0 || hueFreq < 0.0)
        return;

    float seconds = millis() / 1000.0;
    float phase = fmod(seconds * phaseFreq, 1.0);
    uint8_t centerHue = uint8_t(seconds * hueFreq * 256.0) % 256;

    for (uint16_t i = 0; i < neoPixels.numPixels(); ++i)
    {
        uint8_t pos = sin(((float)i / neoPixels.numPixels() + phase) * 2.0 * PI) * 32.0;
        uint8_t hue = (pos + centerHue) % 256;
        neoPixels.setPixelColor(i, hueToColor(hue));
    }

    neoPixels.show();
}


// Initialize sensor
void initializeSensor()
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

// Read sensor
void readSensor()
{
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
    XX = fmod(XX + 360.0 + (gyroX + 0.4) * diffSeconds, 360.0);
    YY = fmod(YY + 360.0 + (gyroY - 2.5) * diffSeconds, 360.0);
    ZZ = fmod(ZZ + 360.0 + (gyroZ + 5.8) * diffSeconds, 360.0);
}


// Send data
void sendData(int data[], int size)
{
    Serial.print(data[0]);

    for (int i = 1; i < size; ++i)
        Serial.print(DATA_DELIMITER + String(data[i]));

    Serial.print(DATA_ENDLINE);
}

// On data received callback
void onDataReceived(int data[DATA_SIZE])
{
    phaseFreq = hueFreq = -1.0;
    control = data[0];

    switch (data[0])
    {
        case CONTROL_COLOR_WIPE:
            break;

        case CONTROL_PUSH_FRONT:
            break;

        case CONTROL_RAINBOW:
            phaseFreq = data[1] / 1000.0;
            hueFreq = data[2] / 1000.0;
            break;

        default: break;
    }

    // TODO: For testing
    //delay(20);
    //sendData(data, DATA_SIZE);
}

// Read serial data
void readSerialData()
{
    while (Serial.available())
    {
        char c = Serial.read();

        if (c == DATA_DELIMITER || c == DATA_ENDLINE)
        {
            if (dataIndex < DATA_SIZE)
            {
                if (dataString.length() > 0)
                    dataValues[dataIndex] = dataString.toInt();
                else
                    dataValues[dataIndex] = 0;

                dataIndex++;
                dataString = "";
            }

            if (c == DATA_ENDLINE)
            {
                onDataReceived(dataValues);

                for (int i = 0; i < DATA_SIZE; ++i)
                    dataValues[i] = 0;

                dataIndex = 0;
            }
        }
        else
        {
            if (dataIndex < DATA_SIZE)
                dataString += c;
        }
    }
}
