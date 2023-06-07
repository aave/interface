import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { BigNumber, Contract, utils } from 'ethers';
import Image from 'next/image';
import * as React from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import EARLY_TOKEN_GENERATION_ABI from 'src/maneki/abi/earlyTokenGenerationABI';
import CustomNumberInput from 'src/maneki/components/CustomNumberInput';
import { marketsData } from 'src/ui-config/marketsConfig';

interface TGEMainContributionType {
  userBalanceBNB: BigNumber;
  finalPAWPrice: BigNumber;
  contributedBNB: BigNumber;
}

const TGEMainContribution = ({
  userBalanceBNB,
  finalPAWPrice,
  contributedBNB,
}: TGEMainContributionType) => {
  const { provider, currentAccount } = useWeb3Context();

  const [contributionBNB, setContributionBNB] = React.useState<string>('');

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', p: '24px 24px', gap: '24px' }}>
      <Typography variant="h2">
        <Trans>Contribute PAW</Trans>
      </Typography>
      <Box>
        <Typography>
          <Trans>You have contributed</Trans>
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #D9D9D9',
            borderRadius: '12px',
            px: '12px',
            mt: '11px',
            '&:hover': {
              borderColor: 'orange',
            },
          }}
        >
          <Image alt={`token image for BNB`} src={`/icons/tokens/bnb.svg`} width={24} height={24} />
          <CustomNumberInput
            amountTo={contributionBNB}
            setAmountTo={setContributionBNB}
            tokenBalance={utils.formatUnits(userBalanceBNB, 18)}
            sx={{
              '& fieldset': {
                border: 'none',
              },
              '& .MuiOutlinedInput-root.Mui-focused': {
                '& > fieldset': {
                  border: 'none',
                  borderColor: 'orange',
                },
              },
            }}
            inputProps={{ style: { fontSize: '16px' } }}
          />
          <Typography sx={{ color: 'text.secondary' }}>BNB</Typography>
        </Box>
      </Box>
      <Box>
        <Typography>
          <Trans>Amount to Claim</Trans>
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #D9D9D9',
            borderRadius: '12px',
            p: '0 12px',
            mt: '11px',
            '&:hover': {
              borderColor: 'orange',
            },
          }}
        >
          <Image alt={`token image for PAW`} src={`/icons/tokens/paw.svg`} width={24} height={24} />
          {console.log(utils.formatUnits(finalPAWPrice, 18), finalPAWPrice.toString())}
          <CustomNumberInput
            amountTo={(
              Number(contributionBNB) / Number(utils.formatUnits(finalPAWPrice, 18))
            ).toString()}
            setAmountTo={setContributionBNB}
            tokenBalance={'99999999999'}
            sx={{
              '& fieldset': {
                border: 'none',
              },
              '& .MuiOutlinedInput-root.Mui-focused': {
                '& > fieldset': {
                  border: 'none',
                  borderColor: 'orange',
                },
              },
            }}
            inputProps={{ style: { fontSize: '16px' } }}
            disabled
          />
          <Typography>PAW</Typography>
        </Box>
      </Box>
      <Button
        variant="contained"
        onClick={handleContribute}
        sx={{ padding: '20px', color: 'background.default' }}
      >
        Contribute
      </Button>
      <Typography
        sx={{ fontSize: '10px', alignSelf: 'end', mt: '-12px' }}
      >{`YOU HAVE CONTRIBUTED ${contributedBNB} BNB`}</Typography>
    </Box>
  );
};

export default TGEMainContribution;
