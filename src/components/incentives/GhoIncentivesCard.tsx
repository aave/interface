import { Trans } from '@lingui/macro';
import { Box, Tooltip, Typography } from '@mui/material';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { PopperComponent } from '../ContentWithTooltip';
import GhoBorrowApyRange from '../GhoBorrowApyRange';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { Link } from '../primitives/Link';
import { NoData } from '../primitives/NoData';
import { TokenIcon } from '../primitives/TokenIcon';

export interface GhoIncentivesCardProps {
  value: string | number;
  useApyRange?: boolean;
  rangeValues?: [number, number];
  stkAaveBalance: string | number;
  ghoRoute: string;
  userQualifiesForDiscount: boolean;
  onMoreDetailsClick?: () => void;
  withTokenIcon?: boolean;
  forceShowTooltip?: boolean;
}

export const GhoIncentivesCard = ({
  value,
  useApyRange,
  rangeValues = [0, 0],
  ghoRoute,
  stkAaveBalance,
  userQualifiesForDiscount,
  onMoreDetailsClick,
  withTokenIcon = false,
  forceShowTooltip = false,
}: GhoIncentivesCardProps) => {
  const { ghoReserveData } = useAppDataContext();
  const stkAaveAmount = Number(stkAaveBalance);

  const minStkAaveBalanceReached =
    stkAaveAmount >= ghoReserveData.ghoMinDiscountTokenBalanceForDiscount;

  let toolTipContent = <></>;
  const showTooltip = userQualifiesForDiscount || forceShowTooltip;
  if (showTooltip) {
    toolTipContent = (
      <Box
        sx={{
          py: 4,
          px: 6,
          fontSize: '12px',
          lineHeight: '16px',
          a: {
            fontSize: '12px',
            lineHeight: '16px',
            fontWeight: 500,
          },
        }}
      >
        <Typography variant="subheader2">
          <Trans>
            Estimated compounding interest, including discount for Staking{' '}
            {minStkAaveBalanceReached ? (
              <>
                <FormattedNumber variant="subheader2" value={stkAaveAmount} visibleDecimals={2} />{' '}
              </>
            ) : null}
            MCAKE in Safety Module.
          </Trans>{' '}
          <Link
            onClick={onMoreDetailsClick}
            href={ghoRoute}
            underline="always"
            variant="subheader2"
          >
            <Trans>Learn more</Trans>
          </Link>
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: { xs: 'flex-end', xsm: 'center' },
        justifyContent: 'center',
        textAlign: 'center',
        flex: '2 1 auto',
      }}
    >
      {value.toString() !== '-1' ? (
        <Tooltip
          enterTouchDelay={0}
          leaveTouchDelay={0}
          placement="top"
          title={toolTipContent}
          arrow={showTooltip}
          PopperComponent={PopperComponent}
        >
          <Box
            sx={() => ({
              display: 'flex',
              alignItems: 'center',
            })}
          >
            {withTokenIcon && <TokenIcon symbol="stkAAVE" sx={{ height: 14, width: 14, mr: 1 }} />}
            {useApyRange ? (
              <GhoBorrowApyRange
                percentVariant="secondary14"
                hyphenVariant="secondary14"
                minVal={Math.min(...rangeValues)}
                maxVal={Math.max(...rangeValues)}
              />
            ) : (
              <FormattedNumber value={value} percent variant="secondary14" data-cy={'apy'} />
            )}
          </Box>
        </Tooltip>
      ) : (
        <NoData variant="secondary14" color="text.secondary" />
      )}
    </Box>
  );
};
