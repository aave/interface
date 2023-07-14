import { Group } from '@visx/group';
import { Pie } from '@visx/shape';

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface GhoBorrowDiscountPieChartProps {
  data: PieChartData[];
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const GhoPieChart = ({
  data,
  width,
  height,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
}: GhoBorrowDiscountPieChartProps) => {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const donutThickness = 18;

  let padAngle = 0.04;
  const threshold = 0.01;
  // Optimize the pad angle for cases when there is a 0 value,
  // or for when the ratio between the two values is very small.
  if (data.some((d) => d.value === 0)) {
    padAngle = 0;
  } else if (data[0].value !== 0 && data[1].value / data[0].value < threshold) {
    padAngle = 0.01;
  } else if (data[1].value !== 0 && data[0].value / data[1].value < threshold) {
    padAngle = 0.01;
  }

  return (
    <svg width={width} height={height}>
      <Group top={centerY + margin.top} left={centerX + margin.left}>
        <Pie
          data={data}
          pieValue={(d) => d.value || 0}
          outerRadius={radius}
          innerRadius={radius - donutThickness}
          padAngle={padAngle}
          pieSortValues={() => -1}
        >
          {(pie) => {
            return pie.arcs.map((arc, index) => {
              const { name, color } = arc.data;
              const arcPath = pie.path(arc);
              if (!arcPath) return null;

              return (
                <g key={`arc-${name}-${index}`}>
                  <path d={arcPath} fill={color} />
                </g>
              );
            });
          }}
        </Pie>
      </Group>
    </svg>
  );
};
