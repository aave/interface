import { Box, styled } from '@mui/material';
import { JSXElementConstructor, ReactElement, useState } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

interface MultiIconProps {
  icons: IconData[];
  onHover?: (hovering: boolean) => void;
}

interface MultiIconWithTooltipProps extends MultiIconProps {
  // eslint-disable-next-line
  tooltipContent: ReactElement<any, string | JSXElementConstructor<any>>;
}

export interface IconData {
  src: string;
  aToken: boolean;
  waToken?: boolean;
}

const IconWrapper = styled(Box)<{ expanded: boolean }>(({ theme, expanded }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: expanded ? '2px' : '0',
  transition: theme.transitions.create('width'),
  width: expanded ? 'auto' : 'fit-content',
  maxWidth: '240px',
  overflow: 'hidden',
}));

const IconItem = styled(Box)<{ index: number; expanded: boolean; total: number }>(
  ({ theme, index, expanded, total }) => ({
    position: 'relative',
    marginLeft: expanded ? 0 : index === 0 ? 0 : -15,
    transition: theme.transitions.create(['margin-left', 'z-index']),
    zIndex: total - index,
  })
);

export function MultiIcon({ icons, onHover }: MultiIconProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      display="flex"
      alignItems="center"
      onMouseEnter={() => {
        setExpanded(true);
        onHover?.(true);
      }}
      onMouseLeave={() => {
        setExpanded(false);
        onHover?.(false);
      }}
    >
      <IconWrapper expanded={expanded}>
        {icons.map((icon, index) => (
          <IconItem key={index} index={index} expanded={expanded} total={icons.length}>
            <TokenIcon symbol={icon.src} aToken={icon.aToken} waToken={icon.waToken} />
          </IconItem>
        ))}
      </IconWrapper>
    </Box>
  );
}

export function MultiIconWithTooltip({ icons, tooltipContent }: MultiIconWithTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <ContentWithTooltip open={open} tooltipContent={tooltipContent} withoutHover>
      <MultiIcon icons={icons} onHover={(hovering) => setOpen(hovering)} />
    </ContentWithTooltip>
  );
}
