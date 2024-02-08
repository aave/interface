import {
  daysFromSeconds,
  formattedTime,
  hoursFromSeconds,
  minutesFromSeconds,
  timeText,
} from '../timeHelper';

describe('daysFromSeconds correctly convert seconds to days', () => {
  it('expect 1 when given 86400 seconds', () => {
    expect(daysFromSeconds(86400)).toBe(1); // 86400 seconds in a day
  });

  it('expect 2 when given 172800 seconds', () => {
    expect(daysFromSeconds(172800)).toBe(2); // 172800 seconds in 2 days
  });
});

describe('hoursFromSeconds should correctly convert seconds to hours', () => {
  it('expect 1 when given 3600 seconds', () => {
    expect(hoursFromSeconds(3600)).toBe(1); // 3600 seconds in an hour
  });

  it('expect 2 when given 7200 seconds', () => {
    expect(hoursFromSeconds(7200)).toBe(2); // 7200 seconds in 2 hours
  });
});

describe('minutesFromSeconds should correctly convert seconds to minutes', () => {
  it('expect 1 when given 60 seconds', () => {
    expect(minutesFromSeconds(60)).toBe(1); // 60 seconds in a minute
  });

  it('expect 2 when given 120 seconds', () => {
    expect(minutesFromSeconds(120)).toBe(2); // 120 seconds in 2 minutes
  });
});

describe('formattedTime should format time value in days, hours, or minutes', () => {
  it('expect 1 when given 3600 seconds', () => {
    expect(formattedTime(3600)).toBe(1); // 1 hour in seconds
  });

  it('expect 2 when given 7200 seconds', () => {
    expect(formattedTime(7200)).toBe(2); // 2 hours in seconds
  });

  it('expect 1 when given 86400 seconds', () => {
    expect(formattedTime(86400)).toBe(1); // 1 day in seconds
  });
});

describe('timeText should return the correct time unit text', () => {
  it('expect minutes when given 60 seconds', () => {
    expect(timeText(60)).toBe('minutes');
  });

  it('expect hours when given 3600 seconds', () => {
    expect(timeText(3600)).toBe('hours');
  });

  it('expect hours when given 7200 seconds', () => {
    expect(timeText(7200)).toBe('hours');
  });

  it('expect days when given 86400 seconds', () => {
    expect(timeText(86400)).toBe('days');
  });
});
