// Original code taken from http://www.thebinaryelevator.com/t/speedometer.html
// Object orientation by vjt@openssl.it - http://sindro.me/
//

function DigitalDisplay (options)
{
  var element = options.element;
  var dialColor = options.dialColor || 'Gray';
  var width = options.width || 300;

  var context = TBE.GetElement2DContext (element);

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

  this.clear = function ()
  {
    TBE.ClearCanvas (element);
  }

  this.drawNumber = function (value, x, y, len, height)
  {
    var segs = createSegments (height);
    var fixv = Math.round (value);
    var decv = (value - fixv) * 100;

    context.fillStyle = dialColor;
    context.globalAlpha = 40.0 / 255.0;

    var shift = 0, incr = 15 * width / 250;
    for (var n = 0; n < len; n++)
    {
      drawSingleDigit (segs, 127, x + shift, y);
      shift += incr;
    }

    shift -= incr;
    context.fillStyle = 'Gray';
    context.globalAlpha = 210.0/255.0;
    for (var n = 0; n < len; n++)
    {
      drawSingleDigit (segs, DigitsSegments[(fixv % 10)], x + shift, y);
      fixv = Math.floor (fixv / 10.0);
      shift -= incr;
      // Perform the check here so we output a 0
      if (fixv == 0)
      break;
    }
  }

  function drawSingleDigit (segs, bits, x, y)
  {
    for (var n = 0; n < 7; n++)
    {
      if (bits & (1 << n))
      context.fillPolygon (offsetPolygon (x, y, segs[n]));
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
}
