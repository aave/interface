import React from 'react';
import { ParentSize } from '@visx/responsive';
import { LiquidityChart } from 'src/modules/reserve-overview/LiquidityChart';
import { useReserveRatesHistory } from 'src/hooks/useReservesHistory';

export default function Page() {
  const { data, loading } = useReserveRatesHistory();
  if (loading) return null;
  return (
    <div style={{ height: 400, width: 500, marginLeft: 20, marginTop: 20 }}>
      <ParentSize>
        {(parent) => <LiquidityChart width={parent.width} height={parent.height} data={data} />}
      </ParentSize>
    </div>
  );
}
