import { Group } from '@visx/group';
import { Pie } from '@visx/shape';

interface PieChartData {
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

export const GhoBorrowDiscountPieChart = ({
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
  if (data.find((d) => d.value === 0)) {
    padAngle = 0;
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
