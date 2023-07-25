import { Trans } from '@lingui/macro';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import { utils } from 'ethers';
import Image from 'next/image';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
// import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import CustomNumberInput from 'src/maneki/components/CustomNumberInput';
import { useLeverageContext } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';

import { collateralAssetsType } from '../utils/leverageActionHelper';

interface SelectCollateralAssetProps {
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  currentCollateral: collateralAssetsType;
  setCurrentCollateral: (value: collateralAssetsType) => void;
}

export default function SelectCollateralAsset({
  amount,
  setAmount,
  currentCollateral,
  setCurrentCollateral,
}: SelectCollateralAssetProps) {
  const { collateralAssets } = useLeverageContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openAssetsMenu = Boolean(anchorEl);
  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuItemClick = (collateralAsset: collateralAssetsType) => {
    setAnchorEl(null);
    setCurrentCollateral(collateralAsset);
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: '5px 20px',
        border: 'solid 1px black',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <CustomNumberInput
          amountTo={amount}
          setAmountTo={setAmount}
          tokenBalance={utils.formatUnits(currentCollateral.balance, 18)}
          sx={{
            '& fieldset': {
              border: 'none',
            },
            '& .MuiOutlinedInput-root.Mui-focused': {
              '& > fieldset': {
                border: 'none',
                borderColor: 'orange',
              },
            },
          }}
          inputProps={{ style: { fontSize: '16px' } }}
        />
        <Box>
          <Button
            aria-controls={openAssetsMenu ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openAssetsMenu ? 'true' : undefined}
            onClick={handleClickMenu}
            sx={{ color: 'text.primary' }}
          >
            <Image
              alt={`token image for ${currentCollateral.token}`}
              src={`/icons/tokens/${currentCollateral.token.toLowerCase()}.svg`}
              width={32}
              height={32}
            />
            <Typography sx={{ fontWeight: '600', ml: '8px' }}>{currentCollateral.token}</Typography>
            <KeyboardArrowUpIcon
              sx={{
                fontSize: '20px',
                fontWeight: '400',
                transition: 'all 0.3s ease',
                transform: openAssetsMenu ? 'rotate(180deg)' : '',
              }}
            />
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={openAssetsMenu}
            onClose={() => setAnchorEl(null)}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
            PaperProps={{
              style: {
                minWidth: 'auto',
              },
            }}
          >
            {collateralAssets.map((asset, i) => (
              <MenuItem key={i} onClick={() => handleMenuItemClick(asset)}>
                <Image
                  alt={`token image for ${asset.token}`}
                  src={`/icons/tokens/${asset.token.toLowerCase()}.svg`}
                  width={32}
                  height={32}
                />
                <Typography sx={{ fontWeight: '600', ml: '8px' }}>{asset.token}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <FormattedNumber
          symbol="USD"
          value={Number(amount) * Number(utils.formatUnits(currentCollateral.value, 8))}
        />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '12px' }}>
            <Trans>Balance</Trans>:{' '}
          </Typography>
          {console.log(currentCollateral)}
          <FormattedNumber
            symbol={currentCollateral.token}
            value={utils.formatUnits(currentCollateral.balance, 18)}
            sx={{ fontSize: '12px' }}
            symbolSx={{ fontSize: '12px' }}
          />
          <Button
            onClick={() => {
              setAmount(utils.formatUnits(currentCollateral.balance, currentCollateral.decimals));
            }}
          >
            MAX
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
