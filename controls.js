function Controls ()
{
  var start = document.getElementById ('start');
  var stop  = document.getElementById ('stop');

  var mode_incr = document.getElementById ('incremental'),
      mode_rand = document.getElementById ('random');
  var timeout;

  start.onclick = function ()
  {
    start.disabled = true;
    stop.disabled = false;

    if (mode_incr.checked)
      incrementalUpdate ();
    else if (mode_rand.checked)
      randomUpdate ();
  }

  this.start = function ()
  {
    start.onclick ();
  }

  stop.onclick = function ()
  {
    stop.disabled = true;
    start.disabled = false;

    stopAnimation ();
  }

  this.stop = function ()
  {
    stop.onclick ();
  }

  mode_incr.onchange = mode_rand.onchange = function ()
  {
    if (start.disabled)
    {
      stop.onclick ();
      start.onclick ();
    }
  }
}
