import { useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

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
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  return (
    <ListWrapper title={title} withTopMargin={withTopMargin}>
      <>
        {!downToXSM && <ListHeader head={head} />}
        {!downToXSM ? (
          <>
            <ListItemLoader />
            <ListItemLoader />
          </>
        ) : (
          <MobileListItemLoader />
        )}
      </>
    </ListWrapper>
  );
};
