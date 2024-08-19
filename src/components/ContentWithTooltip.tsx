import { Box, ClickAwayListener, Popper, styled, Tooltip } from '@mui/material';
import { JSXElementConstructor, ReactElement, ReactNode, useState } from 'react';

interface ContentWithTooltipProps {
  children: ReactNode;
  // eslint-disable-next-line
  tooltipContent: ReactElement<any, string | JSXElementConstructor<any>>;
  placement?: 'top' | 'bottom';
  withoutHover?: boolean;
  open?: boolean;
  setOpen?: (value: boolean) => void;
  offset?: [number, number];
}

export const PopperComponent = styled(Popper)(({ theme }) => ({
  '.MuiTooltip-tooltip': {
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.secondary,
    padding: '0px',
    borderRadius: '8px',
    maxWidth: '280px',
    boxShadow: '0px 8px 16px -2px #1B212C1F',
  },
  '.MuiTooltip-arrow': {
    color: theme.palette.background.secondary,
  },
}));

export const ContentWithTooltip = ({
  children,
  tooltipContent,
  placement = 'top',
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
            sx={(theme) => ({
              p: 3,
              ...theme.typography.detail4,
              color: theme.palette.text.secondary,
              a: {
                fontSize: '13px',
                lineHeight: '16.9px',
                '&:hover': { textDecoration: 'underline' },
              },
            })}
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
