import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { utils } from 'ethers';
import Image from 'next/image';
import * as React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { useModalContext } from 'src/hooks/useModal';
import CustomNumberInput from 'src/maneki/components/CustomNumberInput';
import { useTGEContext } from 'src/maneki/hooks/tge-data-provider/TGEDataProvider';

const TGEMainContribution = () => {
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const { userBalanceBNB, finalPAWPrice, contributedBNB, TGEStatus, PAWToReceive } =
    useTGEContext();
  const [contributionBNB, setContributionBNB] = React.useState<string>('');
  const { openTGE } = useModalContext();

  const handleContribute = () => {
    openTGE(contributionBNB);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: '24px 12px',
        gap: downToSM ? '24px' : '32px',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: '600',
          fontSize: downToSM ? '26px' : '32px',
          lineHeight: '48px',
        }}
      >
        <Trans>Contribute PAW</Trans>
      </Typography>
      <Box>
        <Typography>
          <Trans>Contribution Amount</Trans>
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
            disabled={TGEStatus !== 'Active' ? true : false}
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
        sx={{ padding: '12px', color: 'background.default' }}
        disabled={TGEStatus !== 'Active' ? true : false}
      >
        {TGEStatus === 'Active' ? 'Contribute' : 'Inactive'}
      </Button>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyItems: 'end',
          alignSelf: 'end',
          mt: downToSM ? '-8px' : '-18px',
        }}
      >
        <Typography
          sx={{
            fontSize: downToSM ? '10px' : '12px',
          }}
        >{`YOU HAVE CONTRIBUTED`}</Typography>

        <FormattedNumber
          sx={{ fontWeight: 600, fontSize: '16px', ml: 1 }}
          value={utils.formatUnits(contributedBNB, 18)}
          symbol="BNB"
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyItems: 'end',
          alignSelf: 'end',
          mt: downToSM ? '-18px' : '-24px',
        }}
      >
        <Typography
          sx={{
            fontSize: downToSM ? '10px' : '12px',
          }}
        >
          YOU ARE ENTITLED TO
        </Typography>

        <FormattedNumber
          sx={{ fontWeight: 600, fontSize: '16px', ml: 1 }}
          value={utils.formatUnits(PAWToReceive, 18)}
          symbol="PAW"
        />
      </Box>
    </Box>
  );
};

export default TGEMainContribution;
