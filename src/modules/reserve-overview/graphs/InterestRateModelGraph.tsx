import React, { useMemo, useCallback, Fragment } from 'react';
import { normalizeBN, RAY, rayDiv, rayMul } from '@aave/math-utils';
import { Box, Typography, useTheme } from '@mui/material';
import { Line, Bar, LinePath } from '@visx/shape';
import { AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';
import { withTooltip, defaultStyles, TooltipWithBounds } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { BigNumber } from 'bignumber.js';
import { max, bisector } from 'd3-array';
import type { Fields } from './InterestRateModelGraphContainer';
import { Trans } from '@lingui/macro';

type TooltipData = Rate;

const accentColorDark = '#383D511F';
const tooltipStyles = {
  ...defaultStyles,
  padding: '8px 12px',
  boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '4px',
  color: '#62677B',
  fontSize: '12px',
  lineHeight: '16px',
  letterSpacing: '0.15px',
};

type InterestRateModelType = {
  reserveFactor: string;
  supplyAPR: string;
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
  supplyRate: number;
};

// accessors
const getDate = (d: Rate) => d.utilization;
const bisectDate = bisector<Rate, number>((d) => d.utilization).center;
const getSupplyRate = (d: Rate) => {
  console.log(d.supplyRate);
  return d.supplyRate ?? 0 * 100;
};
const getVariableBorrowRate = (d: Rate) => d.variableRate * 100;
const getStableBorrowRate = (d: Rate) => d.stableRate * 100;
const tooltipValueAccessors = {
  liquidityRate: getSupplyRate,
  stableBorrowRate: getStableBorrowRate,
  variableBorrowRate: getVariableBorrowRate,
};

const resolution = 200;
const step = 100 / resolution;

// const getAPY = (rate: BigNumber) =>
//   rayPow(valueToZDBigNumber(rate).dividedBy(SECONDS_PER_YEAR).plus(RAY), SECONDS_PER_YEAR).minus(
//     RAY
//   );

function getRates({
  supplyAPR,
  reserveFactor,
  variableRateSlope1,
  variableRateSlope2,
  stableRateSlope1,
  stableRateSlope2,
  optimalUsageRatio,
  baseVariableBorrowRate,
  baseStableBorrowRate,
}: InterestRateModelType): Rate[] {
  const rates: Rate[] = [];
  const formattedOptimalUtilizationRate = normalizeBN(optimalUsageRatio, 25).toNumber();

  for (let i = 0; i <= resolution; i++) {
    const utilization = i * step;
    // When zero
    if (utilization === 0) {
      rates.push({
        supplyRate: 0,
        stableRate: 0,
        variableRate: 0,
        utilization,
      });
    }
    // When hovering below optimal utilization rate, actual data
    else if (utilization < formattedOptimalUtilizationRate) {
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
        supplyRate: parseFloat(supplyAPR),
        stableRate: theoreticalStableAPY,
        variableRate: theoreticalVariableAPY,
        utilization,
      });
    }
    // When hovering above optimal utilization rate, hypothetical predictions
    else {
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
      // Calculate the supply APR based off of the hypothetical variable borrow rate
      const theoreticalSupplyAPR = theoreticalVariableAPY * 100 - parseFloat(reserveFactor);
      rates.push({
        supplyRate: theoreticalSupplyAPR,
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
  fields: Fields;
  reserve: InterestRateModelType;
};

export const InterestRateModelGraph = withTooltip<AreaProps, TooltipData>(
  ({
    width,
    height,
    margin = { top: 20 /** needed for absolute labels on top */, right: 10, bottom: 0, left: 40 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft = 0,
    fields,
    reserve,
  }: AreaProps & WithTooltipProvidedProps<TooltipData>) => {
    if (width < 10) return null;
    const theme = useTheme();

    const data = useMemo(() => getRates(reserve), [JSON.stringify(reserve)]);

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
            max(data, (d) => getStableBorrowRate(d)) as number,
            max(data, (d) => getVariableBorrowRate(d)) as number
          )
        : (max(data, (d) => getVariableBorrowRate(d)) as number);
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
        <svg width={width} height={height}>
          <Group left={margin.left} top={margin.top}>
            {/* Horizontal Background Lines */}
            <GridRows
              scale={yValueScale}
              width={innerWidth}
              strokeDasharray="3,3"
              stroke={theme.palette.divider}
              pointerEvents="none"
              numTicks={3}
            />

            {/* Supply APR Line */}
            <LinePath
              stroke="#2EBAC6"
              strokeWidth={2}
              data={data}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => yValueScale(getSupplyRate(d)) ?? 0}
              curve={curveMonotoneX}
            />

            {/* Variable Borrow APR Line */}
            <LinePath
              stroke="#B6509E"
              strokeWidth={2}
              data={data}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => yValueScale(getVariableBorrowRate(d)) ?? 0}
              curve={curveMonotoneX}
            />

            {/* Stable Borrow APR Line */}
            {reserve.stableBorrowRateEnabled && (
              <LinePath
                stroke="#E7C6DF"
                strokeWidth={2}
                data={data}
                x={(d) => dateScale(getDate(d)) ?? 0}
                y={(d) => yValueScale(getStableBorrowRate(d)) ?? 0}
                curve={curveMonotoneX}
              />
            )}

            {/* Y Axis */}
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

            {/* Background */}
            <Bar
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              onTouchStart={handleTooltip}
              onTouchMove={handleTooltip}
              onMouseMove={handleTooltip}
              onMouseLeave={() => hideTooltip()}
            />

            {/* Optimal Utilization Tick */}
            <Line
              from={{ x: dateScale(ticks[0].value), y: margin.top + 8 }}
              to={{ x: dateScale(ticks[0].value), y: innerHeight + margin.top }}
              stroke={accentColorDark}
              strokeWidth={2}
              pointerEvents="none"
              strokeDasharray="5,2"
            />
            <Text
              x={dateScale(ticks[0].value)}
              y={margin.top}
              width={360}
              textAnchor="middle"
              verticalAnchor="middle"
              fontSize="10px"
              fill="#A5A8B6"
            >
              Optimal
            </Text>

            {/* Tooltip */}
            {tooltipData && (
              <g>
                {/* Vertical line */}
                <Line
                  from={{ x: tooltipLeft, y: margin.top }}
                  to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                  stroke={accentColorDark}
                  strokeWidth={2}
                  pointerEvents="none"
                  strokeDasharray="5,2"
                />
                {/* Variable borrow rate circle */}
                <circle
                  cx={tooltipLeft}
                  cy={yValueScale(getVariableBorrowRate(tooltipData)) + 1}
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
                  cy={yValueScale(getVariableBorrowRate(tooltipData))}
                  r={4}
                  fill={accentColorDark}
                  stroke="white"
                  strokeWidth={2}
                  pointerEvents="none"
                />
                {/* Supply rate circle */}
                <circle
                  cx={tooltipLeft}
                  cy={yValueScale(getSupplyRate(tooltipData)) + 1}
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
                  cy={yValueScale(getSupplyRate(tooltipData))}
                  r={4}
                  fill={accentColorDark}
                  stroke="white"
                  strokeWidth={2}
                  pointerEvents="none"
                />
                {/* Stable borrow rate circle */}
                {reserve.stableBorrowRateEnabled && (
                  <Fragment key={'stable'}>
                    <circle
                      cx={tooltipLeft}
                      cy={yValueScale(getStableBorrowRate(tooltipData)) + 1}
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
                      cy={yValueScale(getStableBorrowRate(tooltipData))}
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

        {/* Tooltip Info */}
        {tooltipData && (
          <div>
            <TooltipWithBounds top={20} left={tooltipLeft + 12} style={tooltipStyles}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="main12" color="primary" sx={{ mr: 2 }}>
                  <Trans>Utilization Rate</Trans>
                </Typography>
                <Typography variant="main12" color="primary">
                  {tooltipData.utilization}%
                </Typography>
              </Box>
              {fields.map((field) => (
                <Box key={field.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                    {field.text}
                  </Typography>
                  <Typography variant="main12" color="text.primary">
                    {tooltipValueAccessors[field.name](tooltipData).toFixed(2)}%
                  </Typography>
                </Box>
              ))}
            </TooltipWithBounds>
          </div>
        )}
      </>
    );
  }
);
