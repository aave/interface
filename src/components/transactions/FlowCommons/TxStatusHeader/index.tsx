import { Box, SvgIconProps, Typography } from '@mui/material';
import { ReactNode } from 'react';
import {
  TxErrorIcon,
  TxExpiredIcon,
  TxPendingIcon,
  TxSuccessIcon,
} from 'src/components/icons/TxStatusIcons';
import { FigmaColorName, figVars, onAccent } from 'src/utils/figmaColors';
import { darkScheme } from 'src/utils/theme';

export type TxStatus = 'success' | 'error' | 'cancelled' | 'pending' | 'expired';

interface StatusStyle {
  color: FigmaColorName;
  darkColor?: FigmaColorName;
  Icon: (props: SvgIconProps) => JSX.Element;
  dataCy: string;
}

const STATUSES: Record<TxStatus, StatusStyle> = {
  success: { color: 'data-green', Icon: TxSuccessIcon, dataCy: 'txSuccess' },
  error: { color: 'data-red', Icon: TxErrorIcon, dataCy: 'txError' },
  cancelled: { color: 'data-red', Icon: TxErrorIcon, dataCy: 'txCancelled' },
  pending: { color: 'favourite-star', Icon: TxPendingIcon, dataCy: 'txPending' },
  expired: { color: 'fg-5', darkColor: 'fg-3', Icon: TxExpiredIcon, dataCy: 'txExpired' },
};

const wash = (color: FigmaColorName) =>
  `linear-gradient(180deg, color-mix(in srgb, ${figVars[color]} 16%, transparent) 0%, color-mix(in srgb, ${figVars['bg-3']} 16%, transparent) 58.28%)`;

interface TxStatusHeaderProps {
  status: TxStatus;
  title: ReactNode;
  description?: ReactNode;
}

export const TxStatusHeader = ({ status, title, description }: TxStatusHeaderProps) => {
  const { color, darkColor, Icon, dataCy } = STATUSES[status];

  return (
    <>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background: wash(color),
          ...(darkColor && darkScheme({ background: wash(darkColor) })),
        }}
      />
      <Box
        data-cy={dataCy}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          py: '2.5rem',
          px: '1.5rem',
        }}
      >
        <Box
          sx={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            bgcolor: figVars[color],
            ...(darkColor && darkScheme({ backgroundColor: figVars[darkColor] })),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ fontSize: '2.357rem', color: onAccent }} />
        </Box>

        <Typography variant="h2" color="fg-1" sx={{ mt: '1.5rem' }}>
          {title}
        </Typography>

        {description && (
          <Typography variant="base" color="fg-3" sx={{ mt: '0.5rem' }}>
            {description}
          </Typography>
        )}
      </Box>
    </>
  );
};
