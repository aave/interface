import { Trans } from '@lingui/macro';

import { ConnectWalletPaper } from '../../../components/ConnectWalletPaper';
import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import ManekiLoadingPaper from '../../utils/ManekiLoadingPaper';
import TGEBottomSect from './TGEBottomSect';
import TGEMainSect from './TGEMainSect';

export const TGEContainer = () => {
  const { currentAccount, loading: web3Loading, chainId } = useWeb3Context();

  if (!currentAccount) {
    return (
      <ConnectWalletPaper
        loading={web3Loading}
        description={<Trans>Please connect your wallet to manage your PAW.</Trans>}
      />
    );
  }

  if (chainId != 97) {
    return <ManekiLoadingPaper description="Please connect to bsc testnet" />;
  }

  return (
    <>
      {/* Main Section */}
      <TGEMainSect />

      {/* Bottom Section */}
      <TGEBottomSect />
    </>
  );
};
