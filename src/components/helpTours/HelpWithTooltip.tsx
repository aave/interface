import { Box, ClickAwayListener, experimental_sx, Popper, styled, Tooltip } from '@mui/material';
import { JSXElementConstructor, ReactElement, ReactNode, useState } from 'react';
import { useHelpContext } from 'src/hooks/useHelp';
import { useModalContext } from 'src/hooks/useModal';

interface HelpWithTooltipProps {
  children: ReactNode;
  // eslint-disable-next-line
  tooltipContent: ReactElement<any, string | JSXElementConstructor<any>>;
  placement?: 'top-start' | 'bottom' | 'left-end' | 'left';
  open?: boolean;
  setOpen?: (value: boolean) => void;
  offset?: [number, number];
}

const PopperComponent = styled(Popper)(
  experimental_sx({
    '.MuiTooltip-tooltip': {
      backgroundColor: 'background.paper',
      color: 'text.primary',
      fontSize: 11,
      '@media only screen and (min-width: 960px)': {
        maxWidth: 260,
      },
      '@media only screen and (min-width: 1280px)': {
        maxWidth: 380,
      },
      marginBottom: 10,
      maxWidth: 384,
      maxHeight: 600,
      padding: '24px 36px',
      borderRadius: '10px',
      filter:
        'drop-shadow(0px 33px 43px rgba(0, 0, 0, 0.1)) drop-shadow(0px 9.94853px 12.9632px rgba(0, 0, 0, 0.0651589)) drop-shadow(0px 4.13211px 5.38427px rgba(0, 0, 0, 0.05)) drop-shadow(0px 1.4945px 1.94738px rgba(0, 0, 0, 0.0348411))',
    },
  })
);

export const HelpWithTooltip = ({
  children,
  tooltipContent,
  placement = 'top-start',
  open,
  setOpen,
  offset = [-7, 14],
}: HelpWithTooltipProps) => {
  const [openTooltip, setOpenTooltip] = useState(true);
  const { openConfirmationHelp } = useModalContext();
  const { pagination, tourInProgress, setPagination, setClickAway } = useHelpContext();

  const formattedOpen = typeof open !== 'undefined' ? open : openTooltip;
  const toggleOpen = () =>
    typeof setOpen !== 'undefined' ? setOpen(!formattedOpen) : setOpenTooltip(!formattedOpen);

  const handleClose = () => {
    if (typeof setOpen !== 'undefined') {
      setOpen(false);
    } else {
      setOpenTooltip(false);
    }
    (pagination['SupplyTour'] === 1 || pagination['SupplyTour'] === 8) &&
      tourInProgress === 'Supply Tour' &&
      setPagination(9);
    (pagination['WithdrawTour'] === 1 || pagination['WithdrawTour'] === 7) &&
      tourInProgress === 'Withdrawal Tour' &&
      setPagination(9);
    openConfirmationHelp();
    setClickAway(false);
  };

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
            sx={{
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
    >
      <Box
        sx={{ display: 'inline-flex', cursor: 'pointer' }}
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
