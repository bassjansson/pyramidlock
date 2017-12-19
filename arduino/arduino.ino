// Includes
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
    #include <avr/power.h>
#endif

// Data defines
#define DATA_DELIMITER  ','
#define DATA_ENDLINE    '\n'
#define DATA_SIZE        4 // Control Red Green Blue

// Pixel defines
#define PIXELS_COUNT       86 // 172
#define PIXELS_DATA_PIN    6
#define PIXELS_DIMINISH    10 // Inverted brightness
#define PIXELS_TYPE_FLAGS  (NEO_GRB + NEO_KHZ800)

// Control defines
#define CONTROL_PUSH_FRONT  200


// Data variables
int dataValues[DATA_SIZE];
int dataIndex = 0;
String dataString = "";

// Pixel variables
Adafruit_NeoPixel neoPixels = Adafruit_NeoPixel(PIXELS_COUNT, PIXELS_DATA_PIN, PIXELS_TYPE_FLAGS);


// Setup
void setup()
{
    // Initialize serial communication
    Serial.begin(9600);

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

    // Delay a little bit for stability
    delay(10);
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

// On data received callback
void onDataReceived(int data[DATA_SIZE])
{
    if (data[0] == CONTROL_PUSH_FRONT)
        pushFront(data[1], data[2], data[3]);
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
