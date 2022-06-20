import { Trans } from '@lingui/macro';
import * as React from 'react';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';

export const FaucetTopPanel = () => {
  const { currentMarketData } = useProtocolDataContext();
  return (
    <TopInfoPanel
      pageTitle={<Trans>{currentMarketData.marketTitle} Faucet</Trans>}
      withMarketSwitcher={true}
    />
  );
};
