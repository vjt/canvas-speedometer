// Original code taken from http://www.thebinaryelevator.com/t/speedometer.html
// Object orientation by vjt@openssl.it - http://sindro.me/
//

function Speedometer() {
  var options = arguments[0] || {};

  var TheWidth = options.width || 300, TheHeight = options.height || 300;

  var x = options.x || 15;
  var y = options.y || 15;

  var width = TheWidth;
  var height = TheHeight;

  var dialColor = options.dialColor || 'Gray';

  var bgContext = _tbe_get2DContext ('speedometer_bg');
  var handContext = _tbe_get2DContext ('speedometer_hand');
  var digitContext = _tbe_get2DContext ('speedometer_digit');
  var fgContext = _tbe_get2DContext ('speedometer_fg');

  this.curValue = options.value || 0.0;
  this.minValue = options.min   || 0.0;
  this.maxValue = options.max   || 100.0;

  this.draw = function ()
  {
    if (bgContext && handContext && fgContext)
    {
      var w = width - x * 2;
      var h = height - y * 2;

      this.drawBackground (x, y, w, h);
      this.drawHand ((w / 2) + x, (h / 2) + y);
      this.drawCenter ((w / 2) + x, (h / 2) + y);
      this.drawGloss ();
      this.drawNumber (this.curValue, (TheWidth / 2) - w / 8, h / 1.2, 3, TheWidth / 9);
    }
  }

  this.updateHand = function ()
  {
    if (handContext && digitContext)
    {
      var w = width - x * 2;
      var h = height - y * 2;

      _tbe_clearCanvas('speedometer_hand');
      _tbe_clearCanvas('speedometer_digit');

      this.drawHand ((w / 2) + x, (h / 2) + y);
      this.drawNumber (this.curValue, (TheWidth / 2) - w / 8, h / 1.2, 3, TheWidth / 9);
    }
  }

  var updateDir = 1;
  this.update = function ()
  {
    var incr = 0.05;
    if (updateDir > 0)
    {
      this.curValue += incr;
      if (this.curValue > this.maxValue)
      {
        this.curValue = this.maxValue;
        updateDir = -1;
        return;
      }
    }
    else if (updateDir < 0)
    {
      this.curValue -= incr;
      if (this.curValue < 0)
      {
        this.curValue = 0;
        updateDir = 1;
        return;
      }
    }

    this.updateHand ();
  }

  //////////////////////
  // Private functions
  //

  // Get a Canvas context, passing an element ID
  //
  function _tbe_get2DContext(elementId)
  {
    var elem = document.getElementById(elementId);

    if (elem && elem.getContext)
      return elem.getContext('2d');

    return null;
  }

  // Clear a canvas, per w3c specification
  //
  function _tbe_clearCanvas(elementId)
  {
    document.getElementById(elementId).setAttribute ('width', TheWidth);
  }

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

  this.drawCalibration = function (cx, cy)
  {
    var context = bgContext;

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
      context.textAlignment = 'center';
      context.fillText (rulerValue, tx, ty);

      rulerValue = Math.round (rulerValue + ((this.maxValue - this.minValue) / (noOfParts - 1)));

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

  this.drawGloss = function ()
  {
    var context = fgContext;

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

  this.drawCenter = function (cx, cy)
  {
    var context = fgContext;

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

  this.drawHand = function (cx, cy)
  {
    var context = handContext;

    var radius = TheWidth / 2 - (TheWidth * 0.12);
    var val = this.maxValue - this.minValue;

    val = (this.maxValue * (this.curValue - this.minValue)) / val;
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

  this.drawBackground = function (x, y, w, h)
  {
    var context = bgContext;

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

    this.drawCalibration ((w / 2) + x, (h / 2) + y);

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

    var val = this.maxValue - this.minValue
    val = (this.maxValue * (35.0 - this.minValue)) / val; // recommendval - min
    val = ((toAngle - fromAngle) * val) / 100;
    val += fromAngle;
    var stAngle = val - ((270 * threshold) / 200);
    if (stAngle <= 135)
      stAngle = 135;
    var sweepAngle = ((270 * threshold) / 100);
    if (stAngle + sweepAngle > 405)
      sweepAngle = 405 - stAngle;

    context.beginPath();
    boxedArc (context, x + gap, y + gap, w - gap * 2, h - gap * 2, stAngle, sweepAngle);
    context.stroke ();
  }

  function offsetPolygon (x, y, points)
  {
    var npoints = points.length;
    if (npoints & 1)
      npoints--;
    var result = new Array ();
    for (var n = 0; n < npoints / 2; n++)
    {
      result[n*2+0] = x + points[n*2+0];
      result[n*2+1] = y + points[n*2+1];
    }
    return result;
  }


  // Digits functions
  //
  this.drawSingleDigit = function (segs, bits, x, y)
  {
    for (var n = 0; n < 7; n++)
    {
      if (bits & (1 << n))
      digitContext.fillPolygon (offsetPolygon (x, y, segs[n]));
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

  this.drawNumber = function (value, x, y, len, height)
  {
    var context = digitContext;

    var segs = createSegments (height);
    var fixv = Math.round (value);
    var decv = (value - fixv) * 100;

    context.fillStyle = dialColor;
    context.globalAlpha = 40.0 / 255.0;

    var shift = 0, incr = 15 * TheWidth / 250;
    for (var n = 0; n < len; n++)
    {
      this.drawSingleDigit (segs, 127, x + shift, y);
      shift += incr;
    }

    shift -= incr;
    context.fillStyle = 'Gray';
    context.globalAlpha = 210.0/255.0;
    for (var n = 0; n < len; n++)
    {
      this.drawSingleDigit (segs, DigitsSegments[(fixv % 10)], x + shift, y);
      fixv = Math.floor (fixv / 10.0);
      shift -= incr;
      // Perform the check here so we output a 0
      if (fixv == 0)
      break;
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
};
// End of class

function timedUpdate ()
{
  for (var n = 0; n < 20; n++)
    speedometer.update ();

  setTimeout ('timedUpdate()', 20);
}

var speedometer;
window.onload = function() {
  speedometer = new Speedometer ();
  speedometer.draw ();

  timedUpdate ();
};
