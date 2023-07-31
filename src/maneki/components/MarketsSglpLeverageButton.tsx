import { Link, Typography } from '@mui/material';

export default function MarketsSglpLeverageButton() {
  return (
    <Link
      sx={{
        color: '#FEFEFE',
        px: 2,
        borderRadius: '12px',
        background: (theme) => theme.palette.gradients.aaveGradient,
        ml: 4,
      }}
      href="/leverage"
      underline="none"
    >
      <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>2x-12x</Typography>
    </Link>
  );
}
