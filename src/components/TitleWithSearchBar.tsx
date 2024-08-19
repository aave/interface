import { SearchIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  IconButton,
  SvgIcon,
  Typography,
  TypographyProps,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ReactNode, useState } from 'react';

import { SearchInput } from './SearchInput';

interface TitleWithSearchBarProps<C extends React.ElementType> {
  onSearchTermChange: (value: string) => void;
  searchPlaceholder: string;
  titleProps?: TypographyProps<C, { component?: C }>;
  title: ReactNode;
}

export const TitleWithSearchBar = <T extends React.ElementType>({
  onSearchTermChange,
  searchPlaceholder,
  titleProps,
  title,
}: TitleWithSearchBarProps<T>) => {
  const [showSearchBar, setShowSearchBar] = useState(false);

  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));

  const showSearchIcon = sm && !showSearchBar;
  const showMarketTitle = !sm || !showSearchBar;

  const handleCancelClick = () => {
    setShowSearchBar(false);
    onSearchTermChange('');
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
      }}
    >
      {showMarketTitle && (
        <Typography variant="h2" {...titleProps}>
          {title}
        </Typography>
      )}
      <Box
        sx={(theme) => ({
          height: '40px',
          width: showSearchBar && sm ? '100%' : 'unset',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          input: {
            '&::placeholder': {
              fontSize: 14,
              fontWeight: 500,
              color: theme.palette.text.subTitle,
            },
          },
        })}
      >
        {showSearchIcon && (
          <IconButton onClick={() => setShowSearchBar(true)}>
            <SvgIcon>
              <SearchIcon />
            </SvgIcon>
          </IconButton>
        )}
        {(showSearchBar || !sm) && (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <SearchInput
              wrapperSx={{
                width: {
                  xs: '100%',
                  sm: '340px',
                },
              }}
              placeholder={searchPlaceholder}
              onSearchTermChange={onSearchTermChange}
            />
            {sm && (
              <Button sx={{ ml: 2 }} onClick={() => handleCancelClick()} size="small">
                <Trans>Cancel</Trans>
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
