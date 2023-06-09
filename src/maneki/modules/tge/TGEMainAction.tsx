import { Divider, Paper, useMediaQuery, useTheme } from '@mui/material';
import { BigNumber, Contract } from 'ethers';
import { useEffect, useState } from 'react';
import EARLY_TOKEN_GENERATION_ABI from 'src/maneki/abi/earlyTokenGenerationABI';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { TGEStatusType, useTGEContext } from '../../hooks/tge-data-provider/TGEDataProvider';
import TGEMainContribution from './components/TGEMainContribution';
import TGEMainParticipation from './components/TGEMainParticipation';

const TGEStatusGenerator = (saleStartDate: number, saleEndDate: number): TGEStatusType => {
  const currentTime = Date.now();
  if (currentTime < saleStartDate) return 'Coming Soon';
  else if (saleStartDate < saleEndDate && currentTime < saleEndDate) return 'Active';
  else if (currentTime > saleEndDate) return 'Ended';
  else return 'Inactive';
};

const TGEMainAction = () => {
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const { provider, currentAccount } = useWeb3Context();
  const {
    setFinalPAWPrice,
    setSaleStartDate,
    setSaleEndDate,
    setTotalRaisedBNB,
    setContributedBNB,
    // BNBToContribute,
    // setBNBToContribute,
    setUserBalanceBNB,
    setTGEStatus,
  } = useTGEContext();
  const [loading, setLoading] = useState<boolean>(true);
  const EARLY_TOKEN_GENERATION_ADDR = marketsData.bsc_testnet_v3.addresses
    .EARLY_TOKEN_GENERATION as string;

  useEffect(() => {
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
        setFinalPAWPrice(data[4] as BigNumber); // tge paw price (18 Decimals)
        setUserBalanceBNB(data[5] as BigNumber); // get user BNB balance (18 Decimals)
        setTGEStatus(
          TGEStatusGenerator(
            (data[0] as BigNumber).toNumber() * 1000,
            (data[1] as BigNumber).toNumber() * 1000
          )
        );
        setLoading(false);
      })
      .catch((e) => console.error(e));
    //eslint-disable-next-line
  }, []);

  if (loading) {
    return <ManekiLoadingPaper description="Loading..." withCircle />;
  }

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: downToSM ? 'column' : 'row',
        justifyContent: 'space-around',
        gap: downToSM ? '24px' : '0px',
        alignItems: downToSM ? 'center' : 'normal',
        boxShadow: '0px 10px 30px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        p: downToSM ? '24px 0px' : '46px',
      }}
    >
      <TGEMainContribution />
      <Divider
        sx={(theme) => ({
          border: `1px solid ${theme.palette.divider}`,
          m: downToSM ? 'auto' : '24px 0px',
          width: downToSM ? '85%' : '',
        })}
      />

      <TGEMainParticipation EARLY_TOKEN_GENERATION_ADDR={EARLY_TOKEN_GENERATION_ADDR} />
    </Paper>
  );
};

export default TGEMainAction;
