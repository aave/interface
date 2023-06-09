import { Trans } from '@lingui/macro';
import { BigNumber, Contract } from 'ethers';
import { useEffect } from 'react';
import EARLY_TOKEN_GENERATION_ABI from 'src/maneki/abi/earlyTokenGenerationABI';
import { TGEStatusGenerator } from 'src/maneki/utils/TGEStatusGenerator';

import { ConnectWalletPaper } from '../../../components/ConnectWalletPaper';
import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import ManekiLoadingPaper from '../../components/ManekiLoadingPaper';
import { useTGEContext } from '../../hooks/tge-data-provider/TGEDataProvider';
import TGEMainAction from './TGEMainAction';
import TGEMarketStat from './TGEMarketStat';
import TGEPhaseInfo from './TGEPhaseInfo';

export const TGEContainer = () => {
  const EARLY_TOKEN_GENERATION_ADDR = marketsData.bsc_testnet_v3.addresses
    .EARLY_TOKEN_GENERATION as string;
  const { currentAccount, loading: web3Loading, chainId, provider } = useWeb3Context();
  const {
    TGELoading,
    setFinalPAWPrice,
    setSaleStartDate,
    setSaleEndDate,
    setTotalRaisedBNB,
    setContributedBNB,
    setUserBalanceBNB,
    setTGEStatus,
    setTGELoading,
  } = useTGEContext();
  useEffect(() => {
    if (!TGELoading) return;
    // create contracts
    const contract = new Contract(
      EARLY_TOKEN_GENERATION_ADDR,
      EARLY_TOKEN_GENERATION_ABI,
      provider
    );
    const promises = [];

    // add contract call into promise arr
    promises.push(contract.saleStart()); //0 sale start date (UNIX)
    promises.push(contract.saleClose()); //1 sale end date (UNIX)
    promises.push(contract.deposits(currentAccount)); //2 contributed bnb (18 Decimals)
    promises.push(contract.weiDeposited()); //3 total raised bnb (18 Decimals)
    promises.push(contract.salesPrice()); //4 final PAW Price (18 Decimals)
    promises.push(provider?.getBalance(currentAccount)); //5 get user BNB balance
    // call promise all and get data
    Promise.all(promises)
      .then((data: (BigNumber | string)[]) => {
        // dev change data setting logic here
        setSaleStartDate((data[0] as BigNumber).toNumber() * 1000); // sale start date (UNIX)
        setSaleEndDate((data[1] as BigNumber).toNumber() * 1000); // sale end date (UNIX)
        setContributedBNB(data[2] as BigNumber); // contributed bnb (18 Decimals)
        setTotalRaisedBNB(data[3] as BigNumber); // total raised bnb (18 Decimals)
        console.log('data[4]', data[4]);
        setFinalPAWPrice(data[4] as BigNumber); // tge paw price (18 Decimals)
        setUserBalanceBNB(data[5] as BigNumber); // get user BNB balance (18 Decimals)
        setTGEStatus(
          TGEStatusGenerator(
            (data[0] as BigNumber).toNumber() * 1000,
            (data[1] as BigNumber).toNumber() * 1000
          )
        );
        setTGELoading(false);
      })
      .catch((e) => console.error(e));
    //eslint-disable-next-line
  }, [TGELoading, currentAccount, chainId]);

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

  if (TGELoading) {
    return <ManekiLoadingPaper description="Loading..." withCircle />;
  }

  return (
    <>
      {/* Main Section */}
      <TGEMainAction />

      <TGEMarketStat />
      {/* Bottom Section */}
      <TGEPhaseInfo />
    </>
  );
};
