export const daysFromSeconds = (time: number) => time / 60 / 60 / 24;
export const hoursFromSeconds = (time: number) => time / 60 / 60;
export const minutesFromSeconds = (time: number) => time / 60;

export const timeMessage = (time: number) => {
  return `${formattedTime(time)} ${timeText(time)}`;
};

export const formattedTime = (time: number) => {
  const days = daysFromSeconds(time);

  if (days < 1) {
    const hours = hoursFromSeconds(time);
    return hours < 1 ? minutesFromSeconds(time) : hours;
  }

  return days;
};

export const timeText = (time: number) => {
  const days = daysFromSeconds(time);

  if (days < 1) {
    const hours = hoursFromSeconds(time);
    return hours < 1 ? 'minutes' : 'hours';
  }

  return 'days';
};
