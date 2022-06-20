import { InterestRate } from '@aave/contract-helpers';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { CheckIcon } from '@heroicons/react/solid';
import { ReactNode, useState } from 'react';
import { Trans } from '@lingui/macro';
import { Box, Button, Link, SvgIcon, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Base64Token, TokenIcon } from 'src/components/primitives/TokenIcon';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';

export type SuccessTxViewProps = {
  action?: ReactNode;
  amount?: string;
  symbol?: string;
  collateral?: boolean;
  rate?: InterestRate;
  addToken?: ERC20TokenType;
};

const ExtLinkIcon = () => (
  <SvgIcon sx={{ ml: '2px', fontSize: '11px' }}>
    <ExternalLinkIcon />
  </SvgIcon>
);

export const TxSuccessView = ({
  action,
  amount,
  symbol,
  collateral,
  rate,
  addToken,
}: SuccessTxViewProps) => {
  const { close, mainTxState } = useModalContext();
  const { addERC20Token } = useWeb3Context();
  const { currentNetworkConfig } = useProtocolDataContext();
  const [base64, setBase64] = useState('');

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          mb: '124px',
        }}
      >
        <Box
          sx={{
            width: '48px',
            height: '48px',
            bgcolor: 'success.200',
            borderRadius: '50%',
            mt: 14,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SvgIcon sx={{ color: 'success.main', fontSize: '32px' }}>
            <CheckIcon />
          </SvgIcon>
        </Box>

        <Typography sx={{ mt: 4 }} variant="h2">
          <Trans>All done!</Trans>
        </Typography>

        <Box
          sx={{
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {action && amount && symbol && (
            <Typography>
              <Trans>
                You {action}{' '}
                <FormattedNumber value={Number(amount)} compact variant="secondary14" /> {symbol}
              </Trans>
            </Typography>
          )}

          {!action && !amount && symbol && (
            <Typography>
              Your {symbol} {collateral ? 'now' : 'is not'} used as collateral
            </Typography>
          )}

          {rate && (
            <Typography>
              <Trans>
                You switched to {rate === InterestRate.Variable ? 'variable' : 'stable'} rate
              </Trans>
            </Typography>
          )}

          {addToken && symbol && (
            <Box
              sx={{
                width: '352px',
                background: '#F7F7F9',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                my: '24px',
              }}
            >
              <TokenIcon symbol={symbol} aToken={true} sx={{ fontSize: '32px', margin: '12px' }} />
              <Typography variant="description" color="text.primary" sx={{ mx: '24px' }}>
                <Trans>Add aToken to the wallet to track your supply balance</Trans>
              </Typography>
              <Button
                onClick={() => {
                  addERC20Token({
                    address: addToken.address,
                    decimals: addToken.decimals,
                    symbol: addToken.aToken ? `a${addToken.symbol}` : addToken.symbol,
                    image: !/_/.test(addToken.symbol) ? base64 : undefined,
                  });
                }}
                variant="contained"
                size="large"
                sx={{ height: '36px', marginY: '8px' }}
              >
                {addToken.symbol && !/_/.test(addToken.symbol) && (
                  <Base64Token
                    symbol={addToken.symbol}
                    onImageGenerated={setBase64}
                    aToken={addToken.aToken}
                  />
                )}
                <Typography variant="buttonM" color="white">
                  <Trans>Add To Wallet</Trans>
                </Typography>
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 12 }}>
        <Link
          variant="helperText"
          href={currentNetworkConfig.explorerLinkBuilder({ tx: mainTxState.txHash })}
          sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'right', mb: 3 }}
          underline="hover"
          target="_blank"
          rel="noreferrer"
        >
          <Trans>Review tx details</Trans>
          <ExtLinkIcon />
        </Link>
        <Button
          onClick={close}
          variant="contained"
          size="large"
          sx={{ minHeight: '44px' }}
          data-cy="closeButton"
        >
          <Trans>Ok, Close</Trans>
        </Button>
      </Box>
    </>
  );
};
