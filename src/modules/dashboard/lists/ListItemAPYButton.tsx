import * as React from 'react';
import { InterestRate } from '@aave/contract-helpers';
import { Box, Button, Divider, Link, Menu, MenuItem, SvgIcon, Typography } from '@mui/material';
import { Trans } from '@lingui/macro';
import { CheckIcon, ChevronDownIcon, ExternalLinkIcon } from '@heroicons/react/outline';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ROUTES } from 'src/components/primitives/Link';

interface ListItemAPYButtonProps {
  stableBorrowRateEnabled: boolean;
  borrowRateMode: string;
  disabled: boolean;
  onClick: () => void;
  stableBorrowAPY: string;
  variableBorrowAPY: string;
  underlyingAsset: string;
}

export const ListItemAPYButton = ({
  stableBorrowRateEnabled,
  borrowRateMode,
  disabled,
  onClick,
  stableBorrowAPY,
  variableBorrowAPY,
  underlyingAsset,
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
              <ChevronDownIcon />
            </SvgIcon>
          )
        }
        disabled={disabled}
        data-cy={'apyButton'}
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
      >
        <Typography variant="description">
          <Trans>Select APY type to switch</Trans>
        </Typography>
        <MenuItem value={InterestRate.Stable} onClick={onClick}>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Typography variant="description" sx={{ display: 'flex', flexDirection: 'row' }}>
              {borrowRateMode === InterestRate.Stable && <CheckIcon />}
              <Trans>
                APY, <Trans>stable</Trans>
              </Trans>
            </Typography>
            <FormattedNumber value={Number(stableBorrowAPY)} percent variant="description" />
          </Box>
        </MenuItem>
        <MenuItem value={InterestRate.Variable} onClick={onClick}>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              {borrowRateMode === InterestRate.Variable && <CheckIcon />}
              <Typography variant="description">
                <Trans>
                  APY, <Trans>variable</Trans>
                </Trans>
              </Typography>
            </Box>
            <FormattedNumber value={Number(variableBorrowAPY)} percent variant="description" />
          </Box>
        </MenuItem>
        <Divider />
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Typography
            component={Link}
            href={ROUTES.reserveOverview(underlyingAsset)}
            variant="buttonS"
          >
            <Trans>SEE CHARTS</Trans>
          </Typography>
          <ExternalLinkIcon />
        </Box>
      </Menu>
    </>
  );
};
