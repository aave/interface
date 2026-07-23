import { XCircleIcon } from '@heroicons/react/solid';
import { Box, BoxProps, IconButton, InputBase, useMediaQuery, useTheme } from '@mui/material';
import debounce from 'lodash/debounce';
import { useMemo, useRef, useState } from 'react';
import { SearchIcon } from 'src/components/icons/SearchIcon';
import { figVars } from 'src/utils/figmaColors';

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
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: `1px solid ${figVars['border-2']}`,
        borderRadius: '0.5rem',
        height: '36px',
        ...wrapperSx,
      }}
    >
      <SearchIcon sx={{ fontSize: 18, color: 'fg-icon', ml: 2, flexShrink: 0 }} />
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
      <IconButton
        sx={{ p: 0, mr: 2, visibility: searchTerm ? 'visible' : 'hidden' }}
        onClick={() => handleClear()}
      >
        <XCircleIcon height={16} />
      </IconButton>
    </Box>
  );
};
