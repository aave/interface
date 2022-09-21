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
}

export const AssetListTitle = ({ marketTitle }: AssetListTitleProps) => {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));

  return (
    <Box
      sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
    >
      {(!showSearchBar || !sm) && (
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          {marketTitle} <Trans>assets</Trans>
        </Typography>
      )}
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
        {sm && !showSearchBar && (
          <IconButton onClick={() => setShowSearchBar(true)}>
            <SvgIcon>
              <SearchIcon />
            </SvgIcon>
          </IconButton>
        )}
        {(showSearchBar || !sm) && (
          <Box>
            <AssetSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
            {sm && <Button onClick={() => setShowSearchBar(false)}>Cancel</Button>}
          </Box>
        )}
      </Box>
    </Box>
  );
};
