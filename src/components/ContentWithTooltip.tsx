import { Box, ClickAwayListener, Popper, styled, Tooltip } from '@mui/material';
import { JSXElementConstructor, ReactElement, ReactNode, useState } from 'react';
import { figVars } from 'src/utils/figmaColors';

interface ContentWithTooltipProps {
  children: ReactNode;
  // eslint-disable-next-line
  tooltipContent: ReactElement<any, string | JSXElementConstructor<any>>;
  placement?: 'right' | 'left' | 'bottom';
  withoutHover?: boolean;
  open?: boolean;
  setOpen?: (value: boolean) => void;
  offset?: [number, number];
}

export const PopperComponent = styled(Popper)(({ theme }) =>
  theme.unstable_sx({
    // Solid bg-5 tooltip surface, framed by an inset border-0 hairline + a soft shadow-medium
    // drop. Padding lives here (not the inner Box).
    '.MuiTooltip-tooltip': {
      color: 'fg-1',
      backgroundColor: 'bg-5',
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
    '.MuiTooltip-arrow': {
      color: 'bg-5',
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
