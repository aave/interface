import { ProtocolAction } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Skeleton } from '@mui/material';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { DetailsAPYTransitionLine } from 'src/components/transactions/FlowCommons/TxModalDetails';

import { ComputedUserReserveData } from '../../../hooks/app-data-provider/useAppDataProvider';

export type DebtSwitchModalDetailsProps = {
  switchSource: ComputedUserReserveData;
  switchTarget: ComputedUserReserveData;
  toAmount: string;
  fromAmount: string;
  loading: boolean;
  sourceBalance: string;
  sourceBorrowAPY: string;
  targetBorrowAPY: string;
  market?: string;
};

export const DebtSwitchModalDetails = ({
  switchSource,
  switchTarget,
  toAmount,
  fromAmount,
  loading,
  sourceBalance,
  sourceBorrowAPY,
  targetBorrowAPY,
  market,
}: DebtSwitchModalDetailsProps) => {
  const sourceAmountAfterSwap = valueToBigNumber(sourceBalance).minus(valueToBigNumber(fromAmount));

  const targetAmountAfterSwap = valueToBigNumber(switchTarget.variableBorrows).plus(
    valueToBigNumber(toAmount)
  );

  const skeleton: JSX.Element = (
    <>
      <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
      <Skeleton
        variant="rectangular"
        height={15}
        width={80}
        sx={{ borderRadius: '4px', marginTop: '4px' }}
      />
    </>
  );

  return (
    <>
      {market && (
        <DetailsAPYTransitionLine
          symbol={switchSource.reserve.symbol}
          market={market}
          protocolAction={ProtocolAction.borrow}
          protocolAPY={+sourceBorrowAPY}
          incentives={switchSource.reserve.vIncentivesData}
          address={switchSource.reserve.variableDebtTokenAddress}
          futureSymbol={switchTarget.reserve.symbol}
          futureMarket={market}
          futureProtocolAPY={+targetBorrowAPY}
          futureIncentives={switchTarget.reserve.vIncentivesData}
          futureAddress={switchTarget.reserve.variableDebtTokenAddress}
          loading={loading}
        />
      )}

      <Row
        caption={<Trans>Borrow balance after switch</Trans>}
        captionVariant="description"
        mb={4}
        align="flex-start"
      >
        <Box sx={{ textAlign: 'right' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            {loading ? (
              skeleton
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TokenIcon
                    symbol={switchSource.reserve.iconSymbol}
                    sx={{ mr: 2, ml: 4, fontSize: '16px' }}
                  />
                  <FormattedNumber
                    value={sourceAmountAfterSwap.toString()}
                    variant="secondary14"
                    compact
                  />
                </Box>
                <FormattedNumber
                  value={sourceAmountAfterSwap
                    .multipliedBy(valueToBigNumber(switchSource.reserve.priceInUSD))
                    .toString()}
                  variant="helperText"
                  compact
                  symbol="USD"
                  symbolsColor="text.secondary"
                  color="text.secondary"
                />
              </>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            mt={2}
          >
            {loading ? (
              skeleton
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TokenIcon
                    symbol={switchTarget.reserve.iconSymbol}
                    sx={{ mr: 2, ml: 4, fontSize: '16px' }}
                  />
                  <FormattedNumber
                    value={targetAmountAfterSwap.toString()}
                    variant="secondary14"
                    compact
                  />
                </Box>
                <FormattedNumber
                  value={targetAmountAfterSwap
                    .multipliedBy(valueToBigNumber(switchTarget.reserve.priceInUSD))
                    .toString()}
                  variant="helperText"
                  compact
                  symbol="USD"
                  symbolsColor="text.secondary"
                  color="text.secondary"
                />
              </>
            )}
          </Box>
        </Box>
      </Row>
    </>
  );
};
