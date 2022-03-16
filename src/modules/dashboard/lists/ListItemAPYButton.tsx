import { InterestRate } from '@aave/contract-helpers';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
} from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { CustomMarket } from 'src/ui-config/marketsConfig';

interface ListItemAPYButtonProps {
  stableBorrowRateEnabled: boolean;
  borrowRateMode: string;
  disabled: boolean;
  onClick: () => void;
  stableBorrowAPY: string;
  variableBorrowAPY: string;
  underlyingAsset: string;
  currentMarket: CustomMarket;
}

export const ListItemAPYButton = ({
  stableBorrowRateEnabled,
  borrowRateMode,
  disabled,
  onClick,
  stableBorrowAPY,
  variableBorrowAPY,
  underlyingAsset,
  currentMarket,
}: ListItemAPYButtonProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        size="small"
        endIcon={
          stableBorrowRateEnabled && (
            <SvgIcon sx={{ fontSize: '14px !important' }}>
              {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </SvgIcon>
          )
        }
        disabled={disabled}
        data-cy={`apyButton_${borrowRateMode}`}
      >
        {borrowRateMode}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        keepMounted={true}
        data-cy={`apyMenu_${borrowRateMode}`}
      >
        <Typography variant="subheader2" sx={{ px: 4, py: 3 }}>
          <Trans>Select APY type to switch</Trans>
        </Typography>

        <MenuItem
          selected={borrowRateMode === InterestRate.Variable}
          value={InterestRate.Variable}
          onClick={() => {
            if (borrowRateMode === InterestRate.Stable) {
              onClick();
            }
            handleClose();
          }}
        >
          <ListItemIcon>
            <SvgIcon>{borrowRateMode === InterestRate.Variable && <CheckIcon />}</SvgIcon>
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'description' }}>
            <Trans>APY, variable</Trans>
          </ListItemText>
          <FormattedNumber value={Number(variableBorrowAPY)} percent variant="description" />
        </MenuItem>

        <MenuItem
          selected={borrowRateMode === InterestRate.Stable}
          value={InterestRate.Stable}
          onClick={() => {
            if (borrowRateMode === InterestRate.Variable) {
              onClick();
            }
            handleClose();
          }}
        >
          <ListItemIcon>
            <SvgIcon>{borrowRateMode === InterestRate.Stable && <CheckIcon />}</SvgIcon>
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'description' }}>
            <Trans>APY, stable</Trans>
          </ListItemText>
          <FormattedNumber value={Number(stableBorrowAPY)} percent variant="description" />
        </MenuItem>

        <Divider />

        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Button
            sx={{ my: 2, ml: 4 }}
            size="small"
            component={Link}
            target="_blank"
            href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
            endIcon={
              <SvgIcon>
                <ExternalLinkIcon />
              </SvgIcon>
            }
          >
            <Trans>SEE CHARTS</Trans>
          </Button>
        </Box>
      </Menu>
    </>
  );
};
