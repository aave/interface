import { SearchIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  IconButton,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

import { SearchInput } from '../../components/SearchInput';

interface MarketAssetListTitleProps {
  marketTitle: string;
  onSearchTermChange: (value: string) => void;
}

export const MarketAssetListTitle = ({
  marketTitle,
  onSearchTermChange,
}: MarketAssetListTitleProps) => {
  const [showSearchBar, setShowSearchBar] = useState(false);

  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));

  const showSearchIcon = sm && !showSearchBar;
  const showMarketTitle = !sm || !showSearchBar;

  const handleCancelClick = () => {
    setShowSearchBar(false);
    onSearchTermChange('');
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {showMarketTitle && (
        <Typography component="div" variant="h2" sx={{ mr: 4 }}>
          {marketTitle} <Trans>assets</Trans>
        </Typography>
      )}
      <Box
        sx={{
          height: '40px',
          width: showSearchBar && sm ? '100%' : 'unset',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {showSearchIcon && (
          <IconButton onClick={() => setShowSearchBar(true)}>
            <SvgIcon>
              <SearchIcon />
            </SvgIcon>
          </IconButton>
        )}
        {(showSearchBar || !sm) && (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <SearchInput
              wrapperSx={{
                width: {
                  xs: '100%',
                  sm: '340px',
                },
              }}
              placeholder={sm ? 'Search asset' : 'Search asset name, symbol, or address'}
              onSearchTermChange={onSearchTermChange}
            />
            {sm && (
              <Button sx={{ ml: 2 }} onClick={() => handleCancelClick()}>
                <Typography variant="buttonM">
                  <Trans>Cancel</Trans>
                </Typography>
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
