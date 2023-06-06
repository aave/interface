import { Paper, Typography } from '@mui/material';
import { BigNumber, Contract } from 'ethers';
import * as React from 'react';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useTGEContext } from '../../hooks/tge-data-provider/TGEDataProvider';
import MANEKI_DATA_PROVIDER_ABI from '../manage/DataABI';

const TGEPhaseInfo = () => {
  const { provider } = useWeb3Context();
  const { setFinalPAWPrice, setMarketCap, setInitialSupply, setTotalSupply } = useTGEContext();
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
    <>
      <Paper>
        <Typography variant="h2">Whitelist Phase</Typography>
        <Typography>
          For the first 24 hours, 6 million PAW tokens (6% of the supply) are available for
          whitelist participates at the fixed price of 0.0002 ETH(~$0.36) and the FDV of ~$36m with
          a market cap of ~$6.8m. Whitelist addresses are selected from historic vault users,
          traders and contributors. The allocation of each whitelist address depends on the historic
          activities. First 30 mins of the whitelist phase has a max deposit limit of 1 ETH for each
          address. Participation is on a first come first served basis and will end early if all the
          allocation is filled. Please note that being whitelisted does not guarantee a spot if all
          the allocation is filled early.
        </Typography>
      </Paper>
      <Paper>
        <Typography variant="h2">Important Risks</Typography>
        <Typography>
          U.S. residents or citizens are not permitted to participant in the Token Generation Event
          (TGE). By taking part in the event you certify you are neither a U.S. citizen or resident.
        </Typography>
      </Paper>
    </>
  );
};

export default TGEPhaseInfo;
