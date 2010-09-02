Map Generator
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
            
    generator.createHexagonPattern(
        width, 
        height, 
        hexagonSize, 
        useDistortion
        /* distortionAmount */
    );
                
    generator.generate(
        numberOfCountries, 
        countrySizeVariance, 
        useCompactShapes
        /* mapCoverage */
        /* startAtCenter */
    );
            
    var myMap = generator.getMap(true);
    var myRawMap = generator.getRawMap();
    
### Arguments
* **width**

    The width of the map.

* **height**

    The height of the map.

* **hexagonSize**

    The size of a single hexagon. The total amount of hexagons out of the map is generated depends on the size of the map and this figure.

* **numberOfCountries**

    The amount of countries the map will consist of.

* **countrySizeVariance**

    Percentage value of how much the countries can vary in their size in correlation to the average country size.

* **useDistortion**

    Toggles between regular hexagons and distorted ones.

* **useCompactShapes**

    Toggles between random country shapes and more compact ones.

---
### Output
With MapGenerator.getRawMap() you get the raw map with all helper objects and references which were calculated internally. If you use MapGenerator.getMap(includeAdjacencyMatrix) this data will get processed once more for a more lightweight result.

#### MapGenerator.getMap(includeAdjacencyMatrix)
Returns following object:

* **width**

    The width of the map.

* **height**

    The height of the map.

* **regions**

    A array with all region objects, which looks like this:
    * **ID**
    
        Unique integer ID of the region
    * **center**
    
        An object looking like this: 
        * **x**
        
            The x-coordinate of the calculated center of the region.
        * **y**
        
            The y-coordinate of the calculated center of the region.
    * **pathString**
    
        The outline of the region in form of an SVG path string.
        
    * **neighborIDs**
    
        An array filled with all connected region IDs.
    
* **adjacencyMatrix**
    
    You must call MapGenerator.getMap(true) with the 'true' argument to get the adjacencyMatrix. The adjacencyMatrix of the map, when there is no connection the value is 0 otherwise the distance between the two centers of the regions. The indexes are the IDs of the regions.