import { line, LinePathConfig } from '@visx/shape';
import { motion, SVGMotionProps } from 'motion/react';
import { Ref } from 'react';

type MotionLinePathProps<Datum> = {
  data?: Datum[];
  getX: (d: Datum) => number;
  getY: (d: Datum) => number;
  innerRef?: Ref<SVGPathElement>;
  fill?: string;
  className?: string;
  isSelected?: boolean;
  disableInitialAnimation?: boolean;
} & Pick<LinePathConfig<Datum>, 'curve' | 'defined'> &
  Omit<SVGMotionProps<SVGPathElement>, 'ref' | 'd' | 'fill'>;

const EMPTY_DATA: never[] = [];

export const MotionLinePath = <Datum,>({
  data = EMPTY_DATA,
  getX,
  getY,
  fill = 'transparent',
  className = '',
  curve,
  innerRef,
  defined = () => true,
  isSelected = false,
  disableInitialAnimation = false,
  ...restProps
}: MotionLinePathProps<Datum>) => {
  const path = line<Datum>({ x: getX, y: getY, defined, curve });

  return (
    <motion.path
      ref={innerRef}
      className={`visx-linepath ${className}`}
      initial={{ d: 'M0,0 L0,0', opacity: isSelected ? 1 : 0 }}
      animate={{
        d: path(data) || '',
        opacity: isSelected ? 1 : 0,
      }}
      exit={{ opacity: isSelected ? 1 : 0 }}
      transition={{
        ease: [0.4, 0.0, 0.2, 1],
        duration: disableInitialAnimation ? 0 : 0.3,
        type: 'tween',
      }}
      fill={fill}
      strokeLinecap="round"
      {...restProps}
    />
  );
};
