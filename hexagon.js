function Hexagon(lineA, lineB, lineC, lineD, lineE, lineF) {
    this.used = false;
    this.lines = new Array();
    this.outline = new Array();
    this.neighbors = new Array();
    
    this.lines.push(lineA);
    this.lines.push(lineB);
    this.lines.push(lineC);
    this.lines.push(lineD);
    this.lines.push(lineE);
    this.lines.push(lineF);
};