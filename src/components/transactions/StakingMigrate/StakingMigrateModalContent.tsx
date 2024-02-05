import { Stake, valueToWei } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { ReactNode, useRef, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { stakeAssetNameFormatted } from 'src/ui-config/stakeConfig';

import { AssetInput } from '../AssetInput';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { StakingMigrateActions } from './StakingMigrateActions';

export const StakingMigrateModalContent = () => {
  const { gasLimit, mainTxState } = useModalContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { data: stkBptUserData } = useUserStakeUiData(currentMarketData, Stake.bpt);

  const { data: stkBptData } = useGeneralStakeUiData(currentMarketData, Stake.bpt);
  const { data: stkBptV2Data } = useGeneralStakeUiData(currentMarketData, Stake.bptv2);

  const stakeData = stkBptData?.[0];
  const stakeUserData = stkBptUserData?.[0];
  const stakeBptV2Data = stkBptV2Data?.[0];

  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const maxAmountToMigrate = normalize(stakeUserData?.stakeTokenUserBalance || '0', 18);
  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToMigrate : _amount;
  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToMigrate : value;
    setAmount(value);
  };

  // staking token usd value
  const amountInUsd = Number(amount) * Number(stakeData?.stakeTokenPriceUSDFormatted);

  if (mainTxState.success)
    return (
      <TxSuccessView
        action={<Trans>Migrated</Trans>}
        amount={amountRef.current}
        symbol={'stkABPT'}
      />
    );

  const expectedBptOut = BigNumber.from(valueToWei(amount || '0', 18))
    .mul(BigNumber.from(stakeData?.stakeTokenPriceUSD || 0))
    .div(BigNumber.from(stakeBptV2Data?.stakeTokenPriceUSD || 0));

  const minBptOutWithSlippage = expectedBptOut.mul(9999).div(10000).toString();

  const minOutFormatted = formatEther(minBptOutWithSlippage);
  const minOutUSD = Number(minOutFormatted) * Number(stakeBptV2Data?.stakeTokenPriceUSDFormatted);

  const nameFormatted = stakeAssetNameFormatted(Stake.bpt);

  return (
    <>
      <TxModalTitle title={<Trans>Migrate to stkABPT v2</Trans>} />
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol={nameFormatted}
        assets={[
          {
            balance: maxAmountToMigrate.toString(),
            symbol: 'stkBPT',
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToMigrate.toString()}
        balanceText={<Trans>Wallet balance</Trans>}
      />
      <TxModalDetails gasLimit={gasLimit}>
        <TxDetailsRow
          caption={<Trans>Amount to migrate</Trans>}
          value={amount}
          valueUSD={amountInUsd.toString()}
        />
        <TxDetailsRow
          caption={<Trans>Minimum amount received</Trans>}
          value={formatEther(minBptOutWithSlippage)}
          valueUSD={minOutUSD.toString()}
        />
      </TxModalDetails>
      <StakingMigrateActions amountToMigrate={amount} minOutWithSlippage={minBptOutWithSlippage} />
    </>
  );
};

type TxDetailsRowProps = {
  caption: ReactNode;
  value: string;
  valueUSD: string;
};

const TxDetailsRow = ({ caption, value, valueUSD }: TxDetailsRowProps) => {
  return (
    <Row caption={caption} captionVariant="description" mb={4}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormattedNumber value={value} variant="secondary14" compact />
        </Box>
        <FormattedNumber
          value={valueUSD}
          variant="helperText"
          compact
          symbol="USD"
          symbolsColor="text.secondary"
          color="text.secondary"
        />
      </Box>
    </Row>
  );
};
