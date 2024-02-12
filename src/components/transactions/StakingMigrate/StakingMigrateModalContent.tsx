import { Stake, valueToWei } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { Trans } from '@lingui/macro';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { BigNumber, Contract } from 'ethers';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { AssetInput } from '../AssetInput';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
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
  const [wethPrice, setWethPrice] = useState('1');
  const [wstETHPrice, setWstETHPrice] = useState('1');
  const [aavePrice, setAavePrice] = useState('1');
  const amountRef = useRef<string>();

  useEffect(() => {
    const ethProvider = getProvider(1);
    const aaveOracleAbi = [
      {
        inputs: [
          { internalType: 'contract IPoolAddressesProvider', name: 'provider', type: 'address' },
          { internalType: 'address[]', name: 'assets', type: 'address[]' },
          { internalType: 'address[]', name: 'sources', type: 'address[]' },
          { internalType: 'address', name: 'fallbackOracle', type: 'address' },
          { internalType: 'address', name: 'baseCurrency', type: 'address' },
          { internalType: 'uint256', name: 'baseCurrencyUnit', type: 'uint256' },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
      },
      {
        inputs: [{ internalType: 'address', name: 'asset', type: 'address' }],
        name: 'getAssetPrice',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];
    const aaveOracle = new Contract(AaveV3Ethereum.ORACLE, aaveOracleAbi, ethProvider);
    const queryPairTokenPrices = async () => {
      const wethPriceOracle = await aaveOracle.getAssetPrice(AaveV3Ethereum.ASSETS.WETH.UNDERLYING);
      if (wethPriceOracle) {
        setWethPrice(formatUnits(wethPriceOracle, 8));
      }
      const wstETHPriceOracle = await aaveOracle.getAssetPrice(
        AaveV3Ethereum.ASSETS.wstETH.UNDERLYING
      );
      if (wstETHPriceOracle) {
        setWstETHPrice(formatUnits(wstETHPriceOracle, 8));
      }
      const aavePriceOracle = await aaveOracle.getAssetPrice(AaveV3Ethereum.ASSETS.AAVE.UNDERLYING);
      if (aavePriceOracle) {
        setAavePrice(formatUnits(aavePriceOracle, 8));
      }
    };
    queryPairTokenPrices();
  }, []);

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

  return (
    <>
      <TxModalTitle title={<Trans>Migrate to stkABPT v2</Trans>} />
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol="stkABPT"
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
        <SimpleTxDetailsRow
          caption={<Trans>Amount to migrate</Trans>}
          value={amount}
          valueUSD={amountInUsd.toString()}
          symbol={'stkABPT'}
          iconSymbol={'stkBPT'}
        />
        <TxDetailsRow
          caption={<Trans>Tokens breakdown</Trans>}
          value={(amountInUsd * 0.8) / Number(aavePrice)}
          valueToken={'AAVE'}
          valueUSD={amountInUsd * 0.8}
          secondaryValue={(amountInUsd * 0.2) / Number(wethPrice)}
          secondaryValueUSD={amountInUsd * 0.2}
          secondaryValueToken={'WETH'}
        />
        <DetailsNumberLine description={<Trans>Slippage</Trans>} value={0.0001} percent />
        <SimpleTxDetailsRow
          caption={<Trans>Minimum amount received</Trans>}
          value={formatEther(minBptOutWithSlippage)}
          valueUSD={minOutUSD.toString()}
          symbol={'stkABPT V2'}
          iconSymbol="stkbptv2"
        />
        <TxDetailsRow
          caption={<Trans>Tokens breakdown</Trans>}
          value={(minOutUSD * 0.8) / Number(aavePrice)}
          valueToken={'AAVE'}
          valueUSD={minOutUSD * 0.8}
          secondaryValue={(minOutUSD * 0.2) / Number(wstETHPrice)}
          secondaryValueUSD={minOutUSD * 0.2}
          secondaryValueToken={'wstETH'}
        />
      </TxModalDetails>
      <StakingMigrateActions amountToMigrate={amount} minOutWithSlippage={minBptOutWithSlippage} />
    </>
  );
};

type TxDetailsRowProps = {
  caption: ReactNode;
  value: number;
  valueToken: string;
  valueUSD: number;
  secondaryValue: number;
  secondaryValueToken: string;
  secondaryValueUSD: number;
};

const TxDetailsRow = ({
  caption,
  value,
  valueToken,
  valueUSD,
  secondaryValue,
  secondaryValueToken,
  secondaryValueUSD,
}: TxDetailsRowProps) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen((isOpen) => !isOpen);
  };

  return (
    <Box mb={4}>
      <Row caption={caption} captionVariant="description" mb={2} sx={{ alignItems: 'top' }}>
        <IconButton sx={{ p: 0 }} onClick={toggleOpen}>
          {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </Row>
      {open && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormattedNumber
              value={value.toString()}
              variant="secondary14"
              symbol={valueToken}
              visibleDecimals={4}
              compact
            />
            <TokenIcon symbol={valueToken} sx={{ width: 16, height: 16, ml: 1 }} />
          </Box>
          <FormattedNumber
            value={valueUSD.toString()}
            variant="helperText"
            compact
            symbol="USD"
            symbolsColor="text.secondary"
            color="text.secondary"
            visibleDecimals={2}
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }} mt={2}>
            <FormattedNumber
              value={secondaryValue.toString()}
              variant="secondary14"
              symbol={secondaryValueToken}
              visibleDecimals={4}
              compact
            />
            <TokenIcon symbol={secondaryValueToken} sx={{ width: 16, height: 16, ml: 0.5 }} />
          </Box>
          <FormattedNumber
            value={secondaryValueUSD.toString()}
            variant="helperText"
            compact
            symbol="USD"
            symbolsColor="text.secondary"
            visibleDecimals={2}
            color="text.secondary"
          />
        </Box>
      )}
    </Box>
  );
};

type SimpleTxDetailsRowProps = {
  caption: ReactNode;
  value: string;
  valueUSD: string;
  symbol: string;
  iconSymbol: string;
};

const SimpleTxDetailsRow = ({
  caption,
  value,
  valueUSD,
  symbol,
  iconSymbol,
}: SimpleTxDetailsRowProps) => {
  return (
    <Row caption={caption} captionVariant="description" mb={4}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormattedNumber symbol={symbol} value={value} variant="secondary14" compact />
          <TokenIcon symbol={iconSymbol} sx={{ width: 16, height: 16, ml: 1 }} />
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
