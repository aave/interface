import { CheckIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { NoData } from 'src/components/primitives/NoData';

interface MigrationMobileListProps {
  titleComponent: ReactNode;
  isBottomOnMobile?: boolean;
  children: ReactNode;
  onSelectAllClick: () => void;
  loading?: boolean;
  isAvailable: boolean;
  emodeCategoryId?: number;
  allSelected: boolean;
  numSelected: number;
  numAvailable: number;
}

export const MigrationMobileList = ({
  titleComponent,
  isBottomOnMobile,
  children,
  onSelectAllClick,
  loading,
  isAvailable,
  allSelected,
  numSelected,
  numAvailable,
}: MigrationMobileListProps) => {
  const paperWidth = '100%';

  return (
    <Box sx={{ width: paperWidth, mt: { xs: isBottomOnMobile ? 2 : 0, lg: 0 } }}>
      <ListWrapper
        titleComponent={
          <Typography component="div" variant="h3" sx={{ mr: 4 }}>
            {titleComponent}
          </Typography>
        }
      >
        {(isAvailable || loading) && (
          <ListHeaderWrapper>
            <ListColumn align="center" maxWidth={40} minWidth={40}>
              <ListHeaderTitle onClick={onSelectAllClick}>
                <Typography variant="main12" sx={{ fontWeight: 700 }}>
                  {allSelected ? (
                    <Box
                      sx={(theme) => ({
                        border: `2px solid ${theme.palette.text.secondary}`,
                        background: theme.palette.text.secondary,
                        width: 16,
                        height: 16,
                        borderRadius: '2px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      })}
                    >
                      <SvgIcon sx={{ fontSize: '14px', color: 'background.paper' }}>
                        <CheckIcon />
                      </SvgIcon>
                    </Box>
                  ) : (
                    <Box
                      sx={(theme) => ({
                        border: `2px solid ${theme.palette.text.secondary}`,
                        background: theme.palette.text.secondary,
                        width: 16,
                        height: 16,
                        borderRadius: '2px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      })}
                    >
                      <NoData color="white" variant="secondary12" />
                    </Box>
                  )}
                </Typography>
              </ListHeaderTitle>
            </ListColumn>

            <Box
              sx={{
                width: 140,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="subheader2" color="text.secondary">
                <Trans>
                  {numSelected}/{numAvailable} assets selected
                </Trans>
              </Typography>
            </Box>
          </ListHeaderWrapper>
        )}

        {children}
      </ListWrapper>
    </Box>
  );
};
