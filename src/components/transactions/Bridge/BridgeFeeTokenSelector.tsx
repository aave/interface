import { Trans } from '@lingui/macro';
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  useTheme,
} from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { NoData } from 'src/components/primitives/NoData';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

interface FeeToken {
  address: string;
  symbol: string;
}

export const BridgeFeeTokenSelector = ({
  feeTokens,
  selectedFeeToken,
  onFeeTokenChanged,
  bridgeFeeFormatted,
  bridgeFeeUSD,
  loading,
}: {
  feeTokens: FeeToken[];
  selectedFeeToken: FeeToken;
  onFeeTokenChanged: (event: SelectChangeEvent) => void;
  bridgeFeeFormatted: string;
  bridgeFeeUSD: string;
  loading: boolean;
}) => {
  const theme = useTheme();

  const feeTooltip = (
    <TextWithTooltip text={<Trans>Fee</Trans>}>
      <Trans>
        The fee includes the gas cost to complete the transaction on the destination chain and the
        fee paid to Chainlink CCIP service providers. You can chose to pay in the network token or
        GHO.{' '}
        <Link
          href="https://docs.chain.link/ccip/billing"
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          Learn more
        </Link>
      </Trans>
    </TextWithTooltip>
  );

  return (
    <Row caption={feeTooltip} captionVariant="description" mb={4}>
      <FormControl sx={{ mr: 'auto' }}>
        <Select
          labelId="token-select-label"
          value={selectedFeeToken.symbol}
          onChange={onFeeTokenChanged}
          sx={{
            fontSize: '1.0em',
            width: 'auto',
            height: '24px',
            minWidth: '70px',
            borderRadius: '4px',
            mb: 0.5,
            maxWidth: '80px',
            '.MuiSelect-select': {
              backgroundColor: theme.palette.mode === 'dark' ? '#292E41' : '#FFFFFF',

              paddingLeft: '2px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: theme.palette.mode === 'dark' ? '#292E41' : '#FFFFFF',
                fontSize: '1.0em',
              },
            },
          }}
        >
          {feeTokens.map((token) => (
            <MenuItem
              key={token.symbol}
              value={token.symbol}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? '#383D51' : '#FFFFFF',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#292E41' : '#EAEBEF',
                },
                '&.Mui-selected, &.Mui-selected:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#292E41' : '#FFFFFF',
                  boxShadow: '0px 1px 0px rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              <Box display="flex" alignItems={'center'}>
                <TokenIcon sx={{ fontSize: '1em', mr: 1 }} symbol={token.symbol} />
                {token.symbol}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {!bridgeFeeFormatted && !loading ? (
        <NoData variant="secondary14" color="text.secondary" />
      ) : loading ? (
        <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
      ) : (
        <Stack direction="column" alignItems="flex-end" position="relative">
          <Stack direction="row" alignItems="center">
            <TokenIcon symbol={selectedFeeToken?.symbol} sx={{ mr: 1, fontSize: '16px' }} />
            <FormattedNumber
              value={bridgeFeeFormatted}
              symbol={selectedFeeToken?.symbol}
              variant="secondary14"
            />
          </Stack>
          <FormattedNumber
            value={bridgeFeeUSD}
            variant="helperText"
            compact
            symbol="USD"
            color="text.secondary"
            sx={{ position: 'absolute', top: '20px' }}
          />
        </Stack>
      )}
    </Row>
  );
};
