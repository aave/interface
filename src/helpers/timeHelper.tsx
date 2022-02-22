export const daysFromSeconds = (time: number) => time / 60 / 60 / 24;
export const hoursFromSeconds = (time: number) => time / 60 / 60;
export const minutesFromSeconds = (time: number) => time / 60;

export const formattedTime = (time: number) =>
  daysFromSeconds(time) < 1
    ? hoursFromSeconds(time) < 1
      ? minutesFromSeconds(time)
      : hoursFromSeconds(time)
    : daysFromSeconds(time);

export const timeText = (time: number) =>
  daysFromSeconds(time) < 1 ? (hoursFromSeconds(time) < 1 ? 'minutes' : 'hours') : 'days';
