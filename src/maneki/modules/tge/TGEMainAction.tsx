import { Box, Button, Paper, Typography } from '@mui/material';
import { BigNumber, Contract, utils } from 'ethers';
import Image from 'next/image';
import * as React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import EARLY_TOKEN_GENERATION_ABI from 'src/maneki/abi/earlyTokenGenerationABI';
import CustomNumberInput from 'src/maneki/components/CustomNumberInput';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useTGEContext } from '../../hooks/tge-data-provider/TGEDataProvider';

const TGEMainAction = () => {
  const { provider, currentAccount } = useWeb3Context();
  const {
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
  const [contributionBNB, setContributionBNB] = React.useState<string>('');
  const [contributionPAW, setContributionPAW] = React.useState<string>('');
  const EARLY_TOKEN_GENERATION_ADDR = marketsData.bsc_testnet_v3.addresses
    .EARLY_TOKEN_GENERATION as string;

  const handleContribute = async () => {
    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(EARLY_TOKEN_GENERATION_ADDR, EARLY_TOKEN_GENERATION_ABI, signer);
    // need to use await and await primises.wait(1);
    try {
      const promise = await contract.deposit(currentAccount, '', {
        value: utils.parseEther(contributionBNB),
      });
      await promise.wait(1);
      alert('Contribution Success');
    } catch (error) {
      alert(error.message);
    }
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
      <Box>
        <Typography variant="h2">Contribute PAW</Typography>
        <Box>
          <Typography>You have contributed</Typography>
          <Box>
            <Image
              alt={`token image for BNB`}
              src={`/icons/tokens/bnb.svg`}
              width={24}
              height={24}
            />
            <CustomNumberInput
              amountTo={contributionBNB}
              setAmountTo={setContributionBNB}
              tokenBalance={utils.formatUnits(userBalanceBNB, 18)}
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused': {
                  '& > fieldset': {
                    borderColor: 'orange',
                  },
                },
              }}
            />
            <Typography>BNB</Typography>
          </Box>
        </Box>
        <Box>
          <Typography>Amount to Claim</Typography>
          <Box>
            <Image
              alt={`token image for PAW`}
              src={`/icons/tokens/paw.svg`}
              width={24}
              height={24}
            />
            <CustomNumberInput
              amountTo={contributionPAW}
              setAmountTo={setContributionPAW}
              tokenBalance={'99999999999'}
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused': {
                  '& > fieldset': {
                    borderColor: 'orange',
                  },
                },
              }}
              disabled
            />
            <Typography>PAW</Typography>
          </Box>
        </Box>
        <Button variant="contained" onClick={handleContribute}>
          Contribute
        </Button>
        <Typography>{`YOU HAVE CONTRIBUTED ${contributedBNB} BNB`}</Typography>
      </Box>
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
