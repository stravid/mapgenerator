function test(width, height, trianglesPerRow, players)
{
    map.clear();
    var triangles = generateTriangleArray(width, height, trianglesPerRow);
    var countries = generateMap(triangles, players);
    
    
    for (var i = 0; i < countries.length; i++) {
        // console.log(countries[i].triangles.length);
        //drawCountry(countries[i].trianglesInCountry);
    }
    
    console.info('Test finished');
}

function testGetPossibleNeighbors(width, height, trianglesPerRow, ID)
{
    var triangles = generateTriangleArray(width, height, trianglesPerRow);
    var testCountry = new Country();
    
    testCountry.triangleIDs.push(ID);
    testCountry.trianglesInCountry.push(triangles[ID]);
    console.log(getPossibleNeighbors(testCountry, triangles));
}

var m = new Map(500, 250, 50);
m.generateHexagonArray();
m.normalGenerator(3, 0.3, 1);

window.addEvent('domready', function() {
    //m.generateHexagonArray();
    //m.testGenerator(50, 10, 60);
});

function draw()
{
    for (var i = 0; i < m.countries.length; i++) {
        drawCountry(m.hexagons, m.countries[i].elements);
    }
}

function myDraw()
{
    drawLines(m.lines, '#cccccc');
    
    for (var i = 0; i < m.countries[0].hexagons.length; i++) {
        drawLines(m.countries[0].hexagons[i].lines, '#ff0000');
    }
    
    for (var i = 0; i < m.countries[1].hexagons.length; i++) {
        drawLines(m.countries[1].hexagons[i].lines, '#00ff00');
    }
    
    for (var i = 0; i < m.countries[2].hexagons.length; i++) {
        drawLines(m.countries[2].hexagons[i].lines, '#0000ff');
    }
    
}