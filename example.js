function incrementalUpdate (speedometer)
{
  var target = speedometer.value () < speedometer.max () ?
      speedometer.max () : speedometer.min ();

  speedometer.animatedUpdate (target, 5000);
}

function randomUpdate (speedometer)
{
  var target = Math.random () * speedometer.max ();
  var time = Math.random () * 5000;

  speedometer.animatedUpdate (target, time);
}

function stopAnimation (speedometer)
{
  speedometer.stopAnimation ();
}
