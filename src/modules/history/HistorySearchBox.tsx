import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import SvgIcon from '@mui/material/SvgIcon';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <TextField
      sx={{
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '4px',
        width: 280,
        height: 36,
        justifyContent: 'left',
        '& .MuiInputBase-root': {
          alignItems: 'center',
          height: '100%',
        },
        '& .MuiInputBase-input': {
          fontSize: '0.875rem',
          color: 'text.primary',
          '&::placeholder': {
            color: 'text.muted',
          },
        },
      }}
      value={searchQuery}
      onChange={handleInputChange}
      placeholder={'Search assets...'} // TODO: i18n
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SvgIcon height={10} width={10} color="primary">
              <SearchIcon />
            </SvgIcon>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBox;
