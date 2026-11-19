import { AdjustmentsIcon, XIcon } from '@heroicons/react/outline';
import { Box, ButtonBase, IconButton, SvgIcon, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
import { figSurfaceShadow, figVars } from 'src/utils/figmaColors';

import { TWEAKS_ENABLED } from './tweakParams';

// React Query's devtools button owns the bottom right corner in development.
const RIGHT_OFFSET = process.env.NODE_ENV === 'development' ? 68 : 16;

type TweaksPopoverProps = {
  title: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

/**
 * Floating shell for design-review switches. It sits outside the page flow, bottom right, so the
 * layout under review is never disturbed by its own switcher. Renders nothing outside preview
 * builds: no gate is needed where it is used.
 */
export const TweaksPopover = ({ title, open, onOpenChange, children }: TweaksPopoverProps) => {
  if (!TWEAKS_ENABLED) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        right: RIGHT_OFFSET,
        bottom: 16,
        // Above the page and above modals: the switches stay reachable while a modal is under review.
        zIndex: 1350,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 2,
      }}
    >
      {open && (
        <Box
          role="dialog"
          aria-label="Tweaks"
          sx={{
            width: 344,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100vh - 96px)',
            overflowY: 'auto',
            p: 4,
            borderRadius: '0.75rem',
            bgcolor: figVars['bg-3'],
            boxShadow: `0 12px 32px 0 ${figVars['shadow-strong']}, ${figSurfaceShadow()}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subheader1">{title}</Typography>
            <IconButton
              size="small"
              aria-label="Close tweaks"
              onClick={() => onOpenChange(false)}
              sx={{ mr: -1 }}
            >
              <SvgIcon sx={{ fontSize: '16px' }}>
                <XIcon />
              </SvgIcon>
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 3 }}>{children}</Box>
        </Box>
      )}
      <ButtonBase
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        sx={{
          height: 36,
          px: 3,
          gap: 1.5,
          borderRadius: '2.375rem',
          color: figVars['fg-1'],
          bgcolor: figVars['bg-3'],
          boxShadow: `0 4px 12px 0 ${figVars['shadow-high']}, ${figSurfaceShadow()}`,
        }}
      >
        <SvgIcon sx={{ fontSize: '16px' }}>
          <AdjustmentsIcon />
        </SvgIcon>
        <Typography variant="subheader2">Tweaks</Typography>
      </ButtonBase>
    </Box>
  );
};

type TweaksFieldProps = {
  label: ReactNode;
  /** One line on what the selected option shows. */
  hint?: ReactNode;
  children: ReactNode;
};

/** One labelled decision inside the popover. */
export const TweaksField = ({ label, hint, children }: TweaksFieldProps) => (
  <Box>
    <Typography variant="caption" color="fg-2" component="div" sx={{ mb: 1.5 }}>
      {label}
    </Typography>
    {children}
    {hint && (
      <Typography variant="caption" color="fg-3" component="div" sx={{ mt: 1.5 }}>
        {hint}
      </Typography>
    )}
  </Box>
);

type TweaksToggleProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  ariaLabel: string;
};

/** Full-width segmented control for a field: labels of one or two words. */
export function TweaksToggle<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: TweaksToggleProps<T>) {
  return (
    <StyledTxModalToggleGroup
      exclusive
      value={value}
      aria-label={ariaLabel}
      onChange={(_event, next: T | null) => {
        if (next !== null) onChange(next);
      }}
      sx={{ height: '32px' }}
    >
      {options.map((option) => (
        <StyledTxModalToggleButton key={option.value} value={option.value} sx={{ px: 1 }}>
          <Typography variant="subheader2" noWrap>
            {option.label}
          </Typography>
        </StyledTxModalToggleButton>
      ))}
    </StyledTxModalToggleGroup>
  );
}
