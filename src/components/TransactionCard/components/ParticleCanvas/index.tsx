import { Box } from '@mui/material';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { TxStatus } from 'src/components/transactions/FlowCommons/TxStatusHeader';

import { ParticleController } from '../../utils/particleController';

const WRAPPER_SX = {
  position: 'absolute',
  inset: 0,
  top: '7.5rem',
  pointerEvents: 'none',
  '& canvas': { display: 'block', width: '100%', height: '100%' },
} as const;

const resolveColor = (el: HTMLElement) =>
  getComputedStyle(el).getPropertyValue('--tx-status-color').trim();

export const ParticleCanvas = ({ status }: { status: TxStatus }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<ParticleController | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const isEligible = status !== 'cancelled' && status !== 'expired';

  useEffect(() => {
    if (!canvasRef.current) return;
    const controller = new ParticleController(canvasRef.current);
    controllerRef.current = controller;
    return () => {
      controller.cleanUp();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controller = controllerRef.current;
    const canvas = canvasRef.current;
    if (!controller || !canvas) return;

    controller.setColor(resolveColor(canvas));

    if (isVisible && isEligible && !shouldReduceMotion) {
      controller.start();
      return () => controller.stop();
    }
    controller.stop();
    return undefined;
  }, [status, isVisible, isEligible, shouldReduceMotion]);

  return (
    <Box sx={WRAPPER_SX}>
      <canvas ref={canvasRef} />
    </Box>
  );
};
