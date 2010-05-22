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
    }
});