import { useTheme } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import { unstable_useForkRef as useForkRef } from '@mui/utils';
import * as React from 'react';
import { Transition, TransitionStatus } from 'react-transition-group';
import { motion } from 'src/utils/motion';

// Force a reflow so the browser paints the "from" state before the transition runs.
const reflow = (node: HTMLElement) => node.scrollTop;

const resolveDuration = (timeout: TransitionProps['timeout'], mode: 'enter' | 'exit'): number =>
  typeof timeout === 'number' ? timeout : timeout?.[mode] ?? motion.duration.overlay;

// Base ("from") state is opacity 0 / scale 0.96; only the open state is declared here.
// `transition` is set imperatively in the callbacks so React re-renders never clear it.
const openStyles: Partial<Record<TransitionStatus, React.CSSProperties>> = {
  entering: { opacity: 1, transform: 'scale(1)' },
  entered: { opacity: 1, transform: 'scale(1)' },
};

export interface ScaleFadeProps extends Omit<TransitionProps, 'children'> {
  children: React.ReactElement;
}

/**
 * Shared overlay transition: opacity 0→1 + scale(0.96→1). Modeled on MUI's `Grow`
 * (which pops from a punchier 0.75). Wired as the default `TransitionComponent` for
 * popovers/menus/selects in the theme, and reusable by other overlays. It clones its
 * single child (no wrapper node) so it drops into MUI's Modal/Popover plumbing and
 * preserves the anchor-driven `transform-origin` that Popover sets on the node.
 */
export const ScaleFade = React.forwardRef<unknown, ScaleFadeProps>(function ScaleFade(props, ref) {
  const {
    children,
    in: inProp,
    appear = true,
    timeout = motion.duration.overlay,
    style,
    easing,
    onEnter,
    onEntering,
    onEntered,
    onExit,
    onExiting,
    onExited,
  } = props;

  const theme = useTheme();
  const nodeRef = React.useRef<HTMLElement>(null);
  const childRef = (children as React.ReactElement & { ref?: React.Ref<unknown> }).ref;
  const handleRef = useForkRef(nodeRef, childRef, ref);

  const resolveEasing = (mode: 'enter' | 'exit'): string => {
    if (typeof easing === 'string') return easing;
    if (easing && easing[mode]) return easing[mode] as string;
    return motion.easing.standard;
  };

  // With `nodeRef`, react-transition-group hands enter callbacks `isAppearing` and exit
  // callbacks nothing — but MUI's own callbacks expect the DOM node, so inject it.
  const normalize =
    (callback?: (node: HTMLElement, isAppearing: boolean) => void) =>
    (isAppearing?: boolean): void => {
      if (callback && nodeRef.current) {
        callback(nodeRef.current, isAppearing ?? false);
      }
    };

  const handleEnter = normalize((node, isAppearing) => {
    reflow(node);
    node.style.transition = theme.transitions.create(['opacity', 'transform'], {
      duration: resolveDuration(timeout, 'enter'),
      easing: resolveEasing('enter'),
    });
    onEnter?.(node, isAppearing);
  });

  const handleExit = normalize((node) => {
    node.style.transition = theme.transitions.create(['opacity', 'transform'], {
      duration: resolveDuration(timeout, 'exit'),
      easing: resolveEasing('exit'),
    });
    onExit?.(node);
  });

  return (
    <Transition<HTMLElement>
      appear={appear}
      in={inProp}
      nodeRef={nodeRef}
      timeout={timeout}
      onEnter={handleEnter}
      onEntering={normalize(onEntering)}
      onEntered={normalize(onEntered)}
      onExit={handleExit}
      onExiting={normalize(onExiting)}
      onExited={normalize(onExited)}
    >
      {(state) =>
        React.cloneElement(children, {
          style: {
            opacity: 0,
            transform: 'scale(0.96)',
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...openStyles[state],
            ...style,
            ...children.props.style,
          },
          ref: handleRef,
        })
      }
    </Transition>
  );
});
