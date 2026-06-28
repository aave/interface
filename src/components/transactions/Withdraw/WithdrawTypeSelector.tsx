import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
import { useRootStore } from 'src/store/root';
import { WITHDRAW_MODAL } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

export enum WithdrawType {
  WITHDRAW,
  WITHDRAW_AND_SWAP,
}
export function WithdrawTypeSelector({
  withdrawType,
  setWithdrawType,
}: {
  withdrawType: WithdrawType;
  setWithdrawType: (type: WithdrawType) => void;
}) {
  const [trackEvent, currentMarketData] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarketData])
  );

  if (!currentMarketData.enabledFeatures?.collateralRepay) return null;
  return (
    <Box sx={{ mb: 6 }}>
      <StyledTxModalToggleGroup
        color="primary"
        value={withdrawType}
        exclusive
        onChange={(_, value) => setWithdrawType(value)}
      >
        <StyledTxModalToggleButton
          value={WithdrawType.WITHDRAW}
          disabled={withdrawType === WithdrawType.WITHDRAW}
          onClick={() =>
            trackEvent(WITHDRAW_MODAL.SWITCH_WITHDRAW_TYPE, { withdrawType: 'Withdraw' })
          }
        >
          <Typography variant="buttonM">
            <Trans>Withdraw</Trans>
          </Typography>
        </StyledTxModalToggleButton>

        <StyledTxModalToggleButton
          value={WithdrawType.WITHDRAW_AND_SWAP}
          disabled={withdrawType === WithdrawType.WITHDRAW_AND_SWAP}
          onClick={() =>
            trackEvent(WITHDRAW_MODAL.SWITCH_WITHDRAW_TYPE, { withdrawType: 'Withdraw and Swap' })
          }
        >
          <Typography variant="buttonM">
            <Trans>Withdraw & Swap</Trans>
          </Typography>
        </StyledTxModalToggleButton>
      </StyledTxModalToggleGroup>
    </Box>
  );
}
