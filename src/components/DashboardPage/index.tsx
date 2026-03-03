import { Badge, Box, Button, Typography } from '@mui/material';
import Image from 'next/image';
import AssetsTable from 'src/components/AssetsTable';
import Header from 'src/components/Header';
import InfoCard from 'src/components/InfoCard';
import MaxWidthContainer from 'src/components/MaxWidthContainer';
import { ModalType } from 'src/components/Modals/types';
import { useModalStore } from 'src/store/useModalStore';

import { FirstBlock, HorizontalDivider, RightContainer, V3 } from './styles';

export default function DashboardPage() {
  const openModal = useModalStore((s) => s.openModal);

  return (
    <>
      <Header />
      <MaxWidthContainer>
        <FirstBlock>
          <Box display="flex" flexDirection="column" alignItems="flex-start" gap={3}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Image src="/icons/networks/ethereum.svg" width={32} height={32} alt="ethereum" />
                <Typography variant="h4">Core Instance</Typography>
                <V3>
                  <Badge>V3</Badge>
                </V3>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Main Ethereum market with the largest selection of assets and yield options
              </Typography>
            </Box>
            <Button size="small" variant="outlined">
              view transactions
            </Button>
          </Box>
          <RightContainer>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Net worth
              </Typography>
              <Typography variant="h6">$ 0</Typography>
            </Box>
            <HorizontalDivider />
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Net APY
              </Typography>
              <Typography variant="h6" color="text.secondary">
                –
              </Typography>
            </Box>
            <HorizontalDivider />
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Net worth
              </Typography>
              <Box display="flex" gap={1} alignItems="center">
                <Typography variant="h6">$ 0</Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => openModal(ModalType.ClaimRewards, {})}
                >
                  CLAIM
                </Button>
              </Box>
            </Box>
          </RightContainer>
        </FirstBlock>

        <Box display="flex" gap={3} mt={4}>
          <InfoCard title="Your supplies" />
          <InfoCard title="Your borrows" extra="E-Mode" />
        </Box>

        <Box display="flex" gap={3} mt={4}>
          <AssetsTable type="supply" />
          <AssetsTable type="borrow" />
        </Box>
      </MaxWidthContainer>
    </>
  );
}
