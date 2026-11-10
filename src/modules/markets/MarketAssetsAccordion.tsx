import { Alert, Box, ButtonBase, Collapse, Paper, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';
import { ChevronDownIcon } from 'src/components/icons/ChevronDownIcon';

interface MarketAssetsAccordionProps {
  title: ReactNode;
  count: number;
  /** Info banner shown above the table when the section is open. */
  notice?: ReactNode;
  children: ReactNode;
}

/** Collapsed-by-default table below the main markets table, e.g. restricted assets. */
export const MarketAssetsAccordion = ({
  title,
  count,
  notice,
  children,
}: MarketAssetsAccordionProps) => {
  const [open, setOpen] = useState(false);

  if (count === 0) return null;

  return (
    <Box>
      <ButtonBase
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        sx={{
          gap: 2,
          py: 1,
          color: 'fg-1',
          '&:hover, &.Mui-focusVisible': { color: 'fg-2' },
        }}
      >
        <ChevronDownIcon
          sx={{
            fontSize: 16,
            transform: open ? 'none' : 'rotate(-90deg)',
            transition: 'transform 0.2s ease',
          }}
        />
        <Typography variant="h3" color="inherit">
          {title} ({count})
        </Typography>
      </ButtonBase>
      <Collapse in={open} unmountOnExit>
        <Paper variant="table" sx={{ mt: 4 }}>
          {notice && (
            <Box sx={{ pt: 4, px: { xs: 4, xsm: 6 } }}>
              <Alert severity="info" sx={{ mb: 6, width: '100%' }}>
                {notice}
              </Alert>
            </Box>
          )}
          {children}
        </Paper>
      </Collapse>
    </Box>
  );
};
