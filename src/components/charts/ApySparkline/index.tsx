import { ReactNode } from 'react';

import { SparklineChart, SparklineDatum } from '../SparklineChart';

const RESOLUTION = 96;

export const ApySparkline = ({
  history,
  loading,
  color,
  baselineLabel,
  fadeLeft,
}: {
  history?: SparklineDatum[];
  loading?: boolean;
  color?: string;
  baselineLabel?: ReactNode;
  fadeLeft?: boolean;
}) => {
  const baseline =
    history && history.length > 0
      ? history.reduce((sum, d) => sum + d.value, 0) / history.length
      : undefined;

  return (
    <SparklineChart
      data={history}
      loading={loading}
      color={color}
      height={48}
      baseline={baseline}
      baselineLabel={baselineLabel}
      fadeLeft={fadeLeft}
      resolution={RESOLUTION}
      showArea={false}
      safeArea={{ top: 4, bottom: 4 }}
    />
  );
};
