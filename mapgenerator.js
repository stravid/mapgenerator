function MapGenerator() {
    this.mapCoverage = 0.6;
    this.startAtCenter = false;
    this.connectionsAsAdjacencyMatrix = true;
};

MapGenerator.prototype.generate = function(mapWidth, mapHeight, hexagonSize, numberOfCountries, countrySizeVariance, useDistortion, useCompactShapes) {
    this.map = new Map(mapWidth, mapHeight, hexagonSize, useCompactShapes);
    
    // var start = (new Date).getTime();
    this.map.generateHexagonArray(useDistortion);
    // console.log("grid: " + ((new Date).getTime() - start));
    
    // start = (new Date).getTime();
    this.map.normalGenerator(numberOfCountries, countrySizeVariance, this.mapCoverage, this.startAtCenter);
    // console.log("countries: " + ((new Date).getTime() - start));
    
    // start = (new Date).getTime();
    this.map.calculateOutlines();
    // console.log("outlines: " + ((new Date).getTime() - start));
    
    // start = (new Date).getTime();
    this.map.deleteCountryHoles();
    // console.log("holesremoving: " + ((new Date).getTime() - start));
    
    // start = (new Date).getTime();
    this.map.calculateCenters();
    // console.log("centers: " + ((new Date).getTime() - start));
    
    // start = (new Date).getTime();
    this.map.getCountryNeighbors();
    // console.log("neighbors: " + ((new Date).getTime() - start));
};
    
MapGenerator.prototype.getCountries = function() {
    return this.map.countries;
};

MapGenerator.prototype.getRawMap = function() {
    return this.map;  
};

MapGenerator.prototype.getMap = function() {
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
        
        if (!this.connectionsAsAdjacencyMatrix) {
            var neighborIDs = new Array();
            for (var j = 0; j < this.map.countries[i].neighbors.length; j++) {
                neighborIDs.push(this.map.countries[i].neighbors[j].ID)
            }
            region.neighbors = neighborIDs;
        }
        
        map.regions.push(region);
    }
    
    if (this.connectionsAsAdjacencyMatrix) {
        map.adjacencyMatrix = new Array();
        
        for (var i = 0; i < this.map.countries.length; i++) {
            map.adjacencyMatrix[i] = new Array();
        
            for (var j = 0; j < this.map.countries.length; j++) {
                map.adjacencyMatrix[i][j] = 0;
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
    }
    
    return map;
};