import { Box, Typography } from '@mui/material';
import { MainLayout } from 'src/layouts/MainLayout';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ContentContainer } from 'src/components/ContentContainer';
import { K613StakingPanel } from 'src/modules/k613-staking/K613StakingPanel';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

export default function StakingK613() {
  const { currentAccount } = useWeb3Context();

  return (
    <>
      <ContentContainer>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            K613 Staking
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Тестовая страница стейкинга. Подключите кошелёк и застейкайте K613.
          </Typography>
        </Box>

        {currentAccount ? (
          <K613StakingPanel />
        ) : (
          <ConnectWalletPaper
            description="Подключите кошелёк, чтобы стейкать K613 и просматривать баланс."
          />
        )}
      </ContentContainer>
    </>
  );
}

StakingK613.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
