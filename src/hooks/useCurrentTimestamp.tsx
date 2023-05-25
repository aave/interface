import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

/**
 * Triggers an update based on provided updateInterval.
 * @param updateInterval
 * @returns current timestamp - when forkTimeAhead is set the time will be forwarded by the specified amount.
 */
export function useCurrentTimestamp(updateInterval = 15): number {
  const [timestamp, setTimestamp] = useState(dayjs().unix());

  useEffect(() => {
    const intervalHandlerID = setInterval(
      () => setTimestamp(dayjs().unix()),
      1000 * updateInterval
    );
    return () => clearInterval(intervalHandlerID);
  }, [updateInterval]);

  return timestamp;
}
