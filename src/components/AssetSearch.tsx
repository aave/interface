import { SearchIcon } from '@heroicons/react/outline';
import { XCircleIcon } from '@heroicons/react/solid';
import { Box, IconButton, InputBase, useMediaQuery, useTheme } from '@mui/material';

export interface AssetSearchProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export const AssetSearch = ({ searchTerm, onSearchTermChange }: AssetSearchProps) => {
  // const [searchTerm, setSearchTerm] = useState('');
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));

  const handleChange = (value: string) => {
    onSearchTermChange(value);
  };

  // const debouncedHandleChange = useMemo(() => debounce(handleChange, 300), [handleChange]);

  let placeHolder = 'Search asset name, symbol, or address';
  if (sm) {
    placeHolder = 'Search asset';
  }

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        flexGrow: sm ? 1 : 0,
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
        sx={{ flexGrow: sm ? 1 : 0, width: sm ? 'unset' : '275px' }}
        placeholder={placeHolder}
        value={searchTerm}
        onChange={(e) => {
          handleChange(e.target.value);
        }}
      />
      <IconButton
        sx={{ p: 0, mr: 2, visibility: searchTerm ? 'visible' : 'hidden' }}
        onClick={() => handleChange('')}
      >
        <XCircleIcon height={16} />
      </IconButton>
    </Box>
  );
};

export const AssetSearchMobile = ({ searchTerm, onSearchTermChange }: AssetSearchProps) => {
  const handleChange = (value: string) => {
    onSearchTermChange(value);
  };

  // const debouncedHandleChange = useMemo(() => debounce(handleChange, 300), [handleChange]);

  const placeHolder = 'Search asset';

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
        sx={{ flexGrow: 1 }}
        placeholder={placeHolder}
        value={searchTerm}
        onChange={(e) => {
          handleChange(e.target.value);
        }}
      />
      <IconButton
        sx={{ p: 0, mr: 2, visibility: searchTerm ? 'visible' : 'hidden' }}
        onClick={() => handleChange('')}
      >
        <XCircleIcon height={16} />
      </IconButton>
    </Box>
  );
};
