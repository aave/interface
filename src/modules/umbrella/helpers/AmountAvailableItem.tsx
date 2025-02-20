import { Stack, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

export const AmountAvailableItem = ({
  symbol,
  name,
  value,
  aToken,
  waToken,
}: {
  symbol: string;
  name: string;
  value: string;
  aToken?: boolean;
  waToken?: boolean;
}) => {
  return (
    <Row
      sx={{ mb: 2 }}
      caption={
        <Stack direction="row" alignItems="center">
          <TokenIcon
            symbol={symbol}
            sx={{ fontSize: '20px', mr: 1 }}
            aToken={aToken}
            waToken={waToken}
          />
          <Typography variant="secondary12">{name}</Typography>
        </Stack>
      }
      width="100%"
    >
      <FormattedNumber value={value} compact variant="secondary12" />
    </Row>
  );
};
