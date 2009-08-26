var ClockWise = 1, CounterClockWise = 2;
var updateDir = ClockWise, incr = 0.35;

function incrementalUpdate ()
{
  var val;
  if (updateDir == ClockWise)
  {
    val = speedometer.value() + incr;

    // if clipping occurs, we reached the maximum value
    if (val != speedometer.update (val))
    {
      updateDir = CounterClockWise;
    }
  }
  else if (updateDir == CounterClockWise)
  {
    val = speedometer.value() - incr;

    // if clipping occurs, we reached the minimum value
    if (val != speedometer.update (val))
    {
      speedometer.update (speedometer.min());
      updateDir = ClockWise;
    }
  }
}

var Cycles = 100, CurrentCycle = Cycles, Target;
function randomUpdate ()
{
  var value;
  if (CurrentCycle == Cycles)
  {
    // Generate a new random value
    Target = Math.random () * speedometer.max ();
    incr = Math.abs (Target - speedometer.value ()) / Cycles;
    CurrentCycle = 0;
  }
  value = speedometer.value () < Target ?
    speedometer.value () + incr :
    speedometer.value () - incr ;
  CurrentCycle++;

  speedometer.update (value);
}
