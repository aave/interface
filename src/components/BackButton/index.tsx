import { Trans } from '@lingui/macro';
import { ButtonBase, SvgIcon, Typography } from '@mui/material';
import { useRouter } from 'next/router';

interface BackButtonProps {
  /**
   * Where to go when there is nothing to pop — a deep link, a fresh tab, or the first entry in
   * the session's history (https://github.com/vercel/next.js/discussions/34980).
   */
  fallbackHref: string;
}

/** The "← Back" affordance above a detail page's title. Owns the gap down to that title. */
export const BackButton = ({ fallbackHref }: BackButtonProps) => {
  const router = useRouter();

  return (
    <ButtonBase
      onClick={() => {
        if (history.state?.idx) router.back();
        else router.push(fallbackHref);
      }}
      sx={{ gap: '0.25rem', mb: '1rem', color: 'fg-3', '&:hover': { color: 'fg-1' } }}
    >
      <SvgIcon sx={{ fontSize: '1rem' }} viewBox="0 0 16 16">
        <path
          d="M12.8 8.03271L3.20005 8.03271M7.24215 4.03271L3.20005 8.03271L7.24215 12.0327"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </SvgIcon>
      <Typography
        variant="description"
        sx={{ color: 'inherit', lineHeight: '0.875rem', letterSpacing: 0 }}
      >
        <Trans>Back</Trans>
      </Typography>
    </ButtonBase>
  );
};
