import React from 'react';
import { ParentSize } from '@visx/responsive';
import { LiquidityChart } from 'src/modules/reserve-overview/LiquidityChart';
import { useReserveRatesHistory } from 'src/hooks/useReservesHistory';
// import dynamic from 'next/dynamic';

export default function Page() {
  const { data, loading } = useReserveRatesHistory();
  if (loading || !data?.length) return null;
  return (
    <>
      <div style={{ height: 300, width: 800, marginLeft: 20, marginTop: 20 }}>
        <ParentSize>
          {(parent) => (
            <LiquidityChart
              width={parent.width}
              height={parent.height}
              data={data}
              fields={[{ name: 'liquidityRate', color: '#2EBAC6' }]}
            />
          )}
        </ParentSize>
      </div>
      <div style={{ height: 400, width: 800, marginLeft: 20, marginTop: 20 }}>
        <ParentSize>
          {(parent) => (
            <LiquidityChart
              width={parent.width}
              height={parent.height}
              data={data}
              fields={[
                { name: 'stableBorrowRate', color: '#0062D2' },
                { name: 'variableBorrowRate', color: '#B6509E' },
              ]}
            />
          )}
        </ParentSize>
      </div>
    </>
  );
}
