import { BigNumber, Contract } from 'ethers';
import * as React from 'react';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useTGEContext } from '../../hooks/tge-data-provider/TGEDataProvider';
import MANEKI_DATA_PROVIDER_ABI from '../manage/DataABI';

const TGEMainSect = () => {
  const { provider, currentAccount } = useWeb3Context();
  const {
    finalPAWPrice,
    claimPhaseStart,
    setClaimPhaseStart,
    publicPhaseStart,
    setPublicPhaseStart,
    totalRaisedBNB,
    setTotalRaisedBNB,
    contributedBNB,
    setContributedBNB,
    BNBToContribute,
    setBNBToContribute,
  } = useTGEContext();
  const [loading, setLoading] = React.useState<boolean>(true);

  const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;

  const handleContribute = async () => {
    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(MANEKI_DATA_PROVIDER_ADDR, MANEKI_DATA_PROVIDER_ABI, signer);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.getStakingAPR()); // claim / contribute action

    Promise.all(promises)
      .then(() => {
        alert('OK');
      })
      .catch((e) => {
        console.error(e);
        alert('ERR');
      });
  };

  React.useEffect(() => {
    // create contracts
    const contract = new Contract(MANEKI_DATA_PROVIDER_ADDR, MANEKI_DATA_PROVIDER_ABI, provider);
    const promises = [];

    // add contract call into promise arr
    promises.push(contract.getStakingAPR()); // claim phase
    promises.push(contract.getLockingAPR()); // public phase
    promises.push(contract.getLockingAPR()); // RAISED BNB
    promises.push(contract.getLockingAPR()); // contributed bnb

    // call promise all and get data
    Promise.all(promises)
      .then((data: (BigNumber | string)[]) => {
        // dev change data setting logic here

        setClaimPhaseStart('12-12-1234');
        setPublicPhaseStart('12-12-1234');
        setTotalRaisedBNB(data[2] as BigNumber);
        setContributedBNB(data[3] as BigNumber);
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
      <input
        placeholder="amount to contribute"
        value={BNBToContribute}
        onChange={(e) => setBNBToContribute(e.target.value)}
      />
      <input placeholder="amount to receive (amt to contribute * price)" disabled />
      <button onClick={handleContribute}>Contribute / claim</button>
      <div>Claim phase {claimPhaseStart}</div>
      <div>Public phase {publicPhaseStart}</div>
      <div>Total raised {totalRaisedBNB._hex}</div>
      <div>You contributed {contributedBNB._hex}</div>
      <div>Paw price {finalPAWPrice._hex}</div>
      <hr />
    </div>
  );
};

export default TGEMainSect;
