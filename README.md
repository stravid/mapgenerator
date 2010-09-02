# Map Generator
====

## [Online Demo](#)
The Map Generator allows you to generate random, hexagon based maps with Javascript. You can change the width and height of the map, the size of an hexagon and the amount of countries the map consists of. Plus you can decide if the hexagons should be distorted or not and if the shape of a country is totaly random or more compact.

## Instructions
Inorder to use the Map Generator you have to include following files in your project
    point.js
    line.js
    hexagon.js
    country.js
    map.js
    mapgenerator.js

Then you can use the generator in your code
    var generator = new MapGenerator();
            
    generator.generate(
        width,
        height, 
        hexagonSize, 
        numberOfCountries, 
        countrySizeVariance, 
        maximumHoleSize, 
        useDistortion, 
        useCompactShapes
    );
            
    var myMap = generator.getMap();
    var myRawMap = generator.getRawMap();
    
### Arguments
**width**
The width of the map.

**height**
The height of the map.

**hexagonSize**
The size of a single hexagon. The total amount of hexagons out of the map is generated depends on the size of the map and this figure.

**numberOfCountries**
The amount of countries the map will consist of.

**countrySizeVariance**
Percentage value of how much the countries can vary in their size in correlation to the average country size.

**useDistortion**
Toggles between regular hexagons and distorted ones.

**useCompactShapes**
Toggles between random country shapes and more compact ones.