import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, Stack, SvgIcon, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { calculateHFAfterWithdraw } from 'src/utils/hfUtils';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { Asset, AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsHFLine,
  DetailsNumberLine,
  DetailsUnwrapSwitch,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { zeroLTVBlockingWithdraw } from '../utils';
import { calculateMaxWithdrawAmount } from './utils';
import { WithdrawActions } from './WithdrawActions';
import { useWithdrawError } from './WithdrawError';

interface WithdrawAsset extends Asset {
  balance: string;
}

// does this naming make sense?
// probably need to key on the underlying asset addresses
const wrappedTokenConfig: { [symbol: string]: string } = {
  sDAI: 'DAI',
};

export enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

export const WithdrawModalContent = ({
  poolReserve,
  userReserve,
  unwrap: withdrawUnWrapped,
  setUnwrap: setWithdrawUnWrapped,
  symbol,
  isWrongNetwork,
}: ModalWrapperProps & {
  unwrap: boolean;
  setUnwrap: (unwrap: boolean) => void;
}) => {
  const { gasLimit, mainTxState: withdrawTxState, txError } = useModalContext();
  const { user } = useAppDataContext();
  const { currentNetworkConfig } = useProtocolDataContext();

  const [tokenToWithdraw, setTokenToWithdraw] = useState<WithdrawAsset>({
    address: poolReserve.underlyingAsset,
    symbol: poolReserve.symbol,
    iconSymbol: poolReserve.iconSymbol,
    balance: '100',
  });
  const [_amount, setAmount] = useState('');
  const [withdrawMax, setWithdrawMax] = useState('');
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);
  const amountRef = useRef<string>('');
  const trackEvent = useRootStore((store) => store.trackEvent);

  const isMaxSelected = _amount === '-1';
  const maxAmountToWithdraw = calculateMaxWithdrawAmount(user, userReserve, poolReserve);
  const underlyingBalance = valueToBigNumber(userReserve?.underlyingBalance || '0');
  const unborrowedLiquidity = valueToBigNumber(poolReserve.unborrowedLiquidity);
  const withdrawAmount = isMaxSelected ? maxAmountToWithdraw.toString(10) : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToWithdraw.toString(10) : value;
    setAmount(value);
    if (maxSelected && maxAmountToWithdraw.eq(underlyingBalance)) {
      trackEvent(GENERAL.MAX_INPUT_SELECTION, { type: 'withdraw' });
      setWithdrawMax('-1');
    } else {
      setWithdrawMax(maxAmountToWithdraw.toString(10));
    }
  };

  const assetsBlockingWithdraw: string[] = zeroLTVBlockingWithdraw(user);

  const healthFactorAfterWithdraw = calculateHFAfterWithdraw({
    user,
    userReserve,
    poolReserve,
    withdrawAmount,
  });

  const { blockingError, errorComponent } = useWithdrawError({
    assetsBlockingWithdraw,
    poolReserve,
    healthFactorAfterWithdraw,
    withdrawAmount,
  });

  const displayRiskCheckbox =
    healthFactorAfterWithdraw.toNumber() >= 1 &&
    healthFactorAfterWithdraw.toNumber() < 1.5 &&
    userReserve.usageAsCollateralEnabledOnUser;

  // calculating input usd value
  const usdValue = valueToBigNumber(withdrawAmount).multipliedBy(
    userReserve?.reserve.priceInUSD || 0
  );

  if (withdrawTxState.success)
    return (
      <TxSuccessView
        action={<Trans>withdrew</Trans>}
        amount={amountRef.current}
        symbol={
          withdrawUnWrapped && poolReserve.isWrappedBaseAsset
            ? currentNetworkConfig.baseAssetSymbol
            : poolReserve.symbol
        }
      />
    );

  const assets: WithdrawAsset[] = [
    {
      balance: maxAmountToWithdraw.toString(),
      symbol: poolReserve.symbol,
      iconSymbol: poolReserve.iconSymbol,
    },
  ];

  if (wrappedTokenConfig[poolReserve.symbol]) {
    assets.push({
      balance: maxAmountToWithdraw.toString(),
      symbol: wrappedTokenConfig[poolReserve.symbol],
      iconSymbol: wrappedTokenConfig[poolReserve.symbol],
    });
  }

  return (
    <>
      <AssetInput
        value={withdrawAmount}
        onChange={handleChange}
        onSelect={setTokenToWithdraw}
        symbol={tokenToWithdraw.symbol}
        assets={assets}
        usdValue={usdValue.toString(10)}
        isMaxSelected={isMaxSelected}
        disabled={withdrawTxState.loading}
        maxValue={maxAmountToWithdraw.toString(10)}
        balanceText={
          unborrowedLiquidity.lt(underlyingBalance) ? (
            <Trans>Available</Trans>
          ) : (
            <Trans>Supply balance</Trans>
          )
        }
        exchangeRateComponent={
          poolReserve.symbol === 'sDAI' && tokenToWithdraw.symbol === 'DAI' && <ExchangeRate />
        }
      />

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {errorComponent}
        </Typography>
      )}

      {poolReserve.isWrappedBaseAsset && (
        <DetailsUnwrapSwitch
          unwrapped={withdrawUnWrapped}
          setUnWrapped={setWithdrawUnWrapped}
          label={
            <Typography>{`Unwrap ${poolReserve.symbol} (to withdraw ${currentNetworkConfig.baseAssetSymbol})`}</Typography>
          }
        />
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine
          description={<Trans>Remaining supply</Trans>}
          value={underlyingBalance.minus(withdrawAmount || '0').toString(10)}
          symbol={
            poolReserve.isWrappedBaseAsset
              ? currentNetworkConfig.baseAssetSymbol
              : poolReserve.symbol
          }
        />
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user ? user.healthFactor : '-1'}
          futureHealthFactor={healthFactorAfterWithdraw.toString(10)}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {displayRiskCheckbox && (
        <>
          <Warning severity="error" sx={{ my: 6 }}>
            <Trans>
              Withdrawing this amount will reduce your health factor and increase risk of
              liquidation.
            </Trans>
          </Warning>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              mx: '24px',
              mb: '12px',
            }}
          >
            <Checkbox
              checked={riskCheckboxAccepted}
              onChange={() => {
                setRiskCheckboxAccepted(!riskCheckboxAccepted),
                  trackEvent(GENERAL.ACCEPT_RISK, {
                    modal: 'Withdraw',
                    riskCheckboxAccepted: riskCheckboxAccepted,
                  });
              }}
              size="small"
              data-cy={`risk-checkbox`}
            />
            <Typography variant="description">
              <Trans>I acknowledge the risks involved.</Trans>
            </Typography>
          </Box>
        </>
      )}

      <WithdrawActions
        poolReserve={poolReserve}
        amountToWithdraw={isMaxSelected ? withdrawMax : withdrawAmount}
        poolAddress={
          withdrawUnWrapped && poolReserve.isWrappedBaseAsset
            ? API_ETH_MOCK_ADDRESS
            : poolReserve.underlyingAsset
        }
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        blocked={blockingError !== undefined || (displayRiskCheckbox && !riskCheckboxAccepted)}
        sx={displayRiskCheckbox ? { mt: 0 } : {}}
      />
    </>
  );
};

const ExchangeRate = () => {
  return (
    <ContentWithTooltip tooltipContent={ExchangeRateTooltip}>
      <Stack direction="row" alignItems="center" gap={1}>
        <ExchangeIcon />
        <FormattedNumber value={1} variant="subheader2" color="text.primary" visibleDecimals={0} />
        <Typography variant="subheader2" color="text.secondary">
          sDAI
        </Typography>
        <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
          <ArrowNarrowRightIcon />
        </SvgIcon>
        <FormattedNumber
          value={0.9696}
          variant="subheader2"
          color="text.primary"
          visibleDecimals={4}
        />
        <Typography variant="subheader2" color="text.secondary">
          DAI
        </Typography>
      </Stack>
    </ContentWithTooltip>
  );
};
const ExchangeRateTooltip = (
  <>
    <Trans>
      DAI balance will be converted via DSR contracts and then supplied as sDAI to Aave reserve.
      Switching incurs no additional costs and no slippage.
    </Trans>{' '}
    <Link
      href="https://docs.aave.com/faq/aave-v3-features#how-does-isolation-mode-affect-my-borrowing-power"
      underline="always"
    >
      <Trans>Learn more</Trans>
    </Link>
  </>
);

const ExchangeIcon = () => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="14" height="14" rx="4" fill="#F39217" />
      <mask id="mask0_5931_116211" maskUnits="userSpaceOnUse" x="2" y="2" width="10" height="10">
        <path d="M11.9969 2H2V11.9901H11.9969V2Z" fill="white" />
      </mask>
      <g mask="url(#mask0_5931_116211)">
        <mask id="mask1_5931_116211" maskUnits="userSpaceOnUse" x="2" y="7" width="5" height="5">
          <path
            d="M6.40533 11.959L3.00641 7.99545C2.94266 7.9213 3.0291 7.81408 3.11482 7.86106L5.40029 9.1042C5.50798 9.16291 5.59148 9.25912 5.63397 9.37443L6.55402 11.8709C6.58772 11.9627 6.46903 12.0332 6.40533 11.959Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask1_5931_116211)">
          <path
            d="M6.40533 11.959L3.00641 7.99545C2.94266 7.9213 3.0291 7.81408 3.11482 7.86106L5.40029 9.1042C5.50798 9.16291 5.59148 9.25912 5.63397 9.37443L6.55402 11.8709C6.58772 11.9627 6.46903 12.0332 6.40533 11.959Z"
            fill="white"
          />
        </g>
        <mask id="mask2_5931_116211" maskUnits="userSpaceOnUse" x="5" y="3" width="3" height="9">
          <path
            d="M6.89605 11.0478L5.95841 6.40136C5.9445 6.33232 5.95841 6.25963 5.99578 6.20017L7.63223 3.63318C7.66518 3.58175 7.74506 3.60894 7.73918 3.67063L7.01106 11.0419C7.00447 11.1088 6.90924 11.1132 6.89605 11.0478Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask2_5931_116211)">
          <path
            d="M6.89605 11.0478L5.95841 6.40136C5.9445 6.33232 5.95841 6.25963 5.99578 6.20017L7.63223 3.63318C7.66518 3.58175 7.74506 3.60894 7.73918 3.67063L7.01106 11.0419C7.00447 11.1088 6.90924 11.1132 6.89605 11.0478Z"
            fill="white"
          />
        </g>
        <mask id="mask3_5931_116211" maskUnits="userSpaceOnUse" x="7" y="6" width="5" height="4">
          <path
            d="M7.70682 9.67911L9.50592 7.05553C9.56744 6.96595 9.6744 6.91971 9.7821 6.93586L10.9328 7.11063C11.0068 7.12165 11.0318 7.21633 10.9732 7.26263L7.79694 9.76427C7.74055 9.80833 7.66655 9.73857 7.70682 9.67983V9.67911Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask3_5931_116211)">
          <path
            d="M7.70682 9.67911L9.50592 7.05553C9.56744 6.96595 9.6744 6.91971 9.7821 6.93586L10.9328 7.11063C11.0068 7.12165 11.0318 7.21633 10.9732 7.26263L7.79694 9.76427C7.74055 9.80833 7.66655 9.73857 7.70682 9.67983V9.67911Z"
            fill="white"
          />
        </g>
        <mask id="mask4_5931_116211" maskUnits="userSpaceOnUse" x="7" y="2" width="3" height="6">
          <path
            d="M7.97738 7.88015L8.89744 2.04931C8.90696 1.98913 8.99046 1.98177 9.01025 2.0398L9.82628 4.42173C9.85046 4.49297 9.84461 4.57078 9.80944 4.63761L8.08655 7.91686C8.05577 7.97489 7.96714 7.94552 7.97738 7.88086V7.88015Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask4_5931_116211)">
          <path
            d="M7.97738 7.88015L8.89744 2.04931C8.90696 1.98913 8.99046 1.98177 9.01025 2.0398L9.82628 4.42173C9.85046 4.49297 9.84461 4.57078 9.80944 4.63761L8.08655 7.91686C8.05577 7.97489 7.96714 7.94552 7.97738 7.88086V7.88015Z"
            fill="#FFFEFD"
          />
        </g>
        <mask id="mask5_5931_116211" maskUnits="userSpaceOnUse" x="4" y="5" width="2" height="4">
          <path
            d="M4.03257 6.72954L4.23842 5.26467C4.2472 5.20443 4.32924 5.19345 4.35342 5.24927L5.62288 8.21497C5.64853 8.27518 5.5738 8.3273 5.5262 8.28252L4.1095 6.94984C4.04942 6.89327 4.02012 6.81029 4.03184 6.72882L4.03257 6.72954Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask5_5931_116211)">
          <path
            d="M4.03257 6.72954L4.23842 5.26467C4.2472 5.20443 4.32924 5.19345 4.35342 5.24927L5.62288 8.21497C5.64853 8.27518 5.5738 8.3273 5.5262 8.28252L4.1095 6.94984C4.04942 6.89327 4.02012 6.81029 4.03184 6.72882L4.03257 6.72954Z"
            fill="white"
          />
        </g>
      </g>
    </svg>
  );
};
