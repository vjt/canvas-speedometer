function incrementalUpdate ()
{
  var target = speedometer.value () < speedometer.max () ?
      speedometer.max () : speedometer.min ();

  speedometer.animatedUpdate (target, 5000);
}

function randomUpdate ()
{
  var target = Math.random () * speedometer.max ();
  var time = Math.random () * 5000;

  speedometer.animatedUpdate (target, time);
}

function stopAnimation ()
{
  speedometer.stopAnimation ();
}
