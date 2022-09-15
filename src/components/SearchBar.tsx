import { Box, IconButton, InputBase, SvgIcon } from '@mui/material';
import { XCircleIcon, SearchIcon } from '@heroicons/react/solid';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <Box
      sx={{ border: '1px solid black', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
    >
      <SvgIcon sx={{ mx: 2 }}>
        <SearchIcon />
      </SvgIcon>
      <InputBase
        placeholder="asdfasf"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
      <IconButton onClick={() => onChange('')}>
        <XCircleIcon height={16} />
      </IconButton>
    </Box>
  );
};
