// The Binary Elevator JS library - General utility methods
//
var TBE = {
  CreateCanvasElement: function ()
  {
    return document.createElement('canvas');
  },

  CreateSquareCanvasElement: function (size)
  {
    var canvas = TBE.CreateCanvasElement ();

    canvas.setAttribute ('width', size);
    //canvas.style.width = size + 'px';

    canvas.setAttribute ('height', size);
    //canvas.style.height = size + 'px';

    return canvas;
  },

  // Get a Canvas context, given an element.
  // Accepts either an element ID or a DOM object.
  //
  GetElement2DContext: function (element)
  {
    if (typeof (element) != 'object')
      element = document.getElementById (element);

    if (element && element.getContext)
      return element.getContext('2d');

    return null;
  },

  // Clear a canvas, per w3c specification.
  // Accepts either an element ID or a DOM object.
  //
  ClearCanvas: function (element)
  {
    if (typeof (element) != 'object')
      element = document.getElementById(element);

    if (element)
      element.setAttribute ('width', element.getAttribute ('width'));
  },

  // Convert degrees to radians
  //
  Deg2Rad: function (theta)
  {
    return theta * Math.PI / 180.0;
  }
};
