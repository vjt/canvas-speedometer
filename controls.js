var timedUpdate;

function Controls ()
{
  this.start = document.getElementById ('start');
  this.stop  = document.getElementById ('stop');

  var start = this.start, stop = this.stop;
  var mode_incr = document.getElementById ('incremental'),
      mode_rand = document.getElementById ('random');
  var timeout;

  timedUpdate = function ()
  {
    if (mode_incr.checked)
      incrementalUpdate ();
    else if (mode_rand.checked)
      randomUpdate ();

    timeout = setTimeout ('timedUpdate ()', 20);
  }

  this.start.onclick = function ()
  {
    start.disabled = true;
    stop.disabled = false;
    timedUpdate ();
  }

  this.stop.onclick = function ()
  {
    stop.disabled = true;
    start.disabled = false;
    clearTimeout (timeout);
  }
}
