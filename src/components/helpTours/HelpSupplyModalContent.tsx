import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/solid';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { useHelpContext } from 'src/hooks/useHelp';
import { useModalContext } from 'src/hooks/useModal';

import { uiConfig } from '../../uiConfig';
import { Link } from '../primitives/Link';
import { HelpBubble } from './HelpBubble';

export const HelpModalSupplyContent = () => {
  const { pagination, totalPagination, setPagination } = useHelpContext();
  const { close } = useModalContext();

  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.down('xsm'));

  let title, description, top, right;
  const page = pagination['SupplyTour' as keyof typeof pagination];

  const handleNextClick = () => {
    setPagination(page + 1);
    pagination['SupplyTour'] === 7 && close();
  };

  const handlePreviousClick = () => {
    setPagination(page - 1);
    pagination['SupplyTour'] === 2 && close();
  };

  switch (pagination['SupplyTour']) {
    case 2:
      title = 'Supply an asset';
      description = "Select the amount you'd like to supply.";
      top = '130px';
      right = xsm ? '320px' : '360px';
      break;
    case 3:
      title = 'How much will I earn?';
      description = (
        <Box>
          <Typography sx={{ mt: 1 }}>
            aTokens holders receive continuous earnings that evolve with market conditions based on:
          </Typography>
          <Typography sx={{ mt: 2, mb: 3 }}>
            Each asset has its own market of supply and demand with its own APY (Annual Percentage
            Yield) which evolves with time.
          </Typography>
          <Link
            href="https://docs.aave.com/faq/depositing-and-earning"
            sx={{ textDecoration: 'none', color: '#F148D3' }}
          >
            <Typography>Learn more</Typography>
          </Link>
        </Box>
      );
      top = '210px';
      right = xsm ? '320px' : '360px';
      break;
    case 4:
      title = 'Collateralization';
      description = (
        <Typography>
          After supplying your assets, you are able to unselect the asset so that it will not be
          used as collateral. The opt-out is available in the &quot;Supply&quot; section within your
          dashboard. Simply switch the &quot;use as collateral&quot; button on the asset you would
          prefer to opt-out from being used as a collateral.
        </Typography>
      );
      top = '240px';
      right = xsm ? '320px' : '360px';
      break;
    case 5:
      title = 'Gas Fee Stimation';
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
      top = '270px';
      right = xsm ? '320px' : '360px';
      break;
    case 6:
      title = 'Approval for first supply';
      description = (
        <Typography>
          The first supply of one asset will require an additional approval transaction on your
          wallet.
        </Typography>
      );
      top = '320px';
      right = xsm ? '25px' : '55px';
      break;
    case 7:
      title = 'Approval for first supply';
      description = (
        <Typography sx={{ mt: 1 }}>
          Submit your transaction. Once the transaction is confirmed, your supply is successfully
          registered and you begin earning interest.
          <Typography sx={{ mt: 4 }}>You can use different Wallets. Discover wallets</Typography>
        </Typography>
      );
      top = '360px';
      right = xsm ? '25px' : '55px';
      break;
    default:
      title = 'Supply an asset';
      description = `Select the amount you'd like to supply.`;
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
              ? uiConfig.helpModalSupplyImageLight
              : uiConfig.helpModalSupplyImageDark
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
                <Box />
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
