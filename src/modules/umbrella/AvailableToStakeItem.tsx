import { Trans } from '@lingui/macro';
import { Box, Stack, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';

import { MultiIconWithTooltip } from './helpers/MultiIcon';

export const AvailableToStakeItem = ({ stakeData }: { stakeData: MergedStakeData }) => {
  const { underlyingWaTokenBalance, underlyingWaTokenATokenBalance, underlyingTokenBalance } =
    stakeData.formattedBalances;

  const icons = [];
  if (underlyingTokenBalance) {
    icons.push({
      src: stakeData.waTokenData.waTokenUnderlyingSymbol,
      aToken: false,
    });
  }
  if (underlyingWaTokenBalance) {
    icons.push({
      src: stakeData.waTokenData.waTokenUnderlyingSymbol,
      aToken: true,
    });
  }
  if (underlyingTokenBalance) {
    icons.push({
      src: stakeData.stakeTokenSymbol,
      aToken: false,
    });
  }

  const totalAvailableToStake =
    Number(underlyingTokenBalance) +
    Number(underlyingWaTokenBalance) +
    Number(underlyingWaTokenATokenBalance);

  return (
    <Stack direction="column" alignItems="center" justifyContent="center" gap={2}>
      <FormattedNumber compact value={totalAvailableToStake} variant="main16" />
      {stakeData.underlyingIsWaToken ? (
        <MultiIconWithTooltip
          icons={icons}
          tooltipContent={<AvailableToStakeTooltipContent stakeData={stakeData} />}
        />
      ) : (
        <TokenIcon symbol={stakeData.stakeTokenSymbol} sx={{ fontSize: '20px', mr: 1 }} />
      )}
      {/* <Button
        variant="outlined"
        size="medium"
        onClick={() => {
          openUmbrella(stakeData.stakeToken, stakeData.stakeTokenSymbol);
        }}
      >
        <Trans>Stake</Trans>
      </Button> */}
    </Stack>
  );
};

export const AvailableToStakeTooltipContent = ({ stakeData }: { stakeData: MergedStakeData }) => {
  const { underlyingWaTokenATokenBalance, underlyingWaTokenBalance, underlyingTokenBalance } =
    stakeData.formattedBalances;

  const { waTokenUnderlyingSymbol } = stakeData.waTokenData;

  return (
    <Stack direction="column" alignItems="center" justifyContent="center">
      <Typography variant="caption" color="text.secondary" mb={3}>
        <Trans>lorem ipsum</Trans>
      </Typography>
      <Box sx={{ width: '100%' }}>
        {underlyingWaTokenBalance && (
          <AssetRow
            symbol={waTokenUnderlyingSymbol}
            name={waTokenUnderlyingSymbol}
            value={underlyingWaTokenBalance}
          />
        )}
        {underlyingWaTokenATokenBalance && (
          <AssetRow
            symbol={waTokenUnderlyingSymbol}
            name={`a${waTokenUnderlyingSymbol}`}
            value={underlyingWaTokenATokenBalance}
            aToken
          />
        )}
        {underlyingTokenBalance && (
          <AssetRow
            symbol={stakeData.underlyingTokenSymbol}
            name={stakeData.underlyingTokenSymbol}
            value={underlyingTokenBalance}
          />
        )}
      </Box>
    </Stack>
  );
};

const AssetRow = ({
  symbol,
  name,
  value,
  aToken,
}: {
  symbol: string;
  name: string;
  value: string;
  aToken?: boolean;
}) => {
  return (
    <Row
      height={32}
      caption={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <TokenIcon symbol={symbol} sx={{ fontSize: '20px', mr: 1 }} aToken={aToken} />
          <Typography variant="secondary12">{name}</Typography>
        </Box>
      }
      width="100%"
    >
      <FormattedNumber value={value} compact variant="main16" />
    </Row>
  );
};
