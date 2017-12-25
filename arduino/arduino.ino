// Includes
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
#define PIXELS_DIMINISH    4 // Inverted brightness
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

    // Rainbow
    rainbow();

    // Delay a little bit for stability
    delay(30);
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

    switch (data[0])
    {
        case CONTROL_COLOR_WIPE:
            colorWipe(data[1], data[2], data[3]);
            break;

        case CONTROL_PUSH_FRONT:
            pushFront(data[1], data[2], data[3]);
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
