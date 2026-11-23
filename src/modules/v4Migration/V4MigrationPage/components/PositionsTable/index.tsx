import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode, useState } from 'react';
import { TABLE_CARDS_BELOW } from 'src/components/lists/listBreakpoints';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListItem } from 'src/components/lists/ListItem';
import { ListMobileItem } from 'src/components/lists/ListMobileItem';
import { Row } from 'src/components/primitives/Row';
import { cardHeaderBandSx } from 'src/utils/cardStyles';

import { sortPositions, SortValue } from '../../utils/positions';

const ACTION_COLUMN_LAYOUT = { p: 0, minWidth: 108, maxWidth: 108 };

export interface PositionsColumn<T> {
  key: string;
  title: ReactNode;
  flex?: number;
  width?: number;
  isRow?: boolean;
  inCardHeader?: boolean;
  getSortValue: (position: T) => SortValue;
  render: (position: T) => ReactNode;
}

const columnLayout = <T,>({ flex, width }: PositionsColumn<T>) => ({
  p: 0,
  flex,
  minWidth: width,
  maxWidth: width,
});

interface PositionsTableProps<T> {
  title: ReactNode;
  positions: T[];
  columns: PositionsColumn<T>[];
  sortSource: string;
  onMigrate?: (position: T) => void;
}

export const PositionsTable = <T extends { id: string }>({
  title,
  positions,
  columns,
  sortSource,
  onMigrate,
}: PositionsTableProps<T>) => {
  const theme = useTheme();
  const showCards = useMediaQuery(theme.breakpoints.down(TABLE_CARDS_BELOW));
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  const sortedPositions = sortPositions(
    positions,
    columns.find((column) => column.key === sortName)?.getSortValue,
    sortDesc
  );
  const cardHeaderColumns = columns.filter((column) => column.inCardHeader);
  const cardBodyColumns = columns.filter((column) => !column.inCardHeader);

  return (
    <Paper variant="table">
      <Box
        sx={{
          ...cardHeaderBandSx,
          px: '1rem',
          borderTopLeftRadius: 'inherit',
          borderTopRightRadius: 'inherit',
        }}
      >
        <Typography variant="h5" component="h3" color="fg-1">
          {title}
        </Typography>
      </Box>

      {showCards ? (
        <Box>
          {sortedPositions.map((position) => (
            <ListMobileItem key={position.id} isIsolated={false}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', mb: '1.5rem' }}>
                {cardHeaderColumns.map((column) => (
                  <Box key={column.key} sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                    {column.render(position)}
                  </Box>
                ))}
              </Box>
              {cardBodyColumns.map((column) => (
                <Row key={column.key} caption={column.title} captionVariant="description" mb={3}>
                  {column.render(position)}
                </Row>
              ))}
              <Button
                variant="tertiary"
                fullWidth
                onClick={() => onMigrate?.(position)}
                sx={{ mt: '0.75rem' }}
              >
                <Trans>Migrate</Trans>
              </Button>
            </ListMobileItem>
          ))}
        </Box>
      ) : (
        <>
          <ListHeaderWrapper sx={{ pr: 3 }}>
            {columns.map((column) => (
              <ListColumn key={column.key} {...columnLayout(column)}>
                <ListHeaderTitle
                  sortKey={column.key}
                  sortName={sortName}
                  sortDesc={sortDesc}
                  setSortName={setSortName}
                  setSortDesc={setSortDesc}
                  source={sortSource}
                >
                  {column.title}
                </ListHeaderTitle>
              </ListColumn>
            ))}
            <ListColumn {...ACTION_COLUMN_LAYOUT} />
          </ListHeaderWrapper>

          {sortedPositions.map((position) => (
            <ListItem key={position.id} minHeight={72} sx={{ pr: 3 }}>
              {columns.map((column) => (
                <ListColumn key={column.key} {...columnLayout(column)} isRow={column.isRow}>
                  {column.render(position)}
                </ListColumn>
              ))}
              <ListColumn {...ACTION_COLUMN_LAYOUT} align="right">
                <Button variant="tertiary" size="small" onClick={() => onMigrate?.(position)}>
                  <Trans>Migrate</Trans>
                </Button>
              </ListColumn>
            </ListItem>
          ))}
        </>
      )}
    </Paper>
  );
};
