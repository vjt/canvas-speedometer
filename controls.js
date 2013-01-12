function Controls ()
{
  var update = document.getElementById ('update');

  var mode_incr = document.getElementById ('incremental'),
      mode_rand = document.getElementById ('random');

  var rescale  = document.getElementById ('rescale'),
      maxvalue = document.getElementById ('maxvalue');

  // Animated update
  //
  var start_update = function ()
  {
    if (mode_incr.checked)
      incrementalUpdate ();
    else if (mode_rand.checked)
      randomUpdate ();

    update.value = 'stop';
  }

  var stop_update = function ()
  {
    stopAnimation ();

    update.value = 'start';
  }

  var updating = function ()
  {
    return update.value == 'stop';
  }

  this.start = start_update;

  update.onclick = function () {
    if (updating ())
      stop_update ();
    else
      start_update ();
  }

  mode_incr.onchange = mode_rand.onchange = function ()
  {
    if (updating ())
    {
      stop_update ();
      start_update ();
    }
  }

  // Animated Rescale
  //
  rescale.onclick = function ()
  {
    var max = parseInt (maxvalue.value);

    if (max == speedometer.max ())
      return;

    if (updating ())
      stop_update ();

    speedometer.animatedRescale (max, 2000);
  }

}
