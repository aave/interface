import { CheckIcon, MinusSmIcon } from '@heroicons/react/solid';
import { Box, SvgIcon } from '@mui/material';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { figVars } from 'src/utils/figmaColors';

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
  const selectionBoxStyle = {
    border: `2px solid ${figVars['fg-2']}`,
    background: figVars['fg-2'],
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
        <Box
          sx={{
            ...selectionBoxStyle,
            background: figVars['disabled-bg'],
            border: `2px solid ${figVars['disabled-fg']}`,
            '&:hover': {
              cursor: 'not-allowed',
            },
          }}
        />
      </ListHeaderTitle>
    );
  }
  return (
    <ListHeaderTitle onClick={onSelectAllClick}>
      {allSelected ? (
        <Box sx={selectionBoxStyle} data-cy={`migration-checkbox-all`}>
          <SvgIcon sx={{ fontSize: '14px', color: 'surface-elevated' }}>
            <CheckIcon />
          </SvgIcon>
        </Box>
      ) : numSelected !== 0 ? (
        <Box sx={selectionBoxStyle} data-cy={`migration-checkbox-all`}>
          <SvgIcon sx={{ fontSize: '16px', color: 'surface-elevated' }}>
            <MinusSmIcon />
          </SvgIcon>
        </Box>
      ) : (
        <Box
          sx={{
            ...selectionBoxStyle,
            background: 'white',
          }}
          data-cy={`migration-checkbox-all`}
        />
      )}
    </ListHeaderTitle>
  );
};
