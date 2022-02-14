import { Grid } from '@mui/material';
import { useRouter } from 'next/router';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { MainLayout } from 'src/layouts/MainLayout';
import { ReserveActions } from 'src/modules/reserve-overview/ReserveActions';
import { ReserveConfiguration } from 'src/modules/reserve-overview/ReserveConfiguration';
import { ReserveTopDetails } from 'src/modules/reserve-overview/ReserveTopDetails';

import { ContentContainer } from '../src/components/ContentContainer';

export default function ReserveOverview() {
  const router = useRouter();
  const { reserves } = useAppDataContext();
  const underlyingAsset = router.query.underlyingAsset as string;
  const reserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  return (
    <>
      <ReserveTopDetails underlyingAsset={underlyingAsset} />

      <ContentContainer>
        <Grid container spacing={4}>
          {/** Main status and configuration panel*/}
          <Grid item xs={12} sm={8}>
            {reserve && <ReserveConfiguration reserve={reserve} />}
          </Grid>

          {/** Right panel with actions*/}
          <Grid item xs={12} sm={4}>
            <ReserveActions underlyingAsset={underlyingAsset} />
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
}

ReserveOverview.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
