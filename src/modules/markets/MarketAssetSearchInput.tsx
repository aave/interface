import { SearchIcon } from '@heroicons/react/outline';
import { XCircleIcon } from '@heroicons/react/solid';
import { Box, IconButton, InputBase, useMediaQuery, useTheme } from '@mui/material';
import debounce from 'lodash/debounce';
import { useMemo, useRef, useState } from 'react';

interface MarketAssetSearchInputProps {
  onSearchTermChange: (value: string) => void;
}

export const MarketAssetSearchInput = ({ onSearchTermChange }: MarketAssetSearchInputProps) => {
  const inputEl = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));

  const handleClear = () => {
    setSearchTerm('');
    onSearchTermChange('');
    inputEl.current?.focus();
  };

  const debounchedChangeHandler = useMemo(() => {
    return debounce((value: string) => {
      onSearchTermChange(value);
    }, 300);
  }, [onSearchTermChange]);

  if (sm) {
    return (
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          flexGrow: 1,
          gap: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '6px',
          height: '36px',
        })}
      >
        <Box sx={{ ml: 2, mt: 1 }}>
          <SearchIcon height={16} />
        </Box>
        <InputBase
          autoFocus
          inputRef={inputEl}
          sx={{ flexGrow: 1, fontSize: 16 }}
          placeholder="Search asset"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            debounchedChangeHandler(e.target.value);
          }}
        />
        <IconButton
          sx={{ p: 0, mr: 2, visibility: searchTerm ? 'visible' : 'hidden' }}
          onClick={() => handleClear()}
        >
          <XCircleIcon height={16} />
        </IconButton>
      </Box>
    );
  } else {
    return (
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '6px',
          height: '36px',
        })}
      >
        <Box sx={{ ml: 2, mt: 1 }}>
          <SearchIcon height={16} />
        </Box>
        <InputBase
          inputRef={inputEl}
          sx={{ width: '275px' }}
          placeholder="Search asset name, symbol, or address"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            debounchedChangeHandler(e.target.value);
          }}
        />
        <IconButton
          sx={{ p: 0, mr: 2, visibility: searchTerm ? 'visible' : 'hidden' }}
          onClick={() => handleClear()}
        >
          <XCircleIcon height={16} />
        </IconButton>
      </Box>
    );
  }
};
