// Original code shared in the public domain on the 'net by <anonymous>
// Further work by vjt@openssl.it - http://sindro.me/
//
// Project home page: http://github.com/vjt/canvas-speedometer
//
function Speedometer() {
  var options = arguments[0] || {};

  var Container = document.getElementById(
    options.element || 'speedometer'
  );

  if (!Container) throw ('No container found!'); // XXX

  // Container CSS inspection to get computed size
  var ContainerStyle = TBE.GetElementComputedStyle (Container);
  var Size = Math.min (
    parseInt (ContainerStyle.width),
    parseInt (ContainerStyle.height)
  );

  if (!Size) throw ('Cannot get container dimensions!');

  var x = Size * 0.05;
  var y = Size * 0.05;

  // Theming
  var theme = Speedometer.themes[options.theme] || Speedometer.themes.default;

  if (!Speedometer.themes.default)
    throw ('Default theme missing! Please load themes/default.js');

  for (key in Speedometer.themes.default)
    if (theme[key] == undefined)
      theme[key] = Speedometer.themes.default[key];

  var Color = {
    dial  : theme.dial,
    rim   : theme.rim,
    rimArc: theme.rimArc,
    thresh: theme.thresh,
    center: theme.center,
    nose  : theme.nose,
    hand  : {
      main   : theme.hand,
      shine  : theme.handShine,
      shineTo: theme.handShineTo,
    },
    calib : {
      ticks  : theme.ticks,
      marks  : theme.marks,
      strings: theme.strings,
      font   : theme.font
    },
    digits: theme.digits
  };

  var MinValue = options.min   || 0.0;
  var MaxValue = options.max   || 100.0;
  var CurValue = options.value || 0.0;

  var Canvas = {
    background: TBE.CreateSquareCanvasElement (Size),
    foreground: TBE.CreateSquareCanvasElement (Size),
    hand      : TBE.CreateSquareCanvasElement (Size),
    digits    : TBE.CreateSquareCanvasElement (Size)
  };

  var Context = {
    background: TBE.GetElement2DContext (Canvas.background),
    foreground: TBE.GetElement2DContext (Canvas.foreground),
    hand      : TBE.GetElement2DContext (Canvas.hand)
  };

  var Display = new DigitalDisplay ({
    element: Canvas.digits,
    placeholders: Color.dial,
    digits: Color.digits,
    width: Size
  });

  // Now append the canvases into the given container
  //
  Container.appendChild (Canvas.background);
  Container.appendChild (Canvas.digits);
  Container.appendChild (Canvas.hand);
  Container.appendChild (Canvas.foreground);

  //
  // Initialization done!

  // Draw everything (still to be refactored)
  //
  this.draw = function ()
  {
    if (Context.background && Context.foreground && Context.hand)
    {
      var w = Size - x * 2;
      var h = Size - y * 2;

      this.drawBackground (x, y, w, h);
      this.drawHand ((w / 2) + x, (h / 2) + y);
      this.drawCenter ((w / 2) + x, (h / 2) + y);
      this.drawGloss ();

      Display.drawNumber (CurValue, (Size / 2) - w / 8, h / 1.2, 3, Size / 9);
    }
  }

  this.update = function (value)
  {
    if (value > MaxValue || value < MinValue)
      return false;

    CurValue = value;

    if (Context.hand)
    {
      var w = Size - x * 2;
      var h = Size - y * 2;

      TBE.ClearCanvas (Canvas.hand);
      this.drawHand ((w / 2) + x, (h / 2) + y);
    }

    if (Display)
    {
      Display.clear ();
      Display.drawNumber (CurValue, (Size / 2) - w / 8, h / 1.2, 3, Size / 9);
    }

    return true;
  }

  /* XXX TODO
  var step, FPS = 30;
  this.animatedUpdate = function (value, time)
  {
    if (value < MinValue || value > MaxValue || value == CurValue ||  time <= 0.0)
      return false;

    step = Math.abs (value - CurValue) / FPS
  }
  */

  this.value = function ()
  {
    return CurValue;
  }

  this.min = function ()
  {
    return MinValue;
  }

  this.max = function ()
  {
    return MaxValue;
  }

  var fromAngle = 135.0;
  var toAngle = 405.0;
  var threshold = 40.0;
  var noOfDivisions = 10;
  var noOfSubDivisions = 3;
  var glossinessAlpha = 25 / 255.0;

  this.drawCalibration = function (cx, cy)
  {
    var context = Context.background;

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

      context.strokeStyle = Color.calib.ticks;
      context.lineWidth = Size / 50;
      context.beginPath ();
      context.moveTo (x0, y0);
      context.lineTo (x1, y1);
      context.stroke ();

      // Draw Strings
      tx = cx + (radius - Size / 10) * Math.cos (currentAngle);
      ty = cy + gap / 2 + (radius - Size / 10) * Math.sin (currentAngle);

      context.fillStyle = Color.calib.strings;
      context.textAlign = 'center';

      context.font = Math.round (Size / 23) + 'pt ' + Color.calib.font;
      context.textAlignment = 'center';
      context.fillText (rulerValue, tx, ty);

      rulerValue = Math.round (rulerValue + ((MaxValue - MinValue) / (noOfParts - 1)));

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

        context.strokeStyle = Color.calib.marks;
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
    var context = Context.foreground;

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
    var context = Context.foreground;

    var shift = Size / 5;

    var rX = cx - (shift / 2);
    var rY = cy - (shift / 2);
    var rW = shift;
    var rH = shift;

    var g1 = context.createLinearGradient (0, rY, 0, rY + rH);
    g1.addColorStop (0, Color.center);
    g1.addColorStop (0.5, Color.center);
    g1.addColorStop (1, Color.dial);

    context.fillStyle = g1;
    context.fillEllipse (rX, rY, rW, rH);

    shift = Size / 7;

    rX = cx - (shift / 2);
    rY = cy - (shift / 2);
    rW = shift;
    rH = shift;

    var g2 = context.createLinearGradient (rX, rY, rW + rX, rY + rH);
    g2.addColorStop (0, Color.nose);
    g2.addColorStop (1, Color.center);

    context.fillStyle = g2;
    context.fillEllipse (rX, rY, rW, rH);
  }

  this.drawHand = function (cx, cy)
  {
    var context = Context.hand;

    var radius = Size / 2 - (Size * 0.12);
    var val = MaxValue - MinValue;

    val = (MaxValue * (CurValue - MinValue)) / val;
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

    context.fillStyle = Color.hand.main;
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
    g1.addColorStop (0, Color.hand.shine);
    g1.addColorStop (1, Color.hand.shineTo);

    context.fillStyle = g1;
    context.fillPolygon (pts);
  }

  this.drawBackground = function (x, y, w, h)
  {
    var context = Context.background;

    // Draw background color
    context.fillStyle = Color.dial;
    context.ellipse (x, y, w, h);
    context.globalAlpha = 120.0 / 255.0;
    context.fill ();

    // Draw Rim
    context.strokeStyle = Color.rim;
    context.lineWidth = w * 0.03;
    context.ellipse (x, y, w, h);
    context.globalAlpha = 1.0;
    context.stroke ();

    this.drawCalibration ((w / 2) + x, (h / 2) + y);

    // Draw Colored Rim
    context.strokeStyle = Color.rimArc;
    context.lineWidth = Size / 40;
    var gap = Size * 0.03;

    context.strokeBoxedArc (x + gap, y + gap, w - gap * 2, h - gap * 2,
                            TBE.Deg2Rad (135), TBE.Deg2Rad (270),
                            /* counterclockwise = */ false);

    // Draw Threshold
    context.strokeStyle = Color.thresh;
    context.lineWidth = Size / 50;
    // context.globalAlpha = 200.0 / 255.0;

    var val = MaxValue - MinValue
    val = (MaxValue * (35.0 - MinValue)) / val; // recommendval - min
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
}; // End of class

// Theming support
Speedometer.themes = {};
