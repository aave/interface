import { Container, Grid } from '@mui/material';
import { MainLayout } from 'src/layouts/MainLayout';
import { ReserveConfiguration } from 'src/modules/reserve/ReserveConfiguration';
import { ReserveActions } from 'src/modules/reserve/ReserveActions';
import { ReserveTopDetails } from 'src/modules/reserve/ReserveTopDetails';

export default function ReserveOverview() {
  return (
    <Container maxWidth="xl">
      <ReserveTopDetails />

      <Grid container spacing={4}>
        {/** Main status and configuration panel*/}
        <Grid item xs={12} sm={8}>
          <ReserveConfiguration />
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
