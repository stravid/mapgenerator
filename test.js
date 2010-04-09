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
    triangles[0].countryID = 1;
    triangles[1].countryID = 1;
    triangles[2].countryID = 1;
    triangles[10].countryID = 1;
    triangles[13].countryID = 1;
    triangles[22].countryID = 1;
    
    console.log(isTriangleInAHole(triangles, 11, 5));
}

holeTest();

