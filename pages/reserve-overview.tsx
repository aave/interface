import { Container, Grid } from '@mui/material';
import { MainLayout } from 'src/layouts/MainLayout';
import { ReserveConfiguration } from 'src/modules/reserve-overview/ReserveConfiguration';
import { ReserveActions } from 'src/modules/reserve-overview/ReserveActions';
import { ReserveTopDetails } from 'src/modules/reserve-overview/ReserveTopDetails';
import { useRouter } from 'next/router';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';

export default function ReserveOverview() {
  const router = useRouter();
  const { reserves } = useAppDataContext();
  const underlyingAddress = router.query.underlyingAddress;
  const reserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAddress
  ) as ComputedReserveData;
  return (
    <Container maxWidth="xl">
      <ReserveTopDetails />

      <Grid container spacing={4}>
        {/** Main status and configuration panel*/}
        <Grid item xs={12} sm={8}>
          {reserve && <ReserveConfiguration reserve={reserve} />}
        </Grid>

        {/** Right panel with actions*/}
        <Grid item xs={12} sm={4}>
          <ReserveActions />
        </Grid>
      </Grid>
    </Container>
  );
}

ReserveOverview.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
