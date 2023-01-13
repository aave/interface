import { CheckIcon, MinusSmIcon } from '@heroicons/react/solid';
import { Box, SvgIcon, Typography, useTheme } from '@mui/material';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';

interface MigrationSelectionBoxProps {
  allSelected: boolean;
  numSelected: number;
  onSelectAllClick: () => void;
  disabled: boolean;
}

export const MigrationSelectionBox = ({
  numSelected,
  allSelected,
  onSelectAllClick,
  disabled,
}: MigrationSelectionBoxProps) => {
  const theme = useTheme();
  const selectionBoxStyle = {
    border: `2px solid ${theme.palette.text.secondary}`,
    background: theme.palette.text.secondary,
    width: 16,
    height: 16,
    borderRadius: '2px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (disabled) {
    return (
      <ListHeaderTitle>
        <Typography variant="main12" sx={{ fontWeight: 700 }}>
          <Box
            sx={{
              ...selectionBoxStyle,
              background: theme.palette.action.disabledBackground,
              border: `2px solid ${theme.palette.action.disabled}`,
              '&:hover': {
                cursor: 'not-allowed',
              },
            }}
          />
        </Typography>
      </ListHeaderTitle>
    );
  }
  return (
    <ListHeaderTitle onClick={onSelectAllClick}>
      <Typography variant="main12" sx={{ fontWeight: 700 }}>
        {allSelected ? (
          <Box sx={selectionBoxStyle}>
            <SvgIcon sx={{ fontSize: '14px', color: 'background.paper' }}>
              <CheckIcon />
            </SvgIcon>
          </Box>
        ) : numSelected !== 0 ? (
          <Box sx={selectionBoxStyle}>
            <SvgIcon sx={{ fontSize: '16px', color: 'background.paper' }}>
              <MinusSmIcon />
            </SvgIcon>
          </Box>
        ) : (
          <Box
            sx={{
              ...selectionBoxStyle,
              background: 'white',
            }}
          />
        )}
      </Typography>
    </ListHeaderTitle>
  );
};
