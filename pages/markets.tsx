import { Container } from '@mui/material';
import { MainLayout } from 'src/layouts/MainLayout';
import AssetsList from 'src/modules/markets/AssetsList';
import { MarketsTopPanel } from 'src/modules/markets/MarketsTopPanel';

export default function Markets() {
  return (
    <Container maxWidth="xl">
      <MarketsTopPanel />
      <AssetsList />
    </Container>
  );
}

Markets.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
