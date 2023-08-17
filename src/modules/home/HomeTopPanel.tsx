import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import * as React from 'react';
import { PageTitle } from 'src/components/TopInfoPanel/PageTitle';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';

export const HomeTopPanel = () => {
  return (
    <>
      <TopInfoPanel>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box mb={4}>
            <img src={'/apple-touch-icon.png'} alt={'moonCakeFi'} width={150} height={150} />
          </Box>
          <div>
            <PageTitle
              pageTitle={
                <Box>
                  <Trans>The Future Is Filled With Mooncakes</Trans>
                </Box>
              }
            />
            <div style={{ maxWidth: 700 }}>
              Introducing Mooncake finance, a decentralized money market deployed on Base and Linea.
              You can lend & borrow assets with the most capital efficiency.
            </div>
          </div>
        </Box>
        {/* <span style={{ maxWidth: 400 }}> */}
        {/* </span> */}
      </TopInfoPanel>
    </>
  );
};
