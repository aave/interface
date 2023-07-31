import { Link, Typography } from '@mui/material';

export default function MarketsSglpLeverageButton() {
  return (
    <Link
      sx={{
        color: '#FEFEFE',
        px: 2,
        borderRadius: '12px',
        background: (theme) => theme.palette.gradients.aaveGradient,
        display: 'inline-block',
        ml: 4,
      }}
      href="/leverage"
      underline="none"
    >
      <Typography variant="subheader2">2x-12x</Typography>
    </Link>
  );
}
