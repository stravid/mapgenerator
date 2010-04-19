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

function holeTest()
{
    var triangles = generateTriangleArray(100, 100, 5);
    
    for (var i = 0; i < triangles.length; i++) {
        triangles[i].countryID = 1;
    }
    
    triangles[0].countryID = -1;
    triangles[1].countryID = -1;
    triangles[2].countryID = -1;
    triangles[3].countryID = -1;
    triangles[4].countryID = -1;
    triangles[5].countryID = -1;

    console.log('false = ' + blupp(0, 3, triangles));
    
    for (var i = 0; i < triangles.length; i++) {
        triangles[i].countryID = 1;
    }
    
    triangles[0].countryID = -1;
    triangles[1].countryID = -1;
    triangles[2].countryID = -1;

    console.log('false = ' + blupp(0, 3, triangles));
    
    for (var i = 0; i < triangles.length; i++) {
        triangles[i].countryID = 1;
    }
    
    triangles[0].countryID = -1;
    triangles[1].countryID = -1;

    console.log('true = ' + blupp(0, 3, triangles));
    
    for (var i = 0; i < triangles.length; i++) {
        triangles[i].countryID = -1;
    }

    console.log('false = ' + blupp(0, 3, triangles));
    
    for (var i = 0; i < triangles.length; i++) {
        triangles[i].countryID = 1;
    }
    
    triangles[0].countryID = -1;
    triangles[1].countryID = -1;
    triangles[2].countryID = 1;
    triangles[11].countryID = 2;

    console.log('true = ' + blupp(0, 3, triangles));
    
    for (var i = 0; i < triangles.length; i++) {
        triangles[i].countryID = 1;
    }
    
    triangles[0].countryID = -1;
    triangles[1].countryID = -1;
    triangles[2].countryID = -1;
    triangles[3].countryID = 2;
    triangles[11].countryID = 2;

    console.log('false = ' + blupp(0, 3, triangles));
    
    for (var i = 0; i < triangles.length; i++) {
        triangles[i].countryID = 1;
    }
    
    triangles[3].countryID = 1;
    triangles[12].countryID = 1;
    triangles[14].countryID = 1;
    triangles[15].countryID = 1;
    triangles[16].countryID = 1;
    triangles[17].countryID = 1;
    triangles[5].countryID = 1;

    console.log('true = ' + blupp(13, 3, triangles));
    
    for (var i = 0; i < triangles.length; i++) {
        triangles[i].countryID = 1;
    }
    
    triangles[3].countryID = 1;
    triangles[12].countryID = 1;
    triangles[15].countryID = 1;
    triangles[16].countryID = 1;
    triangles[17].countryID = 1;
    triangles[5].countryID = 1;

    console.log('true = ' + blupp(13, 3, triangles));
    
    for (var i = 0; i < triangles.length; i++) {
        triangles[i].countryID = 1;
    }
    
    triangles[3].countryID = 1;
    triangles[12].countryID = 1;
    triangles[16].countryID = 1;
    triangles[17].countryID = 1;
    triangles[5].countryID = 1;

    console.log('true = ' + blupp(13, 3, triangles));
    
    for (var i = 0; i < triangles.length; i++) {
        triangles[i].countryID = 1;
    }
    
    triangles[3].countryID = 1;
    triangles[12].countryID = 1;
    triangles[17].countryID = 1;
    triangles[5].countryID = 1;

    console.log('false = ' + blupp(13, 3, triangles));
}

//holeTest();

var m = new Map(500, 400, 40);
m.generateHexagonArray();

/*console.log(m.hexagons.map(function(item, index) {
            return item.ID; 
        }));
*/
m.testGenerator(5, 2, 5);
//initMap();


function draw()
{
    for (var i = 0; i < m.countries.length; i++) {
        drawCountry(m.hexagons, m.countries[i].elements);
    }
}
