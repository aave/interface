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
import { AssetSearchInput, AssetSearchInputMobile } from 'src/components/AssetSearchInput';

export interface AssetListTitleProps {
  marketTitle: string;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export const AssetListTitle = ({
  marketTitle,
  searchTerm,
  onSearchTermChange,
}: AssetListTitleProps) => {
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
            {sm ? (
              <>
                <AssetSearchInputMobile
                  searchTerm={searchTerm}
                  onSearchTermChange={onSearchTermChange}
                />
                <Button sx={{ ml: 2 }} onClick={() => handleCancelClick()}>
                  <Typography variant="buttonM">
                    <Trans>Cancel</Trans>
                  </Typography>
                </Button>
              </>
            ) : (
              <AssetSearchInput searchTerm={searchTerm} onSearchTermChange={onSearchTermChange} />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
