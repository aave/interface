import React, { useMemo, useCallback, Fragment } from 'react';
import { Line, Bar, LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { scaleLinear } from '@visx/scale';
import { withTooltip, defaultStyles, TooltipWithBounds } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { localPoint } from '@visx/event';
import { AxisLeft } from '@visx/axis';
import { max, bisector } from 'd3-array';
import { Group } from '@visx/group';
import { useTheme } from '@mui/material';
import { normalizeBN, RAY, rayDiv, rayMul } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import { Text } from '@visx/text';
import { ChartLegend } from './ChartLegend';

type TooltipData = Rate;

const background = '#3b6978';
const accentColorDark = '#75daad';
const tooltipStyles = {
  ...defaultStyles,
  background,
  border: '1px solid white',
  color: 'white',
};

type InterestRateModelType = {
  variableRateSlope1: string;
  variableRateSlope2: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
  stableBorrowRateEnabled?: boolean;
  optimalUsageRatio: string;
  utilizationRate: string;
  baseVariableBorrowRate: string;
  baseStableBorrowRate: string;
};

type Rate = {
  stableRate: number;
  variableRate: number;
  utilization: number;
};

// accessors
const getDate = (d: Rate) => d.utilization;
const bisectDate = bisector<Rate, number>((d) => d.utilization).center;
const getVariableRate = (d: Rate) => d.variableRate * 100;
const getStableRate = (d: Rate) => d.stableRate * 100;

const resolution = 200;
const step = 100 / resolution;

// const getAPY = (rate: BigNumber) =>
//   rayPow(valueToZDBigNumber(rate).dividedBy(SECONDS_PER_YEAR).plus(RAY), SECONDS_PER_YEAR).minus(
//     RAY
//   );

function getRates({
  variableRateSlope1,
  variableRateSlope2,
  stableRateSlope1,
  stableRateSlope2,
  optimalUsageRatio,
  baseVariableBorrowRate,
  baseStableBorrowRate,
}: InterestRateModelType): Rate[] {
  const rates: Rate[] = [];
  const formattedOptimalUtilisationRate = normalizeBN(optimalUsageRatio, 25).toNumber();

  for (let i = 0; i <= resolution; i++) {
    const utilization = i * step;
    if (utilization === 0) {
      rates.push({
        stableRate: 0,
        variableRate: 0,
        utilization,
      });
    } else if (utilization < formattedOptimalUtilisationRate) {
      const theoreticalStableAPY = normalizeBN(
        new BigNumber(baseStableBorrowRate).plus(
          rayDiv(rayMul(stableRateSlope1, normalizeBN(utilization, -25)), optimalUsageRatio)
        ),
        27
      ).toNumber();
      const theoreticalVariableAPY = normalizeBN(
        new BigNumber(baseVariableBorrowRate).plus(
          rayDiv(rayMul(variableRateSlope1, normalizeBN(utilization, -25)), optimalUsageRatio)
        ),
        27
      ).toNumber();
      rates.push({
        stableRate: theoreticalStableAPY,
        variableRate: theoreticalVariableAPY,
        utilization,
      });
    } else {
      const excess = rayDiv(
        normalizeBN(utilization, -25).minus(optimalUsageRatio),
        RAY.minus(optimalUsageRatio)
      );
      const theoreticalStableAPY = normalizeBN(
        new BigNumber(baseStableBorrowRate)
          .plus(stableRateSlope1)
          .plus(rayMul(stableRateSlope2, excess)),
        27
      ).toNumber();
      const theoreticalVariableAPY = normalizeBN(
        new BigNumber(baseVariableBorrowRate)
          .plus(variableRateSlope1)
          .plus(rayMul(variableRateSlope2, excess)),
        27
      ).toNumber();
      rates.push({
        stableRate: theoreticalStableAPY,
        variableRate: theoreticalVariableAPY,
        utilization,
      });
    }
  }
  return rates;
}

export type AreaProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  reserve: InterestRateModelType;
};

export const InterestRateModelChart = withTooltip<AreaProps, TooltipData>(
  ({
    width,
    height,
    margin = { top: 20 /** needed for absolute labels on top */, right: 10, bottom: 0, left: 40 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft = 0,
    reserve,
  }: AreaProps & WithTooltipProvidedProps<TooltipData>) => {
    if (width < 10) return null;
    const theme = useTheme();

    const data = useMemo(() => getRates(reserve), [JSON.stringify(reserve)]);

    const utilizationColor = theme.palette.mode === 'dark' ? '#fff' : '#000';

    // bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // scales
    const dateScale = useMemo(
      () =>
        scaleLinear({
          range: [0, innerWidth],
          domain: [0, 100],
          nice: true,
        }),
      [innerWidth]
    );
    const yValueScale = useMemo(() => {
      const maxY = reserve.stableBorrowRateEnabled
        ? Math.max(
            max(data, (d) => getStableRate(d)) as number,
            max(data, (d) => getVariableRate(d)) as number
          )
        : (max(data, (d) => getVariableRate(d)) as number);
      return scaleLinear({
        range: [innerHeight, 0],
        domain: [0, (maxY || 0) * 1.1],
        nice: true,
      });
    }, [innerHeight, data, reserve]);

    // tooltip handler
    const handleTooltip = useCallback(
      (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
        const { x: _x } = localPoint(event) || { x: 0 };
        const x = _x - margin.left;
        const x0 = dateScale.invert(x);
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
        });
      },
      [showTooltip, dateScale, data, margin]
    );

    const ticks = [
      {
        value: normalizeBN(reserve.optimalUsageRatio, 27).multipliedBy(100).toNumber(),
        label: 'optimal',
      },
      {
        value: new BigNumber(reserve.utilizationRate).multipliedBy(100).toNumber(),
        label: 'current',
      },
    ];

    return (
      <>
        <ChartLegend
          labels={[
            { text: 'Utilization rate', color: utilizationColor },
            { text: 'Borrow APR, variable', color: '#B6509E' },
            ...(reserve.stableBorrowRateEnabled
              ? ([{ text: 'Borrow APR, stable', color: '#0062D2' }] as const)
              : []),
          ]}
        />
        <svg width={width} height={height}>
          <Group left={margin.left} top={margin.top}>
            {reserve.stableBorrowRateEnabled && (
              <LinePath
                stroke={'#0062D2'}
                strokeWidth={2}
                data={data}
                x={(d) => dateScale(getDate(d)) ?? 0}
                y={(d) => yValueScale(getStableRate(d)) ?? 0}
                curve={curveMonotoneX}
              />
            )}
            <LinePath
              stroke={'#B6509E'}
              strokeWidth={2}
              data={data}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => yValueScale(getVariableRate(d)) ?? 0}
              curve={curveMonotoneX}
            />
            <AxisLeft
              scale={yValueScale}
              strokeWidth={0}
              tickLabelProps={() => ({
                fill: theme.palette.text.secondary,
                fontSize: 8,
                dx: -margin.left + 8,
              })}
              tickFormat={(value) => `${(value as number).toFixed(2)} %`}
            />
            <Bar
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              onTouchStart={handleTooltip}
              onTouchMove={handleTooltip}
              onMouseMove={handleTooltip}
              onMouseLeave={() => hideTooltip()}
            />
            <Line
              from={{ x: dateScale(0), y: innerHeight / 4 }}
              to={{ x: dateScale(100), y: innerHeight / 4 }}
              stroke={theme.palette.mode === 'dark' ? '#fff' : '#000'}
              strokeWidth={2}
              pointerEvents="none"
            />
            <Line
              from={{ x: dateScale(ticks[1].value), y: innerHeight / 4 - 5 }}
              to={{ x: dateScale(ticks[1].value), y: innerHeight / 4 + 5 }}
              stroke={utilizationColor}
              strokeWidth={2}
              pointerEvents="none"
            />
            <Text
              x={dateScale(ticks[1].value)}
              y={innerHeight / 4 - 14}
              width={360}
              textAnchor="middle"
              verticalAnchor="middle"
              fontSize="10px"
              fill={utilizationColor}
            >
              Current
            </Text>
            <Line
              from={{ x: dateScale(ticks[0].value), y: innerHeight / 4 + 5 }}
              to={{ x: dateScale(ticks[0].value), y: innerHeight / 4 - 5 }}
              stroke={utilizationColor}
              strokeWidth={2}
              pointerEvents="none"
            />
            <Text
              x={dateScale(ticks[0].value)}
              y={innerHeight / 4 + 14}
              width={360}
              textAnchor="middle"
              verticalAnchor="middle"
              fontSize="10px"
              fill={utilizationColor}
            >
              Optimal
            </Text>
            {tooltipData && (
              <g>
                <Line
                  from={{ x: tooltipLeft, y: margin.top }}
                  to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                  stroke={accentColorDark}
                  strokeWidth={2}
                  pointerEvents="none"
                  strokeDasharray="5,2"
                />
                <circle
                  cx={tooltipLeft}
                  cy={yValueScale(getVariableRate(tooltipData)) + 1}
                  r={4}
                  fill="black"
                  fillOpacity={0.1}
                  stroke="black"
                  strokeOpacity={0.1}
                  strokeWidth={2}
                  pointerEvents="none"
                />
                <circle
                  cx={tooltipLeft}
                  cy={yValueScale(getVariableRate(tooltipData))}
                  r={4}
                  fill={accentColorDark}
                  stroke="white"
                  strokeWidth={2}
                  pointerEvents="none"
                />
                {reserve.stableBorrowRateEnabled && (
                  <Fragment key={'stable'}>
                    <circle
                      cx={tooltipLeft}
                      cy={yValueScale(getStableRate(tooltipData)) + 1}
                      r={4}
                      fill="black"
                      fillOpacity={0.1}
                      stroke="black"
                      strokeOpacity={0.1}
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                    <circle
                      cx={tooltipLeft}
                      cy={yValueScale(getStableRate(tooltipData))}
                      r={4}
                      fill={accentColorDark}
                      stroke="white"
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                  </Fragment>
                )}
              </g>
            )}
          </Group>
        </svg>

        {tooltipData && (
          <div>
            <TooltipWithBounds top={20} left={tooltipLeft + 12} style={tooltipStyles}>
              <div>Utilization: {tooltipData.utilization}%</div>
              {reserve.stableBorrowRateEnabled && (
                <div>Stable: {getStableRate(tooltipData).toFixed(2)} %</div>
              )}
              <div>Variable: {getVariableRate(tooltipData).toFixed(2)} %</div>
            </TooltipWithBounds>
          </div>
        )}
      </>
    );
  }
);
