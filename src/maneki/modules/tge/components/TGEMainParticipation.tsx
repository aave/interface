import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Button, Divider, Typography, useMediaQuery, useTheme } from '@mui/material';
import { utils } from 'ethers';
import Image from 'next/image';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { useTGEContext } from 'src/maneki/hooks/tge-data-provider/TGEDataProvider';

import TGECountdownTimer from './TGECountdownTimer';

interface TGEMainParticipationType {
  EARLY_TOKEN_GENERATION_ADDR: string;
}

const TGEMainParticipation = ({ EARLY_TOKEN_GENERATION_ADDR }: TGEMainParticipationType) => {
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const { saleStartDate, saleEndDate, totalRaisedBNB } = useTGEContext();
  const status =
    Date.now() < saleStartDate
      ? 'Coming Soon'
      : saleStartDate < saleEndDate && Date.now() < saleEndDate
      ? 'Active'
      : 'Inactive';

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
        TGE {status === 'Active' ? 'is Ongoing' : status === 'Inactive' ? 'has Ended' : status}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: downToSM ? '16px' : '32px',
          p: '12px 16px',
          border: '1px solid #5D5D5B',
          borderRadius: '12px',
        }}
      >
        <Box>
          <Typography>Event is</Typography>
          <Typography
            sx={{
              fontWeight: '600',
              fontSize: '24px',
              lineHeight: '48px',
              color: '#FFA725',
            }}
          >
            {status}
          </Typography>
        </Box>
        <TGECountdownTimer
          targetDate={Date.now() < saleStartDate ? saleStartDate : saleEndDate}
          status={status === 'Active' ? 'Ongoing' : status === 'Inactive' ? 'Ended' : status}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          p: '12px 16px',
          border: '1px solid #5D5D5B',
          borderRadius: '12px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: '12px',
                lineHeight: '21px',
              }}
            >
              Total Raised
            </Typography>
            <FormattedNumber
              value={utils.formatUnits(totalRaisedBNB, 18)}
              symbol="BNB"
              sx={{
                fontWeight: 600,
                fontSize: '24px',
              }}
            />
          </Box>
          <Image alt={`token image for PAW`} src={`/icons/tokens/bnb.svg`} width={42} height={42} />
        </Box>
        <Divider />
        <Box>
          <Button
            sx={{
              fontWeight: 700,
              fontSize: '16px',
              lineHeight: '18px',
              p: '0',
              color: '#FFA725',
            }}
          >
            Etherscan <ArrowForwardIcon />
          </Button>
          <Typography
            sx={{
              fontWeight: 400,
              fontSize: '10px',
              lineHeight: '21px',
            }}
          >
            {EARLY_TOKEN_GENERATION_ADDR.slice(0, 6)}...{EARLY_TOKEN_GENERATION_ADDR.slice(-4)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TGEMainParticipation;
