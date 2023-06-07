import { Box, Button, Paper, Typography } from '@mui/material';
import { BigNumber, Contract, utils } from 'ethers';
import Image from 'next/image';
import * as React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import EARLY_TOKEN_GENERATION_ABI from 'src/maneki/abi/earlyTokenGenerationABI';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useTGEContext } from '../../hooks/tge-data-provider/TGEDataProvider';
import TGEMainContribution from './components/TGEMainContribution';

const TGEMainAction = () => {
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
    // BNBToContribute,
    // setBNBToContribute,
    userBalanceBNB,
    setUserBalanceBNB,
  } = useTGEContext();
  const [loading, setLoading] = React.useState<boolean>(true);
  const EARLY_TOKEN_GENERATION_ADDR = marketsData.bsc_testnet_v3.addresses
    .EARLY_TOKEN_GENERATION as string;

  React.useEffect(() => {
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

        setSaleStartDate(data[0].toString() as string); // sale start date (UNIX)
        setSaleEndDate(data[1].toString() as string); // sale end date (UNIX)
        setContributedBNB(data[2] as BigNumber); // contributed bnb (18 Decimals)
        setTotalRaisedBNB(data[3] as BigNumber); // total raised bnb (18 Decimals)
        setFinalPAWPrice(data[4] as BigNumber); // tge paw price (18 Decimals)
        setUserBalanceBNB(data[5] as BigNumber); // get user BNB balance (18 Decimals)
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
      <TGEMainContribution
        userBalanceBNB={userBalanceBNB}
        finalPAWPrice={finalPAWPrice}
        contributedBNB={contributedBNB}
      />
      <hr />
      <Box>
        <Typography variant="h2">TGE has {'status'}</Typography>
        <Box>
          <Typography>Event is {'Inactive'}</Typography>
          <Box>
            <Typography>Public Participation {'status'}</Typography>
            <Typography>{`Start Date: ${saleStartDate}`}</Typography>
            <Typography>{`End Date: ${saleEndDate}`}</Typography>
            {/*Time Function */}
            <Box>
              <Typography>Time function goes here</Typography>
            </Box>
          </Box>
        </Box>
        <Box>
          <Box>
            <Box>
              <Typography>Total Raised</Typography>
              <FormattedNumber value={utils.formatUnits(totalRaisedBNB, 18)} />
            </Box>
            <Image
              alt={`token image for PAW`}
              src={`/icons/tokens/paw.svg`}
              width={64}
              height={64}
            />
          </Box>
          <hr />
          <Box>
            <Button>Etherscan -{'>'}</Button>
            <Typography>{EARLY_TOKEN_GENERATION_ADDR}</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default TGEMainAction;
