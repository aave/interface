import { ReactNode } from 'react';

import { useHelpContext } from 'src/hooks/useHelp';
import { useModalContext } from 'src/hooks/useModal';

import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  SvgIcon,
} from '@mui/material';
import { HelpBubble } from '../helpTours/HelpBubble';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/solid';
import { XIcon } from '@heroicons/react/outline';
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
  const { openSupply, openSupplyHelp, openConfirmationHelp, close } = useModalContext();
  const { breakpoints } = useTheme();

  const md = useMediaQuery(breakpoints.down('md'));
  let pagesInTour;

  const page = window.location.href.split('/').pop();

  switch (page) {
    case 'withdraw':
      pagesInTour = totalPagination.withdrawPagination;
      break;
    default:
      pagesInTour = totalPagination.supplyPagination;
  }

  const handleNextClick = () => {
    setPagination(pagination + 1);
    pagination === 1 && tourInProgress === 'SupplyTour' && md && openSupplyHelp();
    pagination === 1 && tourInProgress === 'SupplyTour' && !md && openSupply(helpTourAsset);
    pagination === 7 && tourInProgress === 'SupplyTour' && close();
  };

  const handlePreviousClick = () => {
    setPagination(pagination - 1);
    pagination === 2 && tourInProgress === 'SupplyTour' && close();
    pagination === 8 && tourInProgress === 'SupplyTour' && md && openSupplyHelp();
    pagination === 8 && tourInProgress === 'SupplyTour' && !md && openSupply(helpTourAsset);
  };

  const handleClose = () => {
    if ((pagination === 1 || pagination === 8) && tourInProgress === 'SupplyTour') setPagination(9);
    close();
    openConfirmationHelp();
  };

  const finishTour = () => {
    setPagination(1);
    localStorage.setItem('SupplyTour', 'true');
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
              {pagination !== pagesInTour && (
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
                {pagination}/{pagesInTour}
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
                <Box></Box>
              )}
              {pagination !== pagesInTour ? (
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
