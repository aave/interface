import { Trans } from '@lingui/macro';
import { Button, Menu, MenuItem, Skeleton, Stack, SvgIcon } from '@mui/material';
import { useState } from 'react';
import { ChevronDownIcon } from 'src/components/icons/ChevronDownIcon';
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
  onFeeTokenChanged: (symbol: string) => void;
  bridgeFeeFormatted: string;
  bridgeFeeUSD: string;
  loading: boolean;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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
          color="fg-2"
        >
          Learn more
        </Link>
      </Trans>
    </TextWithTooltip>
  );

  return (
    <Row caption={feeTooltip} captionVariant="description" mb={4}>
      <Button
        variant="text"
        size="small"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        startIcon={<TokenIcon symbol={selectedFeeToken.symbol} sx={{ fontSize: '16px' }} />}
        endIcon={
          <SvgIcon
            sx={{
              fontSize: '16px',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            <ChevronDownIcon />
          </SvgIcon>
        }
        sx={{ mr: 'auto', px: 0, '&:hover': { backgroundColor: 'transparent' } }}
      >
        {selectedFeeToken.symbol}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {feeTokens.map((token) => (
          <MenuItem
            key={token.symbol}
            selected={token.symbol === selectedFeeToken.symbol}
            onClick={() => {
              onFeeTokenChanged(token.symbol);
              setAnchorEl(null);
            }}
          >
            <TokenIcon symbol={token.symbol} sx={{ fontSize: '16px', mr: 2 }} />
            {token.symbol}
          </MenuItem>
        ))}
      </Menu>
      {!bridgeFeeFormatted && !loading ? (
        <NoData variant="h5" color="fg-2" />
      ) : loading ? (
        <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
      ) : (
        <Stack direction="column" alignItems="flex-end" position="relative">
          <Stack direction="row" alignItems="center">
            <TokenIcon symbol={selectedFeeToken?.symbol} sx={{ mr: 1, fontSize: '16px' }} />
            <FormattedNumber
              value={bridgeFeeFormatted}
              symbol={selectedFeeToken?.symbol}
              variant="h5"
            />
          </Stack>
          <FormattedNumber
            value={bridgeFeeUSD}
            variant="helperText"
            compact
            symbol="USD"
            color="fg-2"
            sx={{ position: 'absolute', top: '20px' }}
          />
        </Stack>
      )}
    </Row>
  );
};
