import { t } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

type NoSearchResultsProps = {
  searchTerm?: string;
  subtitle?: ReactNode;
};

export const NoSearchResults: React.FC<NoSearchResultsProps> = ({ searchTerm, subtitle }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
        pt: 15,
        pb: 32,
        px: 4,
      }}
    >
      {/* Title: H5, fg-max, centered; a long keyword ellipsizes rather than wrapping. */}
      <Typography variant="h5" color="fg-max" noWrap sx={{ textAlign: 'center', maxWidth: '100%' }}>
        {searchTerm ? t`No search results for` + ` '${searchTerm}'` : t`No search results`}
      </Typography>
      {/* Description: fg-3 "Paragraph" (0.875rem / 400 / 1.1875rem), supplied per search context. */}
      {subtitle && (
        <Typography
          variant="description"
          color="fg-3"
          sx={{
            textAlign: 'center',
            maxWidth: '280px',
            lineHeight: '1.1875rem',
            letterSpacing: 'normal',
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};
