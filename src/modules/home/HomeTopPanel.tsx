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
                  <Trans>The Future is Filled With Mooncakes</Trans>
                </Box>
              }
            />
            <div>
              Introducing Mooncake finance, a decentralized money market deployed on Base and Linea.
            </div>
          </div>
        </Box>
        {/* <span style={{ maxWidth: 400 }}> */}
        {/* </span> */}
      </TopInfoPanel>
    </>
  );
};
