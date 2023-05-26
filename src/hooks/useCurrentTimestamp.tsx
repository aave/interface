import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

/**
 * Triggers an update based on provided updateInterval.
 * @param updateInterval
 * @returns current timestamp - when forkTimeAhead is set the time will be forwarded by the specified amount.
 */
export function useCurrentTimestamp(updateInterval = 15): number {
  const [timeTravel, setTimeTravel] = useState(0);
  const [timestamp, setTimestamp] = useState(0);

  useEffect(() => {
    const intervalHandlerID = setInterval(
      () => setTimestamp(dayjs().unix() + timeTravel),
      1000 * updateInterval
    );
    return () => clearInterval(intervalHandlerID);
  }, [updateInterval, timeTravel]);

  useEffect(() => {
    const forwardTime = Number(localStorage.getItem('forkTimeAhead') || 0);
    setTimeTravel(forwardTime);
    setTimestamp(dayjs().unix() + forwardTime);
  }, []);

  return timestamp;
}
