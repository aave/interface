import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Trans } from '@lingui/macro';
import { Box, Tooltip, Typography } from '@mui/material';

import { PopperComponent } from '../ContentWithTooltip';
import GhoBorrowApyRange from '../GhoBorrowApyRange';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { Link } from '../primitives/Link';
import { NoData } from '../primitives/NoData';
import { IncentivesButton } from './IncentivesButton';

interface GhoIncentivesCardProps {
  symbol: string;
  value: string | number;
  useApyRange?: boolean;
  rangeValues?: [number, number];
  incentives?: ReserveIncentiveResponse[];
  variant?: 'main14' | 'main16' | 'secondary14';
  symbolsVariant?: 'secondary14' | 'secondary16';
  align?: 'center' | 'flex-end';
  borrowAmount: string | number;
  baseApy: string | number;
  discountPercent: string | number;
  discountableAmount: string | number;
  stkAaveBalance: string | number;
  ghoRoute: string;
  onMoreDetailsClick?: () => void;
}

export const GhoIncentivesCard = ({
  symbol,
  value,
  useApyRange = false,
  rangeValues = [0, 0],
  incentives,
  variant = 'secondary14',
  symbolsVariant,
  align,
  borrowAmount,
  baseApy,
  discountPercent,
  discountableAmount,
  stkAaveBalance,
  ghoRoute,
  onMoreDetailsClick,
}: GhoIncentivesCardProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: align || { xs: 'flex-end', xsm: 'center' },
      justifyContent: 'center',
      textAlign: 'center',
    }}
    data-cy={'apr'}
  >
    {value.toString() !== '-1' ? (
      discountableAmount === 0 ? (
        <Box sx={{ display: 'flex' }}>
          <FormattedNumber
            value={value}
            percent
            variant={variant}
            symbolsVariant={symbolsVariant}
          />
        </Box>
      ) : (
        <Tooltip
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
                  '&:hover': { textDecoration: 'underline' },
                },
              }}
            >
              <Typography variant="caption" color="text.secondary">
                <Trans>Estimated compounding interest, including discount for staking AAVE:</Trans>
                <ul style={{ listStylePosition: 'inside', paddingLeft: 8 }}>
                  <li>
                    <Trans>Borrow amount</Trans>:{' '}
                    <FormattedNumber
                      value={borrowAmount}
                      variant="caption"
                      color="text.secondary"
                      visibleDecimals={0}
                    />{' '}
                    GHO
                  </li>
                  <li>
                    <Trans>Base APY</Trans>:{' '}
                    <FormattedNumber
                      value={baseApy}
                      variant="caption"
                      color="text.secondary"
                      percent
                    />
                  </li>
                  <li>
                    <Trans>Discount on base APY</Trans>:{' '}
                    <FormattedNumber
                      value={discountPercent}
                      variant="caption"
                      color="text.secondary"
                      visibleDecimals={0}
                      percent
                    />
                  </li>
                </ul>
                <Trans>
                  <strong>
                    Discount only applies to{' '}
                    <FormattedNumber
                      variant="caption"
                      color="text.secondary"
                      visibleDecimals={0}
                      value={discountableAmount}
                      sx={{ fontWeight: 'bold' }}
                    />{' '}
                    GHO,
                  </strong>{' '}
                  which equals discountable amount for staking{' '}
                  <FormattedNumber
                    value={stkAaveBalance}
                    variant="caption"
                    color="text.secondary"
                    visibleDecimals={0}
                  />{' '}
                  AAVE.
                </Trans>{' '}
                <Link onClick={onMoreDetailsClick} href={ghoRoute} underline="always">
                  <Trans>More details</Trans>
                </Link>
              </Typography>
            </Box>
          }
          placement="top"
          arrow
          PopperComponent={PopperComponent}
        >
          <Box
            sx={(theme) => ({
              display: 'flex',
              borderBottom: `1px dashed ${theme.palette.text.muted}`,
              cursor: 'pointer',
            })}
          >
            {useApyRange ? (
              <GhoBorrowApyRange
                percentVariant={variant}
                hyphenVariant={variant}
                minVal={rangeValues[0]}
                maxVal={rangeValues[1]}
              />
            ) : (
              <FormattedNumber
                value={value}
                percent
                variant={variant}
                symbolsVariant={symbolsVariant}
              />
            )}
          </Box>
        </Tooltip>
      )
    ) : (
      <NoData variant={variant} color="text.secondary" />
    )}

    <IncentivesButton incentives={incentives} symbol={symbol} />
  </Box>
);
