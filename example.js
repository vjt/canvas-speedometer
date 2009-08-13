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

function randomUpdate ()
{
  speedometer.update (Math.random() * speedometer.max());
}
