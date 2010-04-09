var map;

function toHex(dec) {
    // create list of hex characters
    var hexCharacters = "0123456789ABCDEF"
    // if number is out of range return limit
    if (dec < 0)
        return "00"
    if (dec > 255)
        return "FF"

    // decimal equivalent of first hex character in converted number
    var i = Math.floor(dec / 16)
    // decimal equivalent of second hex character in converted number
    var j = dec % 16
    // return hexadecimal equivalent
    return hexCharacters.charAt(i) + hexCharacters.charAt(j)
}


function initMap()
{
    map = Raphael("map", 1000, 500);
}

function drawCountry(hexagons, hexagonIDs)  //(country)
{
    // map.clear();#
    
    var color = "#"+toHex(rand(0,255));
    color += toHex(rand(0,255));
    color += toHex(rand(0,255));
    
    for (var i = 0; i < hexagonIDs.length; i++) {
        
        var line = "M " + hexagons[hexagonIDs[i]].elements[0].x + " " + hexagons[hexagonIDs[i]].elements[0].y;
        line += "L " + hexagons[hexagonIDs[i]].elements[1].x + " " + hexagons[hexagonIDs[i]].elements[1].y;
        line += "L " + hexagons[hexagonIDs[i]].elements[2].x + " " + hexagons[hexagonIDs[i]].elements[2].y;
        line += "L " + hexagons[hexagonIDs[i]].elements[3].x + " " + hexagons[hexagonIDs[i]].elements[3].y;
        line += "L " + hexagons[hexagonIDs[i]].elements[4].x + " " + hexagons[hexagonIDs[i]].elements[4].y;
        line += "L " + hexagons[hexagonIDs[i]].elements[5].x + " " + hexagons[hexagonIDs[i]].elements[5].y + " Z";
        
        line = map.path(line);
        line.attr("stroke", color);
        line.attr("fill", color);
    }
}


function drawCountryInColor(hexagons, color)  //(country)
{
    // map.clear();#
    
    for (var i = 0; i < hexagons.length; i++) {
        
        var line = "M " + hexagons[i].elements[0].x + " " + hexagons[i].elements[0].y;
        line += "L " + hexagons[i].elements[1].x + " " + hexagons[i].elements[1].y;
        line += "L " + hexagons[i].elements[2].x + " " + hexagons[i].elements[2].y;
        line += "L " + hexagons[i].elements[3].x + " " + hexagons[i].elements[3].y;
        line += "L " + hexagons[i].elements[4].x + " " + hexagons[i].elements[4].y;
        line += "L " + hexagons[i].elements[5].x + " " + hexagons[i].elements[5].y + " Z";
        
        line = map.path(line);
        line.attr("fill", color);
    }
}

