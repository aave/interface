import { Badge, Button, Typography } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import AssetsTable from 'src/components/AssetsTable';
import InfoCard from 'src/components/InfoCard';
import Layout from 'src/components/Layout';
import MaxWidthContainer from 'src/components/MaxWidthContainer';
import { ModalType } from 'src/components/Modals/types';
import { useDevice } from 'src/hooks';
import { useModalStore } from 'src/store/useModalStore';

import { DASHBOARD_TABLES } from './const';
import {
  CardsContainer,
  FirstBlock,
  HorizontalDivider,
  LeftContainer,
  RewardsRow,
  RightContainer,
  StatBlock,
  TablesContainer,
  TableSwitchContainer,
  TitleContainer,
  TitleRow,
  V3,
} from './styles';

export default function DashboardPage() {
  const openModal = useModalStore((s) => s.openModal);
  const { isTablet } = useDevice();
  const [table, setTable] = useState<DASHBOARD_TABLES>(DASHBOARD_TABLES.SUPPLY);

  return (
    <Layout>
      <MaxWidthContainer>
        <FirstBlock>
          <LeftContainer>
            <TitleContainer>
              <TitleRow>
                <Image src="/icons/networks/ethereum.svg" width={32} height={32} alt="ethereum" />
                <Typography variant="h4">Core Instance</Typography>
                <V3>
                  <Badge>V3</Badge>
                </V3>
              </TitleRow>
              <Typography variant="body2" color="#BDBDBD">
                Main Ethereum market with the largest selection of assets and yield options
              </Typography>
            </TitleContainer>
          </LeftContainer>
          <RightContainer>
            <StatBlock>
              <Typography variant="body2" color="text.secondary">
                Net worth
              </Typography>
              <Typography variant="h6">$ 0</Typography>
            </StatBlock>
            <HorizontalDivider />
            <StatBlock>
              <Typography variant="body2" color="text.secondary">
                Net APY
              </Typography>
              <Typography variant="h6" color="text.secondary">
                –
              </Typography>
            </StatBlock>
            <HorizontalDivider />
            <StatBlock>
              <Typography variant="body2" color="text.secondary">
                Net worth
              </Typography>
              <RewardsRow>
                <Typography variant="h6">$ 0</Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => openModal(ModalType.ClaimRewards, {})}
                >
                  CLAIM
                </Button>
              </RewardsRow>
            </StatBlock>
          </RightContainer>
        </FirstBlock>

        <TableSwitchContainer>
          <Button
            variant={table === DASHBOARD_TABLES.SUPPLY ? 'contained' : 'text'}
            color="inherit"
            fullWidth
            onClick={() => setTable(DASHBOARD_TABLES.SUPPLY)}
          >
            SUPPLY
          </Button>
          <Button
            variant={table === DASHBOARD_TABLES.BORROW ? 'contained' : 'text'}
            color="inherit"
            fullWidth
            onClick={() => setTable(DASHBOARD_TABLES.BORROW)}
          >
            BORROW
          </Button>
        </TableSwitchContainer>

        <CardsContainer>
          {(!isTablet || table === DASHBOARD_TABLES.SUPPLY) && <InfoCard title="Your supplies" />}
          {(!isTablet || table === DASHBOARD_TABLES.BORROW) && (
            <InfoCard title="Your borrows" extra="E-Mode" />
          )}
        </CardsContainer>

        <TablesContainer>
          {(!isTablet || table === DASHBOARD_TABLES.SUPPLY) && <AssetsTable type="supply" />}
          {(!isTablet || table === DASHBOARD_TABLES.BORROW) && <AssetsTable type="borrow" />}
        </TablesContainer>
      </MaxWidthContainer>
    </Layout>
  );
}
