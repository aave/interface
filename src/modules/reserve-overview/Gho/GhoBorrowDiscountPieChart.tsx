import { Group } from '@visx/group';
import { Pie } from '@visx/shape';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface GhoBorrowDiscountPieChartProps {
  data: PieChartData[];
}

export const GhoBorrowDiscountPieChart = ({ data }: GhoBorrowDiscountPieChartProps) => {
  const width = 156;
  const height = 156;

  const radius = width / 2;
  const centerY = height / 2;
  const centerX = width / 2;
  const donutThickness = 18;

  let padAngle = 0.04;
  if (data.find((d) => d.value === 0)) {
    padAngle = 0;
  }

  return (
    <svg width={width} height={height}>
      <Group top={centerY} left={centerX}>
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
