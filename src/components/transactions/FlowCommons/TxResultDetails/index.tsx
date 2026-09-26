import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { Row } from 'src/components/primitives/Row';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

export const TxResultDetails = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.0625rem', width: '100%' }}>
    {children}
  </Box>
);

interface TxResultRowProps {
  label: ReactNode;
  tooltip?: ReactNode;
  children: ReactNode;
}

export const TxResultRow = ({ label, tooltip, children }: TxResultRowProps) => (
  <Row
    caption={
      tooltip ? (
        <TextWithTooltip text={label} variant="base" textColor="fg-3">
          <>{tooltip}</>
        </TextWithTooltip>
      ) : (
        label
      )
    }
    captionVariant="base"
    captionColor="fg-3"
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        typography: 'h5',
        color: 'fg-1',
        textAlign: 'right',
      }}
    >
      {children}
    </Box>
  </Row>
);
