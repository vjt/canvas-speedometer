// The Binary Elevator JS library - General utility methods
//
var TBE = {
  // Get a Canvas context, given an element ID
  //
  GetElement2DContextById: function (elementId) {
    var elem = document.getElementById(elementId);

    if (elem && elem.getContext)
      return elem.getContext('2d');

    return null;
  },

  // Clear a canvas, per w3c specification
  //
  ClearCanvas: function (elementId) {
    var elem = document.getElementById(elementId);
    if (elem) {
      elem.setAttribute ('width', elem.getAttribute('width'));
    }
  },

  // Convert degrees to radians
  //
  Deg2Rad: function (theta)
  {
    return theta * Math.PI / 180.0;
  }
};
