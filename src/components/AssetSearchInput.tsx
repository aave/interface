import { SearchIcon } from '@heroicons/react/outline';
import { XCircleIcon } from '@heroicons/react/solid';
import { Box, IconButton, InputBase } from '@mui/material';
import { useRef } from 'react';

export interface AssetSearchInputProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export const AssetSearchInput = ({ searchTerm, onSearchTermChange }: AssetSearchInputProps) => {
  const inputEl = useRef<HTMLInputElement>(null);

  const handleChange = (value: string) => {
    onSearchTermChange(value);
  };

  const handleClear = () => {
    handleChange('');
    inputEl.current?.focus();
  };

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
          handleChange(e.target.value);
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
};

export const AssetSearchInputMobile = ({
  searchTerm,
  onSearchTermChange,
}: AssetSearchInputProps) => {
  const inputEl = useRef<HTMLInputElement>(null);
  const handleChange = (value: string) => {
    onSearchTermChange(value);
  };

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
        ref={inputEl}
        autoFocus
        sx={{ flexGrow: 1 }}
        placeholder="Search asset"
        value={searchTerm}
        onChange={(e) => {
          handleChange(e.target.value);
        }}
      />
      <IconButton
        sx={{ p: 0, mr: 2, visibility: searchTerm ? 'visible' : 'hidden' }}
        onClick={() => {
          handleChange('');
          inputEl.current?.focus();
        }}
      >
        <XCircleIcon height={16} />
      </IconButton>
    </Box>
  );
};
