import { valueToZDBigNumber } from '@aave/math-utils';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Trans } from '@lingui/macro';
import { Box, Tooltip, Typography } from '@mui/material';

import { PopperComponent } from '../ContentWithTooltip';
import GhoBorrowApyRange from '../GhoBorrowApyRange';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { Link } from '../primitives/Link';
import { NoData } from '../primitives/NoData';
import { TokenIcon } from '../primitives/TokenIcon';
import { IncentivesButton } from './IncentivesButton';

export interface GhoIncentivesCardProps {
  symbol: string;
  value: string | number;
  useApyRange?: boolean;
  rangeValues?: [number, number];
  incentives?: ReserveIncentiveResponse[];
  variant?: 'main14' | 'main16' | 'secondary14';
  symbolsVariant?: 'secondary14' | 'secondary16';
  align?: 'center' | 'flex-end';
  stkAaveBalance: string | number;
  ghoRoute: string;
  onMoreDetailsClick?: () => void;
  withTokenIcon?: boolean;
}

export const GhoIncentivesCard = ({
  symbol,
  value,
  useApyRange,
  rangeValues = [0, 0],
  incentives,
  variant = 'secondary14',
  symbolsVariant,
  align,
  ghoRoute,
  onMoreDetailsClick,
  withTokenIcon = false,
}: GhoIncentivesCardProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align || { xs: 'flex-end', xsm: 'center' },
        justifyContent: 'center',
        textAlign: 'center',
        flex: '2 1 auto',
      }}
    >
      {value.toString() !== '-1' ? (
        <Tooltip
          enterTouchDelay={0}
          title={
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
              <Typography variant="caption" color="text.secondary">
                <Trans>
                  Estimated compounding interest, including discount for staking AAVE in Safety
                  Module.
                </Trans>
                <Link
                  onClick={onMoreDetailsClick}
                  href={ghoRoute}
                  underline="always"
                  variant="subheader2"
                  color="text.secondary"
                >
                  <Trans>Learn more</Trans>
                </Link>
              </Typography>
            </Box>
          }
          placement="top"
          arrow
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
                percentVariant={variant}
                hyphenVariant={variant}
                minVal={Math.min(...rangeValues)}
                maxVal={Math.max(...rangeValues)}
              />
            ) : (
              <FormattedNumber
                value={value}
                percent
                variant={variant}
                symbolsVariant={symbolsVariant}
                data-cy={'apy'}
              />
            )}
          </Box>
        </Tooltip>
      ) : (
        <NoData variant={variant} color="text.secondary" />
      )}

      <IncentivesButton incentives={incentives} symbol={symbol} />
    </Box>
  );
};
