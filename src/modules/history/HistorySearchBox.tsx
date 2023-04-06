import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import SvgIcon from '@mui/material/SvgIcon';
import TextField from '@mui/material/TextField';
import React from 'react';

const SearchBox = () => {
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
