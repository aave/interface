import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { LIST_CARDS_BELOW } from 'src/components/lists/listBreakpoints';

import { ListWrapper } from '../../../components/lists/ListWrapper';
import { ListHeader } from './ListHeader';
import { ListItemLoader } from './ListItemLoader';
import { MobileListItemLoader } from './MobileListItemLoader';

interface ListLoaderProps {
  title: ReactNode;
  withTopMargin?: boolean;
  head: ReactNode[];
}

export const ListLoader = ({ title, withTopMargin, head }: ListLoaderProps) => {
  const theme = useTheme();
  const showCards = useMediaQuery(theme.breakpoints.down(LIST_CARDS_BELOW));

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          {title}
        </Typography>
      }
      withTopMargin={withTopMargin}
    >
      <>
        {!showCards && <ListHeader head={head} />}
        {!showCards ? (
          <>
            <ListItemLoader columns={head.length} />
            <ListItemLoader columns={head.length} />
          </>
        ) : (
          <MobileListItemLoader />
        )}
      </>
    </ListWrapper>
  );
};
