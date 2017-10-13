// Original code shared in the public domain on the 'net by <anonymous>
// Further work by vjt@openssl.it - http://sindro.me/
//
// Project home page: http://github.com/vjt/canvas-speedometer
//
function Speedometer(Element) {
  var options = arguments[1] || {};

  var Container = document.getElementById(Element || 'speedometer');

  if (!Container) throw ('No container found!'); // XXX

  // Container CSS inspection to get computed size
  var ContainerStyle = TBE.GetElementComputedStyle (Container);
  var Size = Math.min (
    parseInt (ContainerStyle.width),
    parseInt (ContainerStyle.height)
  );

  if (!Size) throw ('Cannot get container dimensions!');

  // Customization
  var MinValue = options.min   || 0.0;
  var MaxValue = options.max   || 100.0;
  var CurValue = options.value || MinValue;
  var SigDigs = options.sigDigs || 3;
  var Units = options.units || "";

  // Threshold
  var Threshold   = options.threshold      || 50.0;
  var ThreshPivot = options.thresholdPivot || 35.0;

  // Meter, and correct user coords (cartesian) to the canvas std plane coords
  var MeterFromAngle = (options.meterFromAngle || -135.0) - 90.0;
  var MeterToAngle   = (options.meterToAngle   ||  135.0) - 90.0;
  var MeterRimAngle  = MeterToAngle - MeterFromAngle;

  var MeterTicksCount = options.meterTicksCount || 10;
  var MeterMarksCount = options.meterMarksCount || 3;
  var MeterGapScale   = (options.meterGapScale || 10) / 100.0;
  if (MeterGapScale > 1) MeterGapScale = 1;

  // Glossy?
  var Glossy = options.glossy == undefined ? true : Boolean (options.glossy);

  // Enable digital display?
  var Display = options.display == undefined ? true : Boolean (options.display);

  // Enable center rim?
  var CenterRimScale = options.centerRimScale == undefined ?
                       0.3 : Float (options.centerRimScale);
  var CenterScale    = options.center == undefined ?
                       0.25 : Float (options.centerScale);

  // Theming
  if (!Speedometer.themes['default'])
    throw ('Default theme missing! Please load themes/default.js');

  var theme = Speedometer.themes[options.theme] || Speedometer.themes['default'];

  for (key in Speedometer.themes['default'])
    if (theme[key] == undefined)
      theme[key] = Speedometer.themes['default'][key];

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
    meter : {
      ticks  : theme.ticks,
      marks  : theme.marks,
      strings: theme.strings,
      font   : theme.font
    },
    digits: theme.digits
  };

  // Private stuff.
  //
  var Canvas = {
    background: TBE.CreateSquareCanvasElement (Size),
    foreground: TBE.CreateSquareCanvasElement (Size),
    hand      : TBE.CreateSquareCanvasElement (Size),
    meter     : TBE.CreateSquareCanvasElement (Size),
    digits    : TBE.CreateSquareCanvasElement (Size)
  };

  var Context = {
    background: TBE.GetElement2DContext (Canvas.background),
    foreground: TBE.GetElement2DContext (Canvas.foreground),
    hand      : TBE.GetElement2DContext (Canvas.hand),
    meter     : TBE.GetElement2DContext (Canvas.meter)
  };

  var Position = (function (o) {
    this.x  = Size * 0.05;
    this.y  = Size * 0.05;
    this.w  = Size - this.x * 2;
    this.h  = Size - this.y * 2;
    this.cx = this.w / 2 + this.x;
    this.cy = this.h / 2 + this.y;

    return this;
  }).apply({});

  if (Display)
  {
    Display = new DigitalDisplay ({
      element: Canvas.digits,
      placeholders: Color.dial,
      digits: Color.digits,
      width: Size
    });
  }

  // Now append the canvases into the given container
  //
  Container.appendChild (Canvas.background);
  Container.appendChild (Canvas.meter);
  Container.appendChild (Canvas.digits); // TODO move in DigitalDisplay
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
      this.drawBackground ();
      this.drawCenter ();
      this.drawGloss ();

      this.drawMeter ();
      this.drawHand ();

      if (Display)
        Display.drawNumber (CurValue, SigDigs, Position.h / 1.2, Size / 9);
    }
  }

  ////////////////////
  // Update functions

  // Clip the given value to max/min
  //
  function clipValue (value)
  {
    if (value >= MaxValue)
      return MaxValue;
    else if (value <= MinValue)
      return MinValue;
    else
      return value;
  }

  // Instantaneously update the speedometer to the given value
  //
  this.update = function (value)
  {
    CurValue = clipValue (value);

    if (Context.hand)
    {
      TBE.ClearCanvas (Canvas.hand);
      this.drawHand ();
    }

    if (Display)
    {
      Display.clear ();
      Display.drawNumber (CurValue, SigDigs, Position.h / 1.2, Size / 9);
    }

    return CurValue;
  }

  this.rescale = function (val) {
    MaxValue = val;

    if (Context.meter)
    {
      TBE.ClearCanvas (Canvas.meter);
      this.drawMeter ();
    }

    this.update (CurValue);
  }

  this.reconfig = function(options) {
    // Customization
    MinValue = options.min   || MinValue;
    MaxValue = options.max   || MaxValue;
    CurValue = options.value || CurValue;
  
    // Threshold
    Threshold   = options.threshold      || Threshold;
    ThreshPivot = options.thresholdPivot || ThreshPivot;
  
    // Meter, and correct user coords (cartesian) to the canvas std plane coords
    MeterFromAngle = options.meterFromAngle ? (options.meterFromAngle || -135.0) - 90.0 : MeterFromAngle;
    MeterToAngle   = options.meterToAngle ? (options.meterToAngle   ||  135.0) - 90.0 : MeterToAngle;
    MeterRimAngle  = options.meterRimAngle ? MeterToAngle - MeterFromAngle : MeterRimAngle;
  
    MeterTicksCount = options.meterTicksCount || MeterTicksCount
    MeterMarksCount = options.meterMarksCount || MeterMarksCount
    MeterGapScale   = options.meterGapScale ? (options.meterGapScale || 10) / 100.0 : MeterGapScale;
    if (MeterGapScale > 1) MeterGapScale = 1;
  
    // Glossy?
    Glossy = options.glossy == undefined ? Glossy : Boolean (options.glossy);
  
    // Enable digital display?
    Display = options.display == undefined ? Display : Boolean (options.display);
  
    // Enable center rim?
    CenterRimScale = options.centerRimScale == undefined ?
                         CenterRimScale : Float (options.centerRimScale);
    CenterScale    = options.center == undefined ?
                       CenterScale : Float (options.centerScale);

    if (Context.meter)
    {
      TBE.ClearCanvas (Canvas.meter);
      this.drawMeter ();
    }
  }

  function dispatchAnimationEndedEvent ()
  {
    var evt = document.createEvent ('UIEvent');

    evt.initUIEvent ('speedometer:animateend',
                     /* bubbles = */ false,
                     /* cancelable = */ false,
                     /* defaultView = */ window,
                     /* detail = */ CurValue);

    Container.dispatchEvent (evt);
  }

  var listeners = {};
  this.addEventListener = function (evt, func)
  {
    if (listeners[func] == undefined)
    {
      //console.log ("adding " + evt + " listener with " + func);
      Container.addEventListener (evt, func, false);
      listeners[func] = evt;
      return true;
    }
    return false;
  }

  this.removeEventListener = function (evt, func)
  {
    if (listeners[func])
    {
      //console.log ("removing " + evt + " listener with " + func);
      Container.removeEventListener (evt, func, false);
      delete listeners[func];
      return true;
    }
    return false;
  }

  this.removeAllListeners = function ()
  {
    for (func in listeners)
      this.removeEventListener (listeners[func], func);
  }

  var animateCallback = null;
  this.animatedUpdate = function (value, time, callback)
  {
    var FPS = 25, incr, speedometer = this;

    if (animateCallback)
      throw ('Animation already running!');

    value = clipValue (value);
    if (value == CurValue || time <= 0.0)
      throw ('Invalid parameters (value: ' + value + ', time: ' + time + ')');

    if (callback)
      this.addEventListener ('speedometer:animateend', callback, false);

    incr = (value - CurValue) / FPS / (time/1000);

    animateCallback = function ()
    {
      var done = Math.abs (CurValue - value) < Math.abs (incr);
      if (!animateCallback || done)
      {
        speedometer.stopAnimation ();

        if (done)
        {
          speedometer.update (value);
          dispatchAnimationEndedEvent ();
        }
      }
      else
      {
        speedometer.update (CurValue + incr);
        setTimeout (animateCallback, 1000 / FPS);
      }
    };

    animateCallback.call ();
  }

  this.animatedRescale = function (value, time, callback)
  {
    var FPS = 25, incr, speedometer = this;

    if (animateCallback)
      throw ('Animation already running!');

    if (value == MaxValue || value <= MinValue || time <= 0.0)
      throw ('Invalid parameters (value: ' + value + ', time: ' + time + ')');

    if (callback)
      this.addEventListener ('speedometer:animateend', callback, false);

    incr = (value - MaxValue) / FPS / (time/1000);

    animateCallback = function ()
    {
      var done = Math.abs (MaxValue - value) < Math.abs (incr);
      if (!animateCallback || done)
      {
        speedometer.stopAnimation ();

        if (done)
        {
          speedometer.rescale (value);
          dispatchAnimationEndedEvent ();
        }
      }
      else
      {
        speedometer.rescale(MaxValue + incr);
        setTimeout (animateCallback, 1000 / FPS);
      }
    };

    animateCallback.call ();
  }

  this.stopAnimation = function ()
  {
    animateCallback = null;
  }

  // Getters
  //
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

  this.drawMeter = function ()
  {
    var cx = Position.cx, cy = Position.cy;

    var context = Context.meter;

    var gap = (Size * (MeterGapScale + 0.5) * 0.03);

    var radius = (Size - gap) / 2 - gap * 5;
    var totalAngle = MeterToAngle - MeterFromAngle;

    var currentAngle, angleIncr;
    var incValue = (MaxValue - MinValue) / MeterTicksCount;

    function drawMark (angle, options)
    {
      var x0 = (cx + radius * Math.cos (angle));
      var y0 = (cy + radius * Math.sin (angle));
      var x1 = (cx + (radius - options.size) * Math.cos (angle));
      var y1 = (cy + (radius - options.size) * Math.sin (angle));

      context.strokeStyle = options.color;
      context.lineWidth = options.width;
      context.moveTo (x0, y0);
      context.lineTo (x1, y1);
    }

    function drawString (value, options)
    {
      // Draw Strings
      tx = cx + (radius - options.offset) * Math.cos (options.angle);
      ty = cy + gap / 2 + (radius - options.offset) * Math.sin (options.angle);

      context.fillStyle = options.color;
      context.textAlign = 'center';

      context.font = Math.round (options.size) + 'pt ' + Color.meter.font;
      context.textAlignment = 'center';
      context.fillText (value, tx, ty);
    }

    // Draw units display
    context.fillStyle = Color.meter.strings;
    context.font = Math.round (Size/20) + 'pt ' + Color.meter.font;
    context.textAlign= 'center';
    context.fillText(Units,cx,Position.h/1.35);

    angleIncr = TBE.Deg2Rad (totalAngle / MeterTicksCount);
    currentAngle = TBE.Deg2Rad (MeterFromAngle);
    context.beginPath ();
    for (i = 0; i <= MeterTicksCount; i++)
    {
      // Draw thick mark and increment angle
      drawMark (currentAngle, {
        size: Size / 20,
        width: Size / 50,
        color: Color.meter.ticks
      });

      // Draw string and increment ruler value
      drawString (MinValue + Math.round (incValue * i), {
        angle: currentAngle,
        color: Color.meter.strings,
        offset: Size / 10,
        size: Size / 23
      });

      currentAngle += angleIncr;
    }
    context.stroke ();

    angleIncr = TBE.Deg2Rad (totalAngle / MeterTicksCount / (MeterMarksCount + 1));
    currentAngle = TBE.Deg2Rad (MeterFromAngle);
    context.beginPath ();
    for (i = 0; i < (MeterMarksCount + 1) * MeterTicksCount; i++)
    {
      // Draw thin mark if not overlapping a thick mark
      if (i % (MeterMarksCount + 1) != 0)
        drawMark (currentAngle, {size: Size / 50, width: Size / 100, color: Color.meter.marks});

      currentAngle += angleIncr;
    }
    context.stroke ();
  }

  this.drawGloss = function ()
  {
    if (!Glossy)
      return;

    var context = Context.foreground;

    // Draw dial glossiness
    //
    var rX = Size * 0.15;
    var rY = Position.y + Size * 0.07;
    var rW = Size * 0.70;
    var rH = Size * 0.65;

    var g1 = context.createLinearGradient (0, 0, 0, rY+rH);
    g1.addColorStop (0, 'rgba(255,255,255,1.0)');
    g1.addColorStop (1, 'rgba(255,255,255, 0.0)');

    context.fillStyle = g1;
    context.fillEllipse (rX, rY, rW, rH);

    if (!Display)
      return;

    // Draw display glossiness
    //
    rX = Size * 0.30;
    rY = Position.y + Size * 0.70;
    rW = Size * 0.40;
    rH = Size * 0.15;

    var g2 = context.createLinearGradient (0, rY, 0, rY + rH);
    g2.addColorStop (0, 'rgba(255,255,255,0.0)');
    g2.addColorStop (0.25, 'rgba(255,255,255,0.0)');
    g2.addColorStop (1, 'rgba(255,255,255,1.0)');

    context.fillStyle = g2;
    context.fillEllipse (rX, rY, rW, rH);
  }

  this.drawCenter = function ()
  {
    var cx = Position.cx, cy = Position.cy;

    var context = Context.foreground;

    var shift;

    if (CenterRimScale > 0 && CenterRimScale > CenterScale)
    {
      shift = CenterRimScale * (Size / 2);

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
    }

    if (CenterScale > 0)
    {
      shift = CenterScale * (Size / 2);

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
  }

  this.drawHand = function ()
  {
    var cx = Position.cx, cy = Position.cy;

    var context = Context.hand;

    var radius = Size / 2 - (Size * 0.12);

    var val = MaxValue - MinValue;
    val = (MaxValue * (CurValue - MinValue)) / val;
    val = ((MeterToAngle - MeterFromAngle) * val) / MaxValue;
    val += MeterFromAngle;

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

  this.drawBackground = function ()
  {
    var x = Position.x, y = Position.y,
        w = Position.w, h = Position.h;

    var context = Context.background;

    // Draw background color
    context.fillStyle = Color.dial;
    context.ellipse (x, y, w, h);
    context.globalAlpha = 0.45;
    context.fill ();

    // Draw Rim
    context.strokeStyle = Color.rim;
    context.lineWidth = w * 0.03;
    context.ellipse (x, y, w, h);
    context.globalAlpha = 1.0;
    context.stroke ();

    // Draw Colored Rim
    context.strokeStyle = Color.rimArc;
    context.lineWidth = Size / 40;
    var gap = Size * 0.03;

    context.strokeBoxedArc (x + gap, y + gap, w - gap * 2, h - gap * 2,
                            TBE.Deg2Rad (MeterFromAngle), TBE.Deg2Rad (MeterRimAngle),
                            /* counterclockwise = */ false);

    // Draw Threshold
    context.strokeStyle = Color.thresh;
    context.lineWidth = Size / 50;

    var val = MaxValue - MinValue
    val = (MaxValue * (ThreshPivot - MinValue)) / val;
    val = ((MeterToAngle - MeterFromAngle) * val) / MaxValue;
    val += MeterFromAngle;

    var stAngle = val - ((MeterRimAngle * Threshold) / MaxValue / 2);
    if (stAngle <= MeterFromAngle)
      stAngle = MeterFromAngle;

    var sweepAngle = ((MeterRimAngle * Threshold) / MaxValue);
    if (stAngle + sweepAngle > MeterToAngle)
      sweepAngle = MeterToAngle - stAngle;

    context.strokeBoxedArc (x + gap, y + gap, w - gap * 2, h - gap * 2,
                            TBE.Deg2Rad (stAngle), TBE.Deg2Rad (sweepAngle),
                            /* counterclockwise = */ false);
  }
}; // End of class

// Theming support
Speedometer.themes = {};
