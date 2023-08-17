import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import * as React from 'react';
import { PageTitle } from 'src/components/TopInfoPanel/PageTitle';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';

export const HomeTopPanel = () => {
  return (
    <>
      <TopInfoPanel
        titleComponent={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box mb={4}>
              <img src={'/apple-touch-icon.png'} alt={'moonCakeFi'} width={44} height={44} />
            </Box>
            <PageTitle
              pageTitle={
                <Box>
                  <Trans>Welcome to MoonCake!</Trans>
                </Box>
              }
            />
          </Box>
        }
      >
        The future of lending is filled Mooncakes. Introducing Mooncake finance, a decentralized
        lending protocol deployed on Base and Linea.
      </TopInfoPanel>
    </>
  );
};
