import { Box, IconButton, InputBase, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import { XIcon, SearchIcon } from '@heroicons/react/outline';

export interface AssetSearchProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export const AssetSearch = ({ searchTerm, onSearchTermChange }: AssetSearchProps) => {
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));

  console.log('sm', sm);
  const handleChange = (value: string) => {
    onSearchTermChange(value);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid black' }}>
      <SvgIcon>
        <SearchIcon />
      </SvgIcon>
      <InputBase value={searchTerm} onChange={(e) => handleChange(e.target.value)} />
      <IconButton onClick={() => handleChange('')}>
        <SvgIcon>
          <XIcon />
        </SvgIcon>
      </IconButton>
    </Box>
  );
};
