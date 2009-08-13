// Original code taken from http://www.thebinaryelevator.com/t/speedometer.html
// Object orientation by vjt@openssl.it - http://sindro.me/
//

function Speedometer() {
  var options = arguments[0] || {};

  var Size = options.size || options.width || 300;

  var x = options.x || 15;
  var y = options.y || 15;

  var dialColor = options.dialColor || 'Gray';

  var bgContext = TBE.GetElement2DContextById ('speedometer_bg');
  var handContext = TBE.GetElement2DContextById ('speedometer_hand');
  var fgContext = TBE.GetElement2DContextById ('speedometer_fg');

  var digitalDisplay = new DigitalDisplay ({
    element: 'speedometer_digit',
    dialColor: dialColor,
    width: Size
  });

  this.curValue = options.value || 0.0;
  this.minValue = options.min   || 0.0;
  this.maxValue = options.max   || 100.0;

  this.draw = function ()
  {
    if (bgContext && handContext && fgContext)
    {
      var w = Size - x * 2;
      var h = Size - y * 2;

      this.drawBackground (x, y, w, h);
      this.drawHand ((w / 2) + x, (h / 2) + y);
      this.drawCenter ((w / 2) + x, (h / 2) + y);
      this.drawGloss ();

      digitalDisplay.drawNumber (this.curValue, (Size / 2) - w / 8, h / 1.2, 3, Size / 9);
    }
  }

  this.updateHand = function ()
  {
    if (handContext && digitalDisplay)
    {
      var w = Size - x * 2;
      var h = Size - y * 2;

      TBE.ClearCanvas('speedometer_hand');

      digitalDisplay.clear();

      this.drawHand ((w / 2) + x, (h / 2) + y);

      digitalDisplay.drawNumber (this.curValue, (Size / 2) - w / 8, h / 1.2, 3, Size / 9);
    }
  }

  var updateDir = 1;
  this.update = function ()
  {
    var incr = arguments[0] || 0.05;
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
    var currentAngle = TBE.Deg2Rad (fromAngle);
    var gap = (Size * 0.021);
    var shift = Size / 25;

    var radius = (Size - gap) / 2 - gap * 5;
    var totalAngle = toAngle - fromAngle;
    var incr = TBE.Deg2Rad (totalAngle / ( (noOfParts - 1) * (noOfIntermediates + 1)));

    var rulerValue = 0.0; // min
    for (i = 0; i <= noOfParts; i++)
    {
      // Draw Thick Line
      var x0 = (cx + radius * Math.cos (currentAngle));
      var y0 = (cy + radius * Math.sin (currentAngle));
      var x1 = (cx + (radius - Size / 20) * Math.cos (currentAngle));
      var y1 = (cy + (radius - Size / 20) * Math.sin (currentAngle));

      context.strokeStyle = 'black';
      context.lineWidth = Size / 50;
      context.beginPath ();
      context.moveTo (x0, y0);
      context.lineTo (x1, y1);
      context.stroke ();

      // Draw Strings
      tx = cx + (radius - Size / 10) * Math.cos (currentAngle);
      ty = cy + gap / 2 + (radius - Size / 10) * Math.sin (currentAngle);

      context.fillStyle = 'Black';
      context.textAlign = 'center';

      context.font = Math.round (Size / 23) + 'pt Sans-Serif';
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
        var x1 = (cx + (radius - Size / 50) * Math.cos (currentAngle));
        var y1 = (cy + (radius - Size / 50) * Math.sin (currentAngle));

        context.strokeStyle = 'black';
        context.lineWidth = Size / 100;
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

    var rX = Size * 0.15;
    var rY = y + Size * 0.07;
    var rW = Size * 0.70;
    var rH = Size * 0.65;

    var g1 = context.createLinearGradient (0, 0, 0, rY+rH);
    g1.addColorStop (0, 'rgba(255,255,255,1.0)');
    g1.addColorStop (1, 'rgba(255,255,255, 0.0)');

    context.fillStyle = g1;
    context.fillEllipse (rX, rY, rW, rH);

    rX = Size * 0.30;
    rY = y + Size * 0.70;
    rW = Size * 0.40;
    rH = Size * 0.15;

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

    var shift = Size / 5;

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

    shift = Size / 7;

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

    var radius = Size / 2 - (Size * 0.12);
    var val = this.maxValue - this.minValue;

    val = (this.maxValue * (this.curValue - this.minValue)) / val;
    val = ((toAngle - fromAngle) * val) / 100;
    val += fromAngle;

    var angle = TBE.Deg2Rad (val);
    var gradientAngle = angle;

    // Fill Polygon
    var pts = new Array(5 * 2);

    pts[0*2+0] = cx + radius * Math.cos (angle);
    pts[0*2+1] = cy + radius * Math.sin (angle);

    pts[4*2+0] = cx + radius * Math.cos (angle - 0.02);
    pts[4*2+1] = cy + radius * Math.sin (angle - 0.02);

    angle = TBE.Deg2Rad (val + 20);
    pts[1*2+0] = cx + (Size * 0.09) * Math.cos (angle);
    pts[1*2+1] = cy + (Size * 0.09) * Math.sin (angle);

    pts[2*2+0] = cx;
    pts[2*2+1] = cy;

    angle = TBE.Deg2Rad (val - 20);
    pts[3*2+0] = cx + (Size * 0.09) * Math.cos (angle);
    pts[3*2+1] = cy + (Size * 0.09) * Math.sin (angle);

    context.fillStyle = 'black';
    context.fillPolygon (pts);

    // Draw Shine
    pts = new Array (3 * 2);

    angle = TBE.Deg2Rad (val);
    pts[0*2+0] = cx + radius * Math.cos (angle);
    pts[0*2+1] = cy + radius * Math.sin (angle);

    angle = TBE.Deg2Rad (val + 20);
    pts[1*2+0] = cx + (Size * 0.09) * Math.cos (angle);
    pts[1*2+1] = cy + (Size * 0.09) * Math.sin (angle);

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
    context.lineWidth = Size / 40;
    var gap = Size * 0.03;

    context.strokeBoxedArc (x + gap, y + gap, w - gap * 2, h - gap * 2,
                            TBE.Deg2Rad (135), TBE.Deg2Rad (270),
                            /* counterclockwise = */ false);

    // Draw Threshold
    context.strokeStyle = 'LawnGreen';
    context.lineWidth = Size / 50;
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

    context.strokeBoxedArc (x + gap, y + gap, w - gap * 2, h - gap * 2,
                            TBE.Deg2Rad (stAngle), TBE.Deg2Rad (sweepAngle),
                            /* counterclockwise = */ false);
  }
};
// End of class
