import { Trans } from '@lingui/macro';
import { Button, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Base64Token, TokenIcon } from 'src/components/primitives/TokenIcon';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';

import { BaseSuccessView } from './BaseSuccess';

export type SuccessTxViewProps = {
  txHash?: string;
  title?: ReactNode;
  action?: ReactNode;
  amount?: string;
  symbol?: string;
  collateral?: boolean;
  addToken?: ERC20TokenType;
  customAction?: ReactNode;
  customText?: ReactNode;
};

export const TxSuccessView = ({
  txHash,
  title,
  action,
  amount,
  symbol,
  collateral,
  addToken,
  customAction,
  customText,
}: SuccessTxViewProps) => {
  const { addERC20Token } = useWeb3Context();
  const [base64, setBase64] = useState('');

  let description: ReactNode;
  if (action && amount && symbol) {
    description = (
      <Trans>
        You {action}{' '}
        <FormattedNumber
          value={Number(amount)}
          compact
          variant="h5"
          color="fg-1"
          component="span"
        />{' '}
        {symbol}
      </Trans>
    );
  } else if (customText) {
    description = customText;
  } else if (!action && !amount && symbol) {
    description = collateral ? (
      <Trans>Your {symbol} is now used as collateral</Trans>
    ) : (
      <Trans>Your {symbol} is no longer used as collateral</Trans>
    );
  }

  return (
    <BaseSuccessView txHash={txHash} title={title} description={description}>
      {customAction}

      {addToken && symbol && (
        <>
          {addToken.symbol && !/_/.test(addToken.symbol) && (
            <Base64Token
              symbol={addToken.symbol}
              onImageGenerated={setBase64}
              aToken={addToken.aToken}
            />
          )}
          <Typography variant="base" color="fg-3" sx={{ textAlign: 'center', mb: '0.75rem' }}>
            <Trans>
              Add {addToken.aToken ? 'aToken' : 'token'} to wallet to track your balance.
            </Trans>
          </Typography>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<TokenIcon symbol={addToken.symbol} aToken={addToken.aToken} />}
            onClick={() => {
              addERC20Token({
                address: addToken.address,
                decimals: addToken.decimals,
                symbol: addToken.aToken ? '' : addToken.symbol,
                image: !/_/.test(addToken.symbol) ? base64 : undefined,
              });
            }}
          >
            <Trans>Add to wallet</Trans>
          </Button>
        </>
      )}
    </BaseSuccessView>
  );
};
