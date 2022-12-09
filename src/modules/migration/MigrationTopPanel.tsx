import { Trans } from '@lingui/macro';
import { PageTitle } from 'src/components/TopInfoPanel/PageTitle';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';

import { getMarketInfoById } from '../../components/MarketSwitcher';
import { useProtocolDataContext } from '../../hooks/useProtocolDataContext';

export const MigrationTopPanel = () => {
  const { currentMarket } = useProtocolDataContext();
  const { market } = getMarketInfoById(currentMarket);

  return (
    <TopInfoPanel
      pageTitle={<></>}
      titleComponent={
        <PageTitle
          pageTitle={
            <Trans>
              Migrate from {market.marketTitle} V2 to {market.marketTitle} V3
            </Trans>
          }
        />
      }
    />
  );
};
