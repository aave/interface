import { Box, Paper, Typography } from '@mui/material';
import { BigNumber, Contract } from 'ethers';
import * as React from 'react';
import EARLY_TOKEN_GENERATION_ABI from 'src/maneki/abi/earlyTokenGenerationABI';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useTGEContext } from '../../hooks/tge-data-provider/TGEDataProvider';

const TGEMainSect = () => {
  const { provider, currentAccount } = useWeb3Context();
  const {
    finalPAWPrice,
    setFinalPAWPrice,
    saleStartDate,
    setSaleStartDate,
    saleEndDate,
    setSaleEndDate,
    totalRaisedBNB,
    setTotalRaisedBNB,
    contributedBNB,
    setContributedBNB,
    BNBToContribute,
    setBNBToContribute,
    // userBalanceBNB,
    setUserBalanceBNB,
  } = useTGEContext();
  const [loading, setLoading] = React.useState<boolean>(true);
  // const [contributionBNB, setContributionBNB] = React.useState<BigNumber>(BigNumber.from(0));
  const EARLY_TOKEN_GENERATION_ADDR = marketsData.bsc_testnet_v3.addresses
    .EARLY_TOKEN_GENERATION as string;

  const handleContribute = async () => {
    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(EARLY_TOKEN_GENERATION_ADDR, EARLY_TOKEN_GENERATION_ABI, signer);
    // need to use await and await primises.wait(1);
    const promises = [];

    // add contract call into promise arr
    promises.push(contract.deposit(BNBToContribute, currentAccount, null)); // claim / contribute action

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
    const contract = new Contract(
      EARLY_TOKEN_GENERATION_ADDR,
      EARLY_TOKEN_GENERATION_ABI,
      provider
    );
    const promises = [];

    // add contract call into promise arr
    promises.push(contract.saleStart()); // sale start date (UNIX)
    promises.push(contract.saleClose()); // sale end date (UNIX)
    promises.push(contract.deposits(currentAccount)); // contributed bnb (18 Decimals)
    promises.push(contract.weiDeposited()); // total raised (18 Decimals)
    promises.push(contract.salesPrice()); // final PAW Price (18 Decimals)
    promises.push(provider?.getBalance(currentAccount)); // get user BNB balance
    // call promise all and get data
    Promise.all(promises)
      .then((data: (BigNumber | string)[]) => {
        // dev change data setting logic here

        setSaleStartDate(data[0].toString() as string);
        setSaleEndDate(data[1].toString() as string);
        setContributedBNB(data[2] as BigNumber);
        setTotalRaisedBNB(data[3] as BigNumber);
        setFinalPAWPrice(data[4] as BigNumber);
        setUserBalanceBNB(data[5] as BigNumber);
        setLoading(false);
      })
      .catch((e) => console.error(e));
    //eslint-disable-next-line
  }, []);

  if (loading) {
    return <ManekiLoadingPaper description="Loading..." withCircle />;
  }

  return (
    <Paper>
      <Box>
        <Typography variant="h2">Contribute PAW</Typography>
      </Box>
      <input
        placeholder="amount to contribute"
        value={BNBToContribute}
        onChange={(e) => setBNBToContribute(e.target.value)}
      />
      <input placeholder="amount to receive (amt to contribute * price)" disabled />
      <button onClick={handleContribute}>Contribute / claim</button>
      <div>saleStartDate {saleStartDate}</div>
      <div>saleEndDate {saleEndDate}</div>
      <div>Total raised {totalRaisedBNB.toString()}</div>
      <div>You contributed {contributedBNB.toString()}</div>
      <div>Paw price {finalPAWPrice.toString()}</div>
      <hr />
    </Paper>
  );
};

export default TGEMainSect;
