function test()
{
    map.clear();
    var triangles = generateTriangleArray(800, 400, 20);
    var countries = generateMap(triangles, 3);
    console.info('Test finished');
    /*
    for (var i = 0; i < countries.length; i++) {
        // console.log(countries[i].triangles.length);
        drawCountry(countries[i].trianglesInCountry);
    }
    */
}

