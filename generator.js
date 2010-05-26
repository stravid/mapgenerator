var MapGenerator = new Class({
    initialize: function(mapWidth, mapHeight, hexagonSize) {
        this.map = new Map(mapWidth, mapHeight, hexagonSize);
    },
    
    init: function(enableDistortion) {
        // FIXME: empty all
        this.map.generateHexagonArray(enableDistortion);
    },

    // FIXME: add shape style    
    generate: function(numberOfCountries, countrySizeVariance, maximumHoleSize) {
        // FIXME: empty all
        this.map.normalGenerator(numberOfCountries, countrySizeVariance, maximumHoleSize);
        this.map.calculateOutlines();
        
        
        this.map.deleteCountryHoles();
    
        this.map.calculateCenters();
    
        this.map.getCountryNeighbors();
    },
    
    getCountries: function() {
        return this.map.countries;
    },
    
    getUnitacsClientMap: function() {
        var clientMap = {};
        
        clientMap.width = this.map.width;
        clientMap.height = this.map.height;
        clientMap.regions = new Array();
        clientMap.connections = new Array();
        
        for (var i = 0; i < this.map.countries.length; i++) {
            var country = {};
            country.center = {};
            country.neighborIDs = new Array();
            
            country.ID = this.map.countries[i].ID;
            
            var pathString = "M " + this.map.countries[i].outline[0].x + " " + this.map.countries[i].outline[0].y;
            
            for (var j = 1; j < this.map.countries[i].outline.length; j++) {
                pathString += "L " + this.map.countries[i].outline[j].x + " " + this.map.countries[i].outline[j].y;
            }
            
            pathString += " Z";
            country.pathString = pathString;
            
            country.center.x = this.map.countries[i].center.x;
            country.center.y = this.map.countries[i].center.y;
            
            for (var k = 0; k < this.map.countries[i].neighbors.length; k++) {
                var neighborID = this.map.countries[i].neighbors[k].ID;
                country.neighborIDs.push(neighborID);
                
                var connection = (country.ID < neighborID) ? [country.ID, neighborID] : [neighborID, country.ID];
                
                if (clientMap.connections.every(function(item){
                    //console.log(item[0] + ',' + item[1] + ' vs. ' + connection[0] + ',' + connection[1]);
                    return !((item[0] == connection[0]) && (item[1] == connection[1]));
                })) {
                    clientMap.connections.push(connection);
                    console.log('new connection ' + connection + ' found');
                } else
                    console.log('double connection ' + connection + ' found');
            }
            
            clientMap.regions.push(country);
        }
        
        return clientMap;
    }
});