import { CheckIcon } from '@heroicons/react/solid';
import { Box, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
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
  const isDesktop = useMediaQuery(breakpoints.up('lg'));
  const isTablet = useMediaQuery(breakpoints.up('md'));

  return (
    <ListItem>
      <ListColumn align="center" maxWidth={isTablet ? 100 : 60}>
        <Box
          sx={(theme) => ({
            border: `2px solid ${theme.palette.text.secondary}`,
            background: checked ? theme.palette.text.secondary : theme.palette.background.paper,
            width: 16,
            height: 16,
            borderRadius: '2px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
          onClick={onCheckboxClick}
        >
          <SvgIcon sx={{ fontSize: '14px', color: 'background.paper' }}>
            <CheckIcon />
          </SvgIcon>
        </Box>
      </ListColumn>

      <ListColumn align="left" maxWidth={280}>
        <Row>
          <TokenIcon symbol={reserveIconSymbol} fontSize="large" />
          <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
            <Typography variant="h4" noWrap>
              {isDesktop ? reserveName : reserveSymbol}
            </Typography>
            <Typography
              sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
              variant="subheader2"
              color="text.muted"
              noWrap
            >
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
