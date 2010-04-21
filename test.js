var m = new Map(1200, 600, 20);
m.generateHexagonArray();
m.normalGenerator(50, 0.1, 1);

for (var i = 0; i < m.countries.length; i++)
    m.countries[i].generateOutline();
    
m.deleteCountryHoles();
    
for (var i = 0; i < m.countries.length; i++)
    m.countries[i].getCenter();
    
m.getCountryNeighbors();

window.addEvent('domready', function() {
    //m.generateHexagonArray();
    //m.testGenerator(50, 10, 60);
});

function draw(number)
{
    drawCountry(m.countries[number].outline, m.countries[number].center);
}

function myDraw()
{
    //drawLines(m.lines, '#cccccc');
    
    for (var i = 0; i < m.countries.length; i++) {
        drawCountry(m.countries[i].outline, m.countries[i].center);
    }
    
}
