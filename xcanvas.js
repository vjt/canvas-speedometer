(function(){
// Andrea Giammarchi - Mit Style License
var extend = {
    // Circle methods
    circle:function(aX, aY, aDiameter){
        this.ellipse(aX, aY, aDiameter, aDiameter);
    },
    fillCircle:function(aX, aY, aDiameter){
        this.beginPath();
        this.circle(aX, aY, aDiameter);
        this.fill();
    },
    strokeCircle:function(aX, aY, aDiameter){
        this.beginPath();
        this.circle(aX, aY, aDiameter);
        this.stroke();
    },
    // Ellipse methods
    ellipse:function(aX, aY, aWidth, aHeight){
        var hB = (aWidth / 2) * .5522848,
            vB = (aHeight / 2) * .5522848,
            eX = aX + aWidth,
            eY = aY + aHeight,
            mX = aX + aWidth / 2,
            mY = aY + aHeight / 2;
        this.moveTo(aX, mY);
        this.bezierCurveTo(aX, mY - vB, mX - hB, aY, mX, aY);
        this.bezierCurveTo(mX + hB, aY, eX, mY - vB, eX, mY);
        this.bezierCurveTo(eX, mY + vB, mX + hB, eY, mX, eY);
        this.bezierCurveTo(mX - hB, eY, aX, mY + vB, aX, mY);
        this.closePath();
    },
    fillEllipse:function(aX, aY, aWidth, aHeight){
        this.beginPath();
        this.ellipse(aX, aY, aWidth, aHeight);
        this.fill();
    },
    strokeEllipse:function(aX, aY, aWidth, aHeight){
        this.beginPath();
        this.ellipse(aX, aY, aWidth, aHeight);
        this.stroke();
    },
    polygon:function(pts) {
        var npts = pts.length;
        if (npts & 1) npts--;
        npts /= 2;
        if (npts <= 1)
          return;

        this.moveTo (pts[0], pts[1]);
        for (var n = 1; n < npts; n++)
          this.lineTo (pts[n*2+0], pts[n*2+1]);
    },
    fillPolygon:function(pts) {
        this.beginPath ();
        this.polygon (pts);
        this.fill ();
    },
    strokePolygon:function(pts) {
        this.beginPath ();
        this.polygon (pts);
        this.stroke ();
    }
};
for(var key in extend)
    CanvasRenderingContext2D.prototype[key] = extend[key];
if(!this.G_vmlCanvasManager)
    G_vmlCanvasManager = {init:function(){}, initElement:function(el){return el}};
})();
