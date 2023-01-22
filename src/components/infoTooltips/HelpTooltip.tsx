import { XIcon } from '@heroicons/react/outline';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/solid';
import {
  Box,
  Button,
  IconButton,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ReactNode } from 'react';
import { useHelpContext } from 'src/hooks/useHelp';
import { useModalContext } from 'src/hooks/useModal';

import { HelpBubble } from '../helpTours/HelpBubble';
import { HelpWithTooltip } from '../helpTours/HelpWithTooltip';

interface HelpTooltipProps {
  title: string;
  description: ReactNode;
  pagination: number;
  top: string;
  right: string;
  placement: 'top-start' | 'bottom' | 'left-end' | 'left';
  offset: [number, number];
}

export const HelpTooltip = ({
  title,
  description,
  pagination,
  top,
  right,
  placement,
  offset,
}: HelpTooltipProps) => {
  const { setPagination, totalPagination, tourInProgress, clickAway, helpTourAsset } =
    useHelpContext();
  const { openSupply, openWithdraw, openMobileHelp, openConfirmationHelp, close } =
    useModalContext();
  const { breakpoints } = useTheme();

  const md = useMediaQuery(breakpoints.down('md'));

  const handleNextClick = () => {
    setPagination(pagination + 1);
    if (tourInProgress === 'Supply Tour') {
      pagination === 1 && !md && openSupply(helpTourAsset);
      pagination === 7 && close();
    } else if (tourInProgress === 'Withdrawal Tour') {
      pagination === 1 && !md && openWithdraw(helpTourAsset);
      pagination === 6 && close();
    }
    pagination === 1 && md && openMobileHelp();
  };

  const handlePreviousClick = () => {
    setPagination(pagination - 1);
    if (tourInProgress === 'Supply Tour') {
      pagination === 2 && close();
      pagination === 8 && md && openMobileHelp();
      pagination === 8 && !md && openSupply(helpTourAsset);
    } else if (tourInProgress === 'Withdrawal Tour') {
      pagination === 2 && close();
      pagination === 7 && md && openMobileHelp();
      pagination === 7 && !md && openWithdraw(helpTourAsset);
    }
  };

  const handleClose = () => {
    (pagination === 1 || pagination === 8) && tourInProgress === 'Supply Tour' && setPagination(9);
    (pagination === 1 || pagination === 7) &&
      tourInProgress === 'Withdrawal Tour' &&
      setPagination(9);
    close();
    openConfirmationHelp();
  };

  const finishTour = () => {
    setPagination(1);
    localStorage.setItem(tourInProgress, 'true');
  };

  return (
    <HelpWithTooltip
      setOpen={handleClose}
      placement={placement}
      offset={offset}
      tooltipContent={
        <Box>
          <Box sx={{ mb: '12px' }}>
            <Box>
              <Typography sx={{ fontSize: '18px', fontWeight: 700, lineHeight: '22px' }}>
                {title}
              </Typography>
              {pagination !== totalPagination && (
                <Box sx={{ position: 'absolute', top: '24px', right: '50px', zIndex: 5 }}>
                  <IconButton
                    sx={{
                      borderRadius: '50%',
                      p: 0,
                      minWidth: 0,
                      position: 'absolute',
                      bgcolor: 'background.paper',
                      ml: 2,
                    }}
                    onClick={handleClose}
                    data-cy={'close-button'}
                  >
                    <SvgIcon sx={{ fontSize: '20px', color: 'text.primary' }}>
                      <XIcon data-cy={'CloseModalIcon'} />
                    </SvgIcon>
                  </IconButton>
                </Box>
              )}
            </Box>
            <Typography sx={{ mt: '12px' }}>{description}</Typography>
          </Box>
          <Box
            sx={
              !clickAway
                ? {
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', lg: 'row' },
                    height: { xs: '64px' },
                    mt: 4,
                  }
                : {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    flexDirection: { xs: 'column', lg: 'row' },
                    height: { xs: '64px' },
                    mt: 4,
                  }
            }
          >
            {!clickAway && (
              <Typography sx={{ mt: '12px' }}>
                {pagination}/{totalPagination}
              </Typography>
            )}
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'flex-end', md: 'space-between' },
                height: { md: '30px' },
                mt: { md: 3 },
              }}
            >
              {pagination !== 1 && !clickAway ? (
                <Button
                  onClick={handlePreviousClick}
                  variant="contained"
                  sx={{ mr: { lg: '15px' } }}
                >
                  <ArrowLeftIcon style={{ height: '15.56px', width: '16px' }} />
                  <Typography>Previous</Typography>
                </Button>
              ) : (
                <Box />
              )}

              {pagination !== totalPagination ? (
                <Button onClick={handleNextClick} variant="contained" sx={{ ml: '15px' }}>
                  <Typography>Next</Typography>
                  <ArrowRightIcon style={{ height: '15.56px', width: '16px' }} />
                </Button>
              ) : (
                <Button onClick={finishTour} variant="contained" sx={{ ml: '15px' }}>
                  <Typography>Got it!</Typography>
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      }
    >
      <HelpBubble top={top} right={right} />
    </HelpWithTooltip>
  );
};
