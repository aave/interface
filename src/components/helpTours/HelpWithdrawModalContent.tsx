import React from 'react';
import { Box, Button, Typography, useTheme, useMediaQuery } from '@mui/material';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/solid';
import { uiConfig } from '../../uiConfig';

import { useHelpContext } from 'src/hooks/useHelp';
import { useModalContext } from 'src/hooks/useModal';

import { HelpBubble } from './HelpBubble';

export const HelpModalWithdrawContent = () => {
  const { pagination, totalPagination, setPagination } = useHelpContext();
  const { close } = useModalContext();

  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.down('xsm'));

  let title, description, top, right;
  const page = pagination['WithdrawTour' as keyof typeof pagination];

  const handleNextClick = () => {
    setPagination(page + 1);
    pagination['WithdrawTour'] === 6 && close();
  };

  const handlePreviousClick = () => {
    setPagination(page - 1);
    pagination['WithdrawTour'] === 2 && close();
  };

  switch (pagination['WithdrawTour']) {
    case 2:
      title = 'Withdraw an asset';
      description = "Select the amount you'd like to withdraw from AAVE.";
      top = '130px';
      right = xsm ? '320px' : '350px';
      break;
    case 3:
      title = 'Transaction overview';
      description = (
        <Box>
          <Typography sx={{ my: 1, fontWeight: 700 }}>Remaining supply</Typography>
          <Typography>
            This is the amount of assets that will be left on the protocol after the withdrawal has
            been submitted
          </Typography>
          <Typography sx={{ my: 1, fontWeight: 700 }}>Special Considerations</Typography>
          <Typography>
            When withdrawing assets like ETH, you will be given the option to Unwrap WETH.
          </Typography>
        </Box>
      );
      top = '210px';
      right = xsm ? '320px' : '350px';
      break;
    case 4:
      title = 'Gas Fee Estimation';
      description = (
        <Box>
          <Box sx={{ width: '149px', height: '52px' }}>
            <img
              src={
                localStorage.getItem('colorMode') === 'light' || !localStorage.getItem('colorMode')
                  ? uiConfig.gasEstationImageLight
                  : uiConfig.gasEstationImageDark
              }
              alt="SVG of a gas estation price fee"
            />
          </Box>
          <Typography sx={{ mt: 0 }}>
            This gas calculation is only an estimation. Your wallet will set the price of the
            transaction. You can modify the gas settings directly from your wallet provider.
          </Typography>
        </Box>
      );
      top = '300px';
      right = xsm ? '320px' : '340px';
      break;
    case 5:
      title = 'Withdraw your assets';
      description = (
        <Typography>
          This will trigger your wallet and you will need to sign your transaction.
        </Typography>
      );
      top = '330px';
      right = xsm ? '305px' : '330px';
      break;
    case 6:
      title = 'Approval for first supply';
      description = (
        <Typography sx={{ mt: 1 }}>
          Once the transaction is completed you will receive the tokens together with the rewards
          earned in your wallet.
        </Typography>
      );
      top = '330px';
      right = xsm ? '30px' : '65px';
      break;
    default:
      title = 'Withdraw an asset';
      description = "Select the amount you'd like to withdraw from AAVE.";
      top = undefined;
      right = undefined;
  }

  return (
    <Box sx={{ height: '650px' }}>
      {top && right !== undefined && <HelpBubble top={top} right={right} />}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <img
          src={
            localStorage.getItem('colorMode') === 'light' || !localStorage.getItem('colorMode')
              ? pagination['WithdrawTour'] !== 6
                ? uiConfig.helpModalWithdrawImageLight
                : uiConfig.helpModalWithdrawFinishImageLight
              : pagination['WithdrawTour'] !== 6
              ? uiConfig.helpModalWithdrawImageDark
              : uiConfig.helpModalWithdrawFinishImageDark
          }
          alt="SVG of approve and supply button"
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Box
        sx={{
          mb: '12px',
          minHeight: '252px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography sx={{ fontSize: '18px', fontWeight: 700, lineHeight: '22px', mt: 4 }}>
            {title}
          </Typography>
          <Typography sx={{ mt: '12px' }}>{description}</Typography>
        </Box>
        {page !== totalPagination && (
          <Box
            sx={{
              display: 'flex',
              mt: 4,
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', lg: 'row' },
              height: { xs: '64px' },
            }}
          >
            <Typography sx={{ my: '6px', height: '68px' }}>
              {page}/{totalPagination}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', height: '42px' }}>
              {page !== 1 ? (
                <Button onClick={handlePreviousClick} variant="contained" sx={{ mr: '30px' }}>
                  <ArrowLeftIcon style={{ height: '15.56px', width: '16px' }} />
                  <Typography>Previous</Typography>
                </Button>
              ) : (
                <Box></Box>
              )}
              <Button onClick={handleNextClick} variant="contained">
                <Typography>Next</Typography>
                <ArrowRightIcon style={{ height: '15.56px', width: '16px' }} />
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
