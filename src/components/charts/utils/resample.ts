type Datum = { date: Date | string; value: number };

const toDate = (date: Date | string) => (date instanceof Date ? date : new Date(date));

export const resampleSeries = (
  data: readonly Datum[],
  points: number
): { date: Date; value: number }[] => {
  if (data.length === 0) return [];
  if (data.length === 1) {
    return Array.from({ length: points }, () => ({
      date: toDate(data[0].date),
      value: data[0].value,
    }));
  }

  return Array.from({ length: points }, (_, i) => {
    const at = (i / (points - 1)) * (data.length - 1);
    const lo = Math.floor(at);
    const hi = Math.min(lo + 1, data.length - 1);
    const t = at - lo;

    return {
      date: new Date(
        toDate(data[lo].date).getTime() * (1 - t) + toDate(data[hi].date).getTime() * t
      ),
      // a·(1−t) + b·t drifts a flat series by a rounding step, which the chart reads as a tiny range
      value: data[lo].value + (data[hi].value - data[lo].value) * t,
    };
  });
};
