import { CircularProgress, Paper, PaperProps, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface EmptyStatePaperProps extends Omit<PaperProps, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** Optional action rendered under the description (e.g. a connect button). */
  children?: ReactNode;
  /** When true, replaces the content with a centered spinner. */
  loading?: boolean;
}

/**
 * Shared empty-state card: a centered, outlined paper with an H5 title, a muted description, and
 * an optional action slot. Single source of truth for the app's "No Wallet Connected" /
 * "No Positions" style empty states so their look + padding stay in sync.
 */
export const EmptyStatePaper = ({
  title,
  description,
  children,
  loading,
  sx,
  ...rest
}: EmptyStatePaperProps) => (
  <Paper
    variant="outlined"
    {...rest}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      p: '3rem 1rem',
      flex: 1,
      borderRadius: '0.625rem',
      ...sx,
    }}
  >
    {loading ? (
      <CircularProgress />
    ) : (
      <>
        <Typography variant="h5" color="fg-1" sx={{ mb: 2 }}>
          {title}
        </Typography>
        {description && (
          <Typography
            variant="description"
            color="fg-3"
            sx={{ mb: children ? 6 : 0, lineHeight: '1.1875rem' }}
          >
            {description}
          </Typography>
        )}
        {children}
      </>
    )}
  </Paper>
);
