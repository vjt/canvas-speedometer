function Controls (controls, options)
{
  var speedometer = options.speedometer;
  if (!speedometer) throw ('Please pass the speedometer object to the controls constructor');

  var controls = document.getElementById(controls); // TODO use .querySelector
  if (!controls) throw ('No controls container found');

  var update = controls.querySelector('[name=update]');

  var mode_incr = controls.querySelector ('[name=mode][value=incremental]'),
      mode_rand = controls.querySelector ('[name=mode][value=random]');

  var rescale  = controls.querySelector ('[name=rescale]'),
      maxvalue = controls.querySelector ('[name=maxvalue]');

  // Animated update
  //
  var start_update = function ()
  {
    if (mode_incr.checked)
      incrementalUpdate (speedometer);
    else if (mode_rand.checked)
      randomUpdate (speedometer);

    update.value = 'stop';
  }

  var stop_update = function ()
  {
    stopAnimation (speedometer);

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
