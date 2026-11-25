import { Trans } from '@lingui/react';
import { Box, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import { isValidElement, ReactNode } from 'react';

// Lingui's compiled <Trans> carries only a message id (the text is stripped in production)
const getNodeText = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (!isValidElement(node)) return '';

  const { id, values, children } = node.props as {
    id?: string;
    values?: Record<string, ReactNode>;
    children?: ReactNode;
  };
  if (node.type === Trans && id) {
    return (
      id +
      Object.values(values ?? {})
        .map(getNodeText)
        .join('')
    );
  }
  return getNodeText(children);
};

export const FlowHeader = ({ title, subheading }: { title: ReactNode; subheading: ReactNode }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <Typography
      variant="h2"
      component="h1"
      sx={{
        fontSize: { xs: '1.5rem', xsm: '1.875rem' },
        lineHeight: { xs: 1.2, xsm: '2.125rem' },
        color: 'fg-1',
      }}
    >
      {title}
    </Typography>
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        key={getNodeText(subheading) || 'subheading'}
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 4, transition: { duration: 0.2 } }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Typography
          variant="base"
          component="div"
          sx={{
            minHeight: '1lh',
            lineHeight: 1.35,
            color: 'fg-3',
            '& strong': { color: 'fg-1', fontWeight: 500 },
            '& > span:not(.MuiSkeleton-root)': {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              ml: '0.125rem',
              verticalAlign: 'top',
              whiteSpace: 'nowrap',
            },
          }}
        >
          {subheading}
        </Typography>
      </motion.div>
    </AnimatePresence>
  </Box>
);
