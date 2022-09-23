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
import { AssetSearch } from 'src/components/AssetSearch';

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

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {(!showSearchBar || !sm) && (
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
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
        {sm && !showSearchBar && (
          <IconButton onClick={() => setShowSearchBar(true)}>
            <SvgIcon>
              <SearchIcon />
            </SvgIcon>
          </IconButton>
        )}
        {(showSearchBar || !sm) && (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <AssetSearch searchTerm={searchTerm} onSearchTermChange={onSearchTermChange} />
            {sm && (
              <Button sx={{ ml: 2 }} onClick={() => setShowSearchBar(false)}>
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
