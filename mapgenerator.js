function MapGenerator() {
};

MapGenerator.prototype.generate = function(mapWidth, mapHeight, hexagonSize, numberOfCountries, countrySizeVariance, maximumHoleSize, useDistortion, useCompactShapes) {
    this.map = new Map(mapWidth, mapHeight, hexagonSize, useCompactShapes);
    this.map.generateHexagonArray(useDistortion);
    this.map.normalGenerator(numberOfCountries, countrySizeVariance, maximumHoleSize);
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

MapGenerator.prototype.getMap = function() {
    var map = {};
    
    map.width = this.map.width;
    map.height = this.map.height;
    map.regions = new Array();
    map.adjacencyMatrix = new Array();
    
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
        
        map.regions.push(region);
    }
    
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
    
    return map;
};