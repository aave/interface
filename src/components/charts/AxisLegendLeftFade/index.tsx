import { ReactNode, useId } from 'react';

export type FadeStop = { offset: number; opacity: number };

const LEFT_FADE_WIDTH = 96;

const DEFAULT_FADE_STOPS: FadeStop[] = [
  { offset: 0, opacity: 0 },
  { offset: 0.62, opacity: 0.3 },
  { offset: 1, opacity: 1 },
];

export const EASED_FADE_STOPS: FadeStop[] = Array.from({ length: 9 }, (_, i) => {
  const t = i / 8;
  return { offset: t, opacity: t * t * (3 - 2 * t) };
});

interface AxisLegendLeftFadeProps {
  width: number;
  height: number;
  fadeWidth?: number;
  stops?: FadeStop[];
  active?: boolean;
  children: ReactNode;
}

// Safari ignores `mask-image` on svg nodes, using svg mask instead
export const AxisLegendLeftFade = ({
  width,
  height,
  fadeWidth = LEFT_FADE_WIDTH,
  stops = DEFAULT_FADE_STOPS,
  active = true,
  children,
}: AxisLegendLeftFadeProps) => {
  const id = `axis-left-fade-${useId().replace(/:/g, '')}`;
  const gradientId = `${id}-gradient`;
  const maskWidth = Math.max(width, 1);
  const maskHeight = Math.max(height, 1);

  return (
    <>
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={0}
          x2={fadeWidth}
          y1={0}
          y2={0}
        >
          {stops.map((stop) => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              stopColor="white"
              stopOpacity={stop.opacity}
            />
          ))}
        </linearGradient>
        <mask
          id={id}
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={maskWidth}
          height={maskHeight}
          // Without this the ramp is read in linearRGB and reads far darker
          colorInterpolation="sRGB"
        >
          <rect x={0} y={0} width={maskWidth} height={maskHeight} fill={`url(#${gradientId})`} />
        </mask>
      </defs>
      <g mask={active ? `url(#${id})` : undefined}>{children}</g>
    </>
  );
};
