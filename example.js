var ClockWise = 1, CounterClockWise = 2;
var updateDir = ClockWise, incr = 0.15;

function incrementalUpdate ()
{
  if (updateDir == ClockWise)
  {
    if (!speedometer.update (speedometer.value() + incr))
    {
      speedometer.update (speedometer.max());
      updateDir = CounterClockWise;
    }
  }
  else if (updateDir == CounterClockWise)
  {
    if (!speedometer.update (speedometer.value() - incr))
    {
      speedometer.update (speedometer.min());
      updateDir = ClockWise;
    }
  }
}

var Cycles = 50, CurrentCycle = Cycles, Target;
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
