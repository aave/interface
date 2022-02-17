import { InterestRate } from '@aave/contract-helpers';
import { PlusSmIcon } from '@heroicons/react/outline';
import { CheckIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3ContextProvider';

export type SuccessTxViewProps = {
  action?: string;
  amount?: string;
  symbol?: string;
  collateral?: boolean;
  rate?: InterestRate;
  addToken?: ERC20TokenType;
};

export const TxSuccessView = ({
  action,
  amount,
  symbol,
  collateral,
  rate,
  addToken,
}: SuccessTxViewProps) => {
  const { addERC20Token } = useWeb3Context();

  return (
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
          backgroundColor: '#ECF8ED99',
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

      <Box sx={{ mt: '8px' }}>
        {action && amount && symbol && (
          <Typography>
            <Trans>
              You {action} {amount} {symbol}
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
        {addToken && (
          <Button variant="outlined" onClick={() => addERC20Token(addToken)}>
            <Typography variant="buttonS">
              <SvgIcon>
                <PlusSmIcon />
              </SvgIcon>
              <Trans>ADD {addToken.symbol} TO THE WALLET</Trans>
            </Typography>
          </Button>
        )}
      </Box>
    </Box>
  );
};
