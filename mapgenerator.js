function MapGenerator() {
};

<<<<<<< HEAD
MapGenerator.prototype.createHexagonPattern = function(mapWidth, mapHeight, hexagonSize, useDistortion) {
=======
MapGenerator.prototype.createHexagonPattern = function(mapWidth, mapHeight, hexagonSize, useDistortion/*, distortionAmount*/) {
    /*
    * amount of distortion
    * if bigger than 1, chances grow that connections can't be seen
    * or hexagons overlap each other
    */
    var distortionAmount = arguments[4];
    
    if (distortionAmount == undefined)
        distortionAmount = 1;
    
>>>>>>> 545b9590d7c77110a2138f28b5190c4f1d8a2ed3
    this.map = new Map(mapWidth, mapHeight, hexagonSize);
    this.map.generateHexagonArray(useDistortion);
};

MapGenerator.prototype.generate = function(numberOfCountries, countrySizeVariance, useCompactShapes) {
    if (this.map == undefined)
        throw "call MapGenerator.createHexagonPattern() before generating";
    
    this.map.clear();
    this.map.normalGenerator(numberOfCountries, countrySizeVariance, useCompactShapes);
    this.map.calculateOutlines();
    this.map.deleteCountryHoles();
    this.map.calculateCenters();
    this.map.getCountryNeighbors();
};
    
MapGenerator.prototype.getCountries = function() {
    return this.map.countries;
};

MapGenerator.prototype.getRawMap = function() {
    return this.map;  
};

<<<<<<< HEAD
MapGenerator.prototype.getMap = function() {
=======
MapGenerator.prototype.getMap = function(/* includeAdjacencyMatrix */) {
    /* 
    * determines if the neighbor informations for every country
    * get additionally stored in a adjacencyMatrix inclusive center-to-center distances
    */
    var includeAdjacencyMatrix = arguments[0];
    if (includeAdjacencyMatrix == undefined)
        includeAdjacencyMatrix = false;
    
>>>>>>> 545b9590d7c77110a2138f28b5190c4f1d8a2ed3
    var map = {};
    
    map.width = this.map.width;
    map.height = this.map.height;
    map.regions = new Array();
    
    for (var i = 0; i < this.map.countries.length; i++) {
        var region = {};
        
        region.center = this.map.countries[i].center;
        region.ID = this.map.countries[i].ID;
        
        var pathString = "M " + this.map.countries[i].outline[0].x + " " + this.map.countries[i].outline[0].y;
        
        for (var j = 1; j < this.map.countries[i].outline.length; j++) {
            pathString += "L " + this.map.countries[i].outline[j].x + " " + this.map.countries[i].outline[j].y;
        }
        
        pathString += " Z";
        region.pathString = pathString;
        
        region.neighborIDs = new Array();
        for (var j = 0; j < this.map.countries[i].neighbors.length; j++) {
            region.neighborIDs.push(this.map.countries[i].neighbors[j].ID)
        }
        
        map.regions.push(region);
    }
    
<<<<<<< HEAD
    map.adjacencyMatrix = new Array();
    
    for (var i = 0; i < this.map.countries.length; i++) {
        map.adjacencyMatrix[i] = new Array();
    
        for (var j = 0; j < this.map.countries.length; j++) {
            map.adjacencyMatrix[i][j] = 0;
=======
    if (includeAdjacencyMatrix) {
        map.adjacencyMatrix = new Array();
        
        for (var i = 0; i < this.map.countries.length; i++) {
            map.adjacencyMatrix[i] = new Array();
        
            for (var j = 0; j < this.map.countries.length; j++) {
                map.adjacencyMatrix[i][j] = 0;
            }
>>>>>>> 545b9590d7c77110a2138f28b5190c4f1d8a2ed3
        }
    }
    
    for (var i = 0; i < this.map.countries.length; i++) {
        for (var j = 0; j < this.map.countries[i].neighbors.length; j++) {
            var differenceX = this.map.countries[i].center.x - this.map.countries[i].neighbors[j].center.x;
            var differenceY = this.map.countries[i].center.y - this.map.countries[i].neighbors[j].center.y;
            var distance = Math.sqrt(Math.pow(differenceX, 2) + Math.pow(differenceY, 2));
        
            map.adjacencyMatrix[this.map.countries[i].ID][this.map.countries[i].neighbors[j].ID] = distance;
        }
    }
    
    return map;
};