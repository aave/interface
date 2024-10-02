import { Trans } from '@lingui/macro';
import CallMadeOutlinedIcon from '@mui/icons-material/CallMadeOutlined';
import { Box, SvgIcon, Typography } from '@mui/material';
import { ReserveFactorTooltip } from 'src/components/infoTooltips/ReserveFactorTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { SCAN_TRANSACTION_TON } from 'src/hooks/app-data-provider/useAppDataProviderTon';
import { useRootStore } from 'src/store/root';
import { ExplorerLinkBuilderProps } from 'src/ui-config/networksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

interface ReserveFactorOverviewProps {
  collectorContract: string;
  explorerLinkBuilder: (props: ExplorerLinkBuilderProps) => string;
  reserveFactor: string;
  reserveName: string;
  reserveAsset: string;
}

export const ReserveFactorOverview = ({
  collectorContract,
  explorerLinkBuilder,
  reserveFactor,
  reserveName,
  reserveAsset,
}: ReserveFactorOverviewProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);
  const { isTonNetwork } = useAppDataContext();

  const explorerLink = isTonNetwork
    ? `${SCAN_TRANSACTION_TON}/${collectorContract}`
    : explorerLinkBuilder({
        address: collectorContract,
      });

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 3,
      }}
    >
      <ReserveOverviewBox
        title={
          <ReserveFactorTooltip
            event={{
              eventName: GENERAL.TOOL_TIP,
              eventParams: {
                tooltip: 'Reserve factor',
                asset: reserveAsset,
                assetName: reserveName,
              },
            }}
            text={<Trans>Reserve factor</Trans>}
            key="res_factor"
            variant="description"
            collectorLink={
              collectorContract
                ? explorerLinkBuilder({
                    address: collectorContract,
                  })
                : undefined
            }
          />
        }
      >
        <FormattedNumber
          value={reserveFactor}
          percent
          variant="body6"
          color="text.primary"
          visibleDecimals={2}
        />
      </ReserveOverviewBox>

      <ReserveOverviewBox title={<Trans>Collector Contract</Trans>}>
        <Link
          onClick={() => {
            trackEvent(GENERAL.EXTERNAL_LINK, {
              Link: 'Collector Contract ' + reserveName,
              asset: reserveAsset,
              assetName: reserveName,
            });
          }}
          href={explorerLink}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body6" color="text.primary">
              <Trans>View contract</Trans>
            </Typography>
            <SvgIcon
              sx={(theme) => ({
                ml: 1,
                fontSize: 18,
                color: theme.palette.text.primary,
                '&:hover': { color: theme.palette.text.primary },
              })}
            >
              <CallMadeOutlinedIcon />
            </SvgIcon>
          </Box>
        </Link>
      </ReserveOverviewBox>
      {/* TO-DO: Refactor grid layout, currently uses flex: space-around which breaks with 2 elements */}
      <Box
        sx={{
          flex: '0 32%',
          marginBottom: '2%',
          height: { md: '70px', lg: '60px' },
          maxWidth: '32%',
        }}
      />
    </Box>
  );
};
