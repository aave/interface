import { Box } from '@mui/material';
import { ReactNode, useEffect, useRef } from 'react';
import { motion } from 'src/utils/motion';

interface AutoResizerProps {
  children: ReactNode;
  overflow?: boolean;
  duration?: number;
  ease?: string;
  property?: 'height' | 'width' | 'both';
}

export const AutoResizer = ({
  children,
  overflow = false,
  duration = 100,
  ease = motion.easing.smooth,
  property = 'height',
}: AutoResizerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { height, width } = entries[0].contentRect;
      const container = containerRef.current;
      if (!container) return;

      container.style.height =
        property === 'height' || property === 'both' ? `${height}px` : 'auto';
      container.style.width = property === 'width' || property === 'both' ? `${width}px` : 'auto';
    });

    resizeObserver.observe(content);
    return () => resizeObserver.disconnect();
  }, [property]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const trackHeightTransition = (animating: boolean) => (event: TransitionEvent) => {
      if (event.propertyName === 'height') {
        container.setAttribute('data-container-animating', String(animating));
      }
    };
    const handleTransitionStart = trackHeightTransition(true);
    const handleTransitionEnd = trackHeightTransition(false);

    container.addEventListener('transitionstart', handleTransitionStart);
    container.addEventListener('transitionend', handleTransitionEnd);
    return () => {
      container.removeEventListener('transitionstart', handleTransitionStart);
      container.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      data-container-animating="false"
      style={{
        overflow: overflow ? 'visible' : 'hidden',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: ease,
        transitionProperty: property === 'both' ? 'height, width' : property,
      }}
      sx={{
        '&:has(div[data-container-animating="true"])': { transitionDuration: '0ms !important' },
      }}
    >
      <div ref={contentRef}>{children}</div>
    </Box>
  );
};
