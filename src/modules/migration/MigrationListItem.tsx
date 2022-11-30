import { Box, Checkbox, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

interface MigrationListItemProps {
  checked: boolean;
  reserveIconSymbol: string;
  reserveName: string;
  reserveSymbol: string;
  amount: string;
  amountInUSD: string;
  onCheckboxClick: () => void;
}

export const MigrationListItem = ({
  checked,
  reserveIconSymbol,
  reserveName,
  reserveSymbol,
  amount,
  amountInUSD,
  onCheckboxClick,
}: MigrationListItemProps) => {
  const { breakpoints } = useTheme();
  const downToXSM = useMediaQuery(breakpoints.down('xsm'));

  return (
    <ListItem px={downToXSM ? 4 : 6}>
      <ListColumn align="center" maxWidth={100}>
        <Box sx={{ ml: '-13px' }}>
          <Checkbox
            value={checked}
            checked={checked} // TODO: need fix checked state
            onChange={onCheckboxClick}
          />
        </Box>
      </ListColumn>

      <ListColumn align="left" maxWidth={280}>
        <Row>
          <TokenIcon symbol={reserveIconSymbol} fontSize="large" />
          <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
            <Typography variant="h4" noWrap>
              {reserveName}
            </Typography>
            <Typography variant="subheader2" color="text.muted" noWrap>
              {reserveSymbol}
            </Typography>
          </Box>
        </Row>
      </ListColumn>

      <ListColumn align="right">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 0.5 }}>
            <FormattedNumber value={amount} variant="secondary14" />
          </Box>
          <FormattedNumber
            value={amountInUSD}
            variant="secondary12"
            color="text.secondary"
            symbol="USD"
          />
        </Box>
      </ListColumn>
    </ListItem>
  );
};
