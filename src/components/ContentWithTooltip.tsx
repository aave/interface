import { Box, ClickAwayListener, Popper, styled, Tooltip } from '@mui/material';
import { JSXElementConstructor, ReactElement, ReactNode, useState } from 'react';
import { figVars } from 'src/utils/figmaColors';
import { darkScheme } from 'src/utils/theme';

interface ContentWithTooltipProps {
  children: ReactNode;
  // eslint-disable-next-line
  tooltipContent: ReactElement<any, string | JSXElementConstructor<any>>;
  placement?: 'right' | 'left' | 'bottom';
  withoutHover?: boolean;
  open?: boolean;
  setOpen?: (value: boolean) => void;
  offset?: [number, number];
  /** `card` for panel-shaped content; leave as `tooltip` for a line or two of text. */
  variant?: 'tooltip' | 'card';
}

/** Set on the popper to pick the card surface; `PopperProps` has no room for a data attribute. */
const CARD_CLASS = 'content-tooltip-card';

export const PopperComponent = styled(Popper)(({ theme }) =>
  theme.unstable_sx({
    // The surface is a variable so the arrow can state that it matches, rather than repeating it.
    '--tooltip-surface': figVars['bg-5'],
    // Solid surface framed by an inset border-0 hairline + a soft shadow-medium drop. Padding
    // lives here (not the inner Box).
    '.MuiTooltip-tooltip': {
      color: 'fg-1',
      backgroundColor: 'var(--tooltip-surface)',
      borderRadius: '0.5rem',
      boxShadow: `0 1px 12px 0 ${figVars['shadow-medium']}, inset 0 0 0 1px ${figVars['border-0']}`,
      padding: '0.88rem',
      maxWidth: '250px',
      textAlign: 'center',
      whiteSpace: 'pre-wrap',
      textWrap: 'pretty',
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: '135%',
    },
    '.MuiTooltip-arrow': { color: 'var(--tooltip-surface)' },
    /**
     * The card surface: bg-3 in light, bg-4 in dark. The tooltip grey reads as a chip, which is
     * wrong under a panel of rows — and bg-4 alone would not have changed light mode, where it
     * sits a single step off bg-5.
     *
     * The two type rules are dropped rather than inherited: a panel of rows is read down its left
     * edge, and 250px is a caption budget that Merit's widest row already overflows.
     */
    [`&.${CARD_CLASS}`]: {
      '--tooltip-surface': figVars['bg-3'],
      ...darkScheme({ '--tooltip-surface': figVars['bg-4'] }),
      '.MuiTooltip-tooltip': { maxWidth: '20rem', textAlign: 'start' },
    },
  })
);

export const ContentWithTooltip = ({
  children,
  tooltipContent,
  placement = 'right',
  withoutHover,
  open,
  setOpen,
  offset,
  variant = 'tooltip',
}: ContentWithTooltipProps) => {
  const [openTooltip, setOpenTooltip] = useState(false);

  const formattedOpen = typeof open !== 'undefined' ? open : openTooltip;
  const toggleOpen = () =>
    typeof setOpen !== 'undefined' ? setOpen(!formattedOpen) : setOpenTooltip(!formattedOpen);
  const handleClose = () =>
    typeof setOpen !== 'undefined' ? setOpen(false) : setOpenTooltip(false);

  return (
    <Tooltip
      open={formattedOpen}
      onClose={handleClose}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      placement={placement}
      PopperComponent={PopperComponent}
      componentsProps={{
        popper: {
          className: variant === 'card' ? CARD_CLASS : undefined,
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: offset ?? [],
              },
            },
            {
              name: 'flip',
              options: {
                fallbackPlacements: ['left', 'bottom'],
              },
            },
          ],
          onClick: (e) => {
            e.stopPropagation();
          },
        },
      }}
      title={
        <ClickAwayListener
          mouseEvent="onMouseDown"
          touchEvent="onTouchStart"
          onClickAway={handleClose}
        >
          <Box
            sx={{
              // Padding lives on the tooltip surface (above); this Box just carries link styling.
              a: {
                fontSize: '12px',
                lineHeight: '16px',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' },
              },
            }}
          >
            {tooltipContent}
          </Box>
        </ClickAwayListener>
      }
      arrow
    >
      <Box
        sx={{
          display: 'inline-flex',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': { opacity: withoutHover ? 1 : formattedOpen ? 1 : 0.5 },
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleOpen();
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
};
