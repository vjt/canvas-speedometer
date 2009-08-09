// Original code taken from http://www.thebinaryelevator.com/t/speedometer.html
// Object orientation by vjt@openssl.it - http://sindro.me/
//
function _tbe_get2DContext(elementId)
{
    var elem = document.getElementById(elementId);

    if (elem && elem.getContext)
      return elem.getContext('2d');

    return null;
}

var TheWidth = 300, TheHeight = 300;
var width = TheWidth, height = TheHeight;
var x = 15, y = 15;
var dialColor = 'Gray';

function getRadian (theta)
{
    return theta * Math.PI / 180.0;
}

function boxedArc (context, x, y, w, h, sa, sweepa)
{
    context.save ();
    context.scale (w / h, h / w);
    context.arc (x+w/2, y+h/2, w/2, getRadian (sa), getRadian (sa + sweepa), false);
    context.restore ();
}

var fromAngle = 135.0;
var toAngle = 405.0;
var threshold = 40.0;
var noOfDivisions = 10;
var noOfSubDivisions = 3;
var glossinessAlpha = 25 / 255.0;
var curValue = 0.0;
var minValue = 0.0;
var maxValue = 100.0;

function drawCalibration (context, cx, cy)
{
    var noOfParts = noOfDivisions + 1;
    var noOfIntermediates = noOfSubDivisions;
    var currentAngle = getRadian (fromAngle);
    var gap = (TheWidth * 0.021);
    var shift = TheWidth / 25;

    var radius = (TheWidth - gap) / 2 - gap * 5;
    var totalAngle = toAngle - fromAngle;
    var incr = getRadian (totalAngle / ( (noOfParts - 1) * (noOfIntermediates + 1)));

    var rulerValue = 0.0; // min
    for (i = 0; i <= noOfParts; i++)
    {
        // Draw Thick Line
        var x0 = (cx + radius * Math.cos (currentAngle));
        var y0 = (cy + radius * Math.sin (currentAngle));
        var x1 = (cx + (radius - TheWidth/20) * Math.cos (currentAngle));
        var y1 = (cy + (radius - TheHeight/20) * Math.sin (currentAngle));

        context.strokeStyle = 'black';
        context.lineWidth = TheWidth/50;
        context.beginPath ();
        context.moveTo (x0, y0);
        context.lineTo (x1, y1);
        context.stroke ();

        // Draw Strings
        tx = cx + (radius - TheWidth / 10) * Math.cos (currentAngle);
        ty = cy + gap / 2 + (radius - TheHeight / 10) * Math.sin (currentAngle);

        context.fillStyle = 'Black';
        context.textAlign = 'center';
        context.font = Math.round (TheWidth / 23) + 'pt Sans-Serif';
        context.fillText (rulerValue, tx, ty);

        rulerValue = Math.round (rulerValue + ((maxValue - minValue) / (noOfParts - 1)));

        if (i == noOfParts - 1)
          break;

        for (j = 0; j <= noOfIntermediates; j++)
        {
            // Draw thin lines
            currentAngle += incr;

            var x0 = (cx + radius * Math.cos (currentAngle));
            var y0 = (cy + radius * Math.sin (currentAngle));
            var x1 = (cx + (radius - TheWidth/50) * Math.cos (currentAngle));
            var y1 = (cy + (radius - TheHeight/50) * Math.sin (currentAngle));

            context.strokeStyle = 'black';
            context.lineWidth = TheWidth/100;
            context.beginPath ();
            context.moveTo (x0, y0);
            context.lineTo (x1, y1);
            context.stroke ();
        }
    }
}

function drawGloss (context)
{
    var rX = width * 0.15;
    var rY = y + height * 0.07;
    var rW = width * 0.70;
    var rH = height * 0.65;

    var g1 = context.createLinearGradient (0, 0, 0, rY+rH);
    g1.addColorStop (0, 'rgba(255,255,255,1.0)');
    g1.addColorStop (1, 'rgba(255,255,255, 0.0)');

    context.fillStyle = g1;
    context.fillEllipse (rX, rY, rW, rH);

    rX = width * 0.30;
    rY = y + height * 0.70;
    rW = width * 0.40;
    rH = height * 0.15;

    var g2 = context.createLinearGradient (0, rY, 0, rY + rH);
    g2.addColorStop (0, 'rgba(255,255,255,0.0)');
    g2.addColorStop (0.25, 'rgba(255,255,255,0.0)');
    g2.addColorStop (1, 'rgba(255,255,255,1.0)');

    context.fillStyle = g2;
    context.fillEllipse (rX, rY, rW, rH);
}

function drawCenter(context, cx, cy)
{
    var shift = TheWidth / 5;

    var rX = cx - (shift / 2);
    var rY = cy - (shift / 2);
    var rW = shift;
    var rH = shift;

    var g1 = context.createLinearGradient (0, rY, 0, rY + rH);
    g1.addColorStop (0, 'rgba(0,0,0,1.0)');
    g1.addColorStop (0.5, 'rgba(0,0,0,1.0)');
    g1.addColorStop (1, dialColor);

    context.fillStyle = g1;
    context.fillEllipse (rX, rY, rW, rH);

    shift = TheWidth / 7;

    rX = cx - (shift / 2);
    rY = cy - (shift / 2);
    rW = shift;
    rH = shift;

    var g2 = context.createLinearGradient (rX, rY, rW + rX, rY + rH);
    g2.addColorStop (0, 'SlateGray');
    g2.addColorStop (1, 'Black');

    context.fillStyle = g2;
    context.fillEllipse (rX, rY, rW, rH);
}

function drawHand (context, cx, cy)
{
   var radius = TheWidth / 2 - (TheWidth * 0.12);
   var val = maxValue - minValue;

   val = (maxValue * (curValue - minValue)) / val; 
   val = ((toAngle - fromAngle) * val) / 100;
   val += fromAngle;

   var angle = getRadian (val);
   var gradientAngle = angle;

   // Fill Polygon
   var pts = new Array(5 * 2);

   pts[0*2+0] = cx + radius * Math.cos (angle);
   pts[0*2+1] = cy + radius * Math.sin (angle);

   pts[4*2+0] = cx + radius * Math.cos (angle - 0.02);
   pts[4*2+1] = cy + radius * Math.sin (angle - 0.02);

   angle = getRadian (val + 20);
   pts[1*2+0] = cx + (TheWidth * 0.09) * Math.cos (angle);
   pts[1*2+1] = cy + (TheHeight * 0.09) * Math.sin (angle);

   pts[2*2+0] = cx;
   pts[2*2+1] = cy;

   angle = getRadian (val - 20);
   pts[3*2+0] = cx + (TheWidth * 0.09) * Math.cos (angle);
   pts[3*2+1] = cy + (TheHeight * 0.09) * Math.sin (angle);

   context.fillStyle = 'black';
   context.fillPolygon (pts);

   // Draw Shine
   pts = new Array (3 * 2);

   angle = getRadian (val);
   pts[0*2+0] = cx + radius * Math.cos (angle);
   pts[0*2+1] = cy + radius * Math.sin (angle);

   angle = getRadian (val + 20);
   pts[1*2+0] = cx + (TheWidth * 0.09) * Math.cos (angle);
   pts[1*2+1] = cy + (TheHeight * 0.09) * Math.sin (angle);

   pts[2*2+0] = cx;
   pts[2*2+1] = cy;

   var g1 = context.createLinearGradient (0, 0, cx, cy);
   g1.addColorStop (0, 'SlateGray');
   g1.addColorStop (1, 'Black');

   context.fillStyle = g1;
   context.fillPolygon (pts);
}

function drawBackground (context, x, y, w, h)
{
    // Draw background color
    context.fillStyle = dialColor;
    context.ellipse (x, y, w, h);
    context.globalAlpha = 120.0 / 255.0;
    context.fill ();

    // Draw Rim
    context.strokeStyle = 'SlateGray';
    context.lineWidth = w * 0.03;
    context.ellipse (x, y, w, h);
    context.globalAlpha = 1.0;
    context.stroke ();

    drawCalibration (context, (w / 2) + x, (h / 2) + y);

    // Draw Colored Rim
    context.strokeStyle = 'Gainsboro';
    context.lineWidth = TheWidth / 40;
    var gap = TheWidth * 0.03;

    context.beginPath();
    boxedArc (context, x + gap, y + gap, w - gap * 2, h - gap * 2, 135, 270);
    context.stroke();

    // Draw Threshold
    context.strokeStyle = 'LawnGreen';
    context.lineWidth = TheWidth / 50;
    // context.globalAlpha = 200.0 / 255.0;
    var val = maxValue - minValue
    val = (maxValue * (35.0 - minValue)) / val; // recommendval - min
    val = ((toAngle - fromAngle) * val) / 100;
    val += fromAngle;
    var stAngle = val - ((270 * threshold) / 200);
    if (stAngle <= 135) stAngle = 135;
    var sweepAngle = ((270 * threshold) / 100);
    if (stAngle + sweepAngle > 405) sweepAngle = 405 - stAngle;

    context.beginPath();
    boxedArc (context, x + gap, y + gap, w - gap * 2, h - gap * 2, stAngle, sweepAngle);
    context.stroke ();
}

function offsetPolygon (x, y, points)
{
    var npoints = points.length;
    if (npoints & 1) npoints--;
    var result = new Array ();
    for (var n = 0; n < npoints / 2; n++)
    {
        result[n*2+0] = x + points[n*2+0];
        result[n*2+1] = y + points[n*2+1];
    }
    return result;
}
        

function drawSingleDigit (context, segs, bits, x, y)
{
    for (var n = 0; n < 7; n++)
    {
        if (bits & (1 << n))
          context.fillPolygon (offsetPolygon (x, y, segs[n]));
    }
}

var DigitsSegments = [ 
  1 | 2 | 4 | 8 | 16 | 32,
  2 | 4,
  1 | 2 | 8 | 16 | 64,
  1 | 2 | 4 | 8 | 64,
  2 | 4 | 32 | 64,
  1 | 4 | 8 | 32 | 64,
  1 | 4 | 8 | 16 | 32 | 64,
  1 | 2 | 4,
  1 | 2 | 4 | 8 | 16 | 32 | 64,
  1 | 2 | 4 | 8 | 32 | 64,
];

function drawNumber (context, value, x, y, len, height)
{
    var segs = createSegments (height);
    var fixv = Math.round (value);
    var decv = (value - fixv) * 100;

    context.fillStyle = dialColor;
    context.globalAlpha = 40.0 / 255.0;

    var shift = 0, incr = 15 * TheWidth / 250;
    for (var n = 0; n < len; n++)
    {
        drawSingleDigit (context, segs, 127, x + shift, y);
        shift += incr;
    }

    shift -= incr;
    context.fillStyle = 'Gray';
    context.globalAlpha = 210.0/255.0;
    for (var n = 0; n < len; n++)
    {
        drawSingleDigit (context, segs, DigitsSegments[(fixv % 10)], x + shift, y);
        fixv = Math.floor (fixv / 10.0);
        shift -= incr;
        // Perform the check here so we output a 0
        if (fixv == 0)
          break;
    }
}

function doDraw ()
{
    var bgContext = _tbe_get2DContext ('speedometer_bg');
    var handContext = _tbe_get2DContext ('speedometer_hand');
    var digitContext = _tbe_get2DContext ('speedometer_digit');
    var fgContext = _tbe_get2DContext ('speedometer_fg');
    if (bgContext && handContext && fgContext)
    {
        var w = width - x * 2;
        var h = height - y * 2;

        drawBackground (bgContext, x, y, w, h);
        drawHand (handContext, (w / 2) + x, (h / 2) + y);
        drawCenter (fgContext, (w / 2) + x, (h / 2) + y);
        drawGloss (fgContext);
        drawNumber (digitContext, curValue, (TheWidth / 2) - w / 8, h / 1.2, 3, TheWidth / 9);
    }
}

function updateHand ()
{
    var handContext = _tbe_get2DContext ('speedometer_hand');
    var digitContext = _tbe_get2DContext ('speedometer_digit');
    if (handContext && digitContext)
    {
        var w = width - x * 2;
        var h = height - y * 2;

        document.getElementById('speedometer_hand').setAttribute ('width', TheWidth); // clear the canvas
        document.getElementById('speedometer_digit').setAttribute ('width', TheWidth); // clear the canvas
        drawHand (handContext, (w / 2) + x, (h / 2) + y);
        drawNumber (digitContext, curValue, (TheWidth / 2) - w / 8, h / 1.2, 3, TheWidth / 9);
    }
}

function createSegments (height)
{
    var width = 10 * height / 13;
    var _x = function (xx) { return xx * width / 12; }
    var _y = function (yy) { return yy * height / 15; }
    var segments = 
    [ // Upper -
      [
        _x (2.8),  _y (1.0),
        _x (10.0), _y (1.0),
        _x (8.8),  _y (2.0),
        _x (3.8),  _y (2.0),
        _x (2.8),  _y (1.0)
      ],
      // Right Upper |
      [
        _x (10.0), _y (1.4),
        _x (9.3),  _y (6.8),
        _x (8.4),  _y (6.4),
        _x (9.0),  _y (2.2),
        _x (10.0), _y (1.4)
      ],
      // Right Lower |
      [
        _x (9.2),  _y (7.2),
        _x (8.7),  _y (12.7),
        _x (7.6),  _y (11.9),
        _x (8.2),  _y (7.7),
        _x (9.2),  _y (7.2)
      ],
      // Lower - 
      [
        _x (7.4), _y (12.1),
        _x (8.4), _y (13.0),
        _x (1.3), _y (13.0),
        _x (2.2), _y (12.1),
        _x (7.4), _y (12.1)
      ],
      // Left Lower -
      [
        _x (2.2), _y (11.8),
        _x (1.0), _y (12.7),
        _x (1.7), _y (7.2),
        _x (2.8), _y (7.7),
        _x (2.2), _y (11.8)
      ],
      // Left Upper -
      [
        _x (3.0), _y (6.4),
        _x (1.8), _y (6.8),
        _x (2.6), _y (1.3),
        _x (3.6), _y (2.2),
        _x (3.0), _y (6.4)
      ],
      // Middle -
      [
        _x (2.0), _y (7.0),
        _x (3.1), _y (6.5),
        _x (8.3), _y (6.5),
        _x (9.0), _y (7.0),
        _x (8.2), _y (7.5),
        _x (2.9), _y (7.5),
        _x (2.0), _y (7.0)
      ]
    ];

    return segments;
}

var updateDir = 1;

function doUpdate ()
{
    var incr = 0.05;
    if (updateDir > 0)
    {
        curValue += incr;
        if (curValue > maxValue)
        {
          curValue = maxValue;
          updateDir = -1;
          return;
        }
    }
    else if (updateDir < 0)
    {
        curValue -= incr;
        if (curValue < 0)
        {
            curValue = 0;
            updateDir = 1;
            return;
        }
    }

    updateHand ();
}

function timedUpdate ()
{
    for (var n = 0; n < 20; n++)
      doUpdate ();

    setTimeout ('timedUpdate()', 20);
}

window.onload = function() {
  doDraw ();
  timedUpdate ();
};
