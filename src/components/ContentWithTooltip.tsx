import { Box, ClickAwayListener, Popper, styled, Tooltip } from '@mui/material';
import sx from '@mui/system/sx';
import { JSXElementConstructor, ReactElement, ReactNode, useState } from 'react';

interface ContentWithTooltipProps {
  children: ReactNode;
  // eslint-disable-next-line
  tooltipContent: ReactElement<any, string | JSXElementConstructor<any>>;
  placement?: 'top' | 'bottom';
  withoutHover?: boolean;
}

const PopperComponent = styled(Popper)(
  sx({
    '.MuiTooltip-tooltip': {
      color: 'text.primary',
      backgroundColor: 'background.paper',
      p: 0,
      borderRadius: '6px',
      boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
    },
    '.MuiTooltip-arrow': {
      color: 'background.paper',
      '&:before': {
        boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
      },
    },
  })
);

export const ContentWithTooltip = ({
  children,
  tooltipContent,
  placement = 'top',
  withoutHover,
}: ContentWithTooltipProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip
      open={open}
      onClose={() => setOpen(false)}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      placement={placement}
      PopperComponent={PopperComponent}
      title={
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Box
            sx={{
              py: 4,
              px: 6,
              fontSize: '12px',
              lineHeight: '16px',
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
          '&:hover': { opacity: withoutHover ? 1 : open ? 1 : 0.5 },
        }}
        onClick={() => setOpen(true)}
      >
        {children}
      </Box>
    </Tooltip>
  );
};
