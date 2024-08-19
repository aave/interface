import { SearchIcon } from '@heroicons/react/outline';
import { XCircleIcon } from '@heroicons/react/solid';
import { Box, BoxProps, IconButton, InputBase, useMediaQuery, useTheme } from '@mui/material';
import debounce from 'lodash/debounce';
import React, { useMemo, useRef, useState } from 'react';

interface SearchInputProps {
  onSearchTermChange: (value: string) => void;
  wrapperSx?: BoxProps;
  placeholder: string;
  disableFocus?: boolean;
}

export const SearchInput = ({
  onSearchTermChange,
  wrapperSx,
  placeholder,
  disableFocus,
}: SearchInputProps) => {
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
  return (
    <Box
      sx={[
        (theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          border: `1px solid ${theme.palette.border.contents}`,
          borderRadius: 2,
          height: '42px',
        }),
        ...(Array.isArray(wrapperSx) ? wrapperSx : [wrapperSx]),
      ]}
    >
      <Box sx={(theme) => ({ ml: 2, mt: 1, color: theme.palette.text.secondary })}>
        <SearchIcon height={20} />
      </Box>
      <InputBase
        autoFocus={sm}
        inputRef={inputEl}
        sx={{ width: '100%', fontSize: { xs: 16, sm: 14 } }}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          debounchedChangeHandler(e.target.value);
        }}
        onKeyDown={(event) => {
          if (disableFocus) event.stopPropagation();
        }}
      />
      <Box
        sx={() => ({
          cursor: 'pointer',
          height: 'auto',
          width: 'auto',
          display: 'flex',
          alignItems: 'center',
          ml: 'auto',
          p: 0,
          mr: 2,
          visibility: searchTerm ? 'visible' : 'hidden',
        })}
        onClick={() => handleClear()}
      >
        <XCircleIcon width={16} height={16} />
      </Box>
    </Box>
  );
};
