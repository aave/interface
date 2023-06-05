import { BigNumber, Contract } from 'ethers';
import * as React from 'react';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useTGEContext } from '../../hooks/tge-data-provider/TGEDataProvider';
import MANEKI_DATA_PROVIDER_ABI from '../manage/DataABI';

const TGEBottomSect = () => {
  const { provider } = useWeb3Context();
  const {
    setFinalPAWPrice,
    setMarketCap,
    setInitialSupply,
    setTotalSupply,
    finalPAWPrice,
    marketCap,
    initialSupply,
    totalSupply,
  } = useTGEContext();
  const [loading, setLoading] = React.useState<boolean>(true);

  const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;

  React.useEffect(() => {
    // create contracts
    const contract = new Contract(MANEKI_DATA_PROVIDER_ADDR, MANEKI_DATA_PROVIDER_ABI, provider);
    const promises = [];

    // add contract call into promise arr
    promises.push(contract.getStakingAPR()); // final paw price
    promises.push(contract.getLockingAPR()); // marketcap
    promises.push(contract.getLockingAPR()); // initial supply
    promises.push(contract.getLockingAPR()); // total supply

    // call promise all and get data
    Promise.all(promises)
      .then((data: BigNumber[]) => {
        // dev change data setting logic here

        setFinalPAWPrice(data[0]);
        setMarketCap(data[1]);
        setInitialSupply(data[2]);
        setTotalSupply(data[3]);
        setLoading(false);
      })
      .catch((e) => console.error(e));
    //eslint-disable-next-line
  }, []);

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <div>
      <div>TGE PIKA PRICE {finalPAWPrice._hex}</div>
      <div>market cap {marketCap._hex}</div>
      <div>
        total supply {totalSupply._hex} initial supply {initialSupply._hex}
      </div>
    </div>
  );
};

export default TGEBottomSect;
