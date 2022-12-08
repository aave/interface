import { Box, Typography } from '@mui/material';

type GhoGraphMetaHeaderProps = {
  metaValue: string;
  title: string;
  subtitle?: string;
};

export const GhoGraphMetaHeader = ({
  metaValue,
  title,
  subtitle,
}: GhoGraphMetaHeaderProps): JSX.Element => {
  return (
    <Box
      sx={{
        mb: 8,
        mr: 6,
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      <Typography variant="secondary12" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="secondary21">{metaValue}</Typography>
      {subtitle && (
        <Typography variant="secondary12" color="text.muted">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};
