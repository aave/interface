import { Box, Tooltip } from '@mui/material';
import { ReactNode } from 'react';
import { onAccent } from 'src/utils/figmaColors';

import { ListColumn, ListColumnProps } from '../../../components/lists/ListColumn';
import { FormattedNumber } from '../../../components/primitives/FormattedNumber';

interface ListValueColumnProps {
  symbol?: string;
  value: string | number;
  subValue?: string | number;
  withTooltip?: boolean;
  capsComponent?: ReactNode;
  disabled?: boolean;
  listColumnProps?: ListColumnProps;
}

const Content = ({
  value,
  withTooltip,
  subValue,
  disabled,
  capsComponent,
}: ListValueColumnProps) => {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormattedNumber
          value={value}
          variant="h5"
          sx={{ mb: !withTooltip && !!subValue ? '2px' : 0 }}
          color={disabled ? 'fg-4' : 'text.main'}
          data-cy={`nativeAmount`}
        />
        {capsComponent}
      </Box>

      {!withTooltip && !!subValue && !disabled && (
        <FormattedNumber value={subValue} symbol="USD" variant="description" color="fg-2" />
      )}
    </>
  );
};

export const ListValueColumn = ({
  symbol,
  value,
  subValue,
  withTooltip,
  capsComponent,
  disabled,
  listColumnProps = {},
}: ListValueColumnProps) => {
  return (
    <ListColumn {...listColumnProps}>
      {withTooltip ? (
        <Tooltip
          title={
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FormattedNumber
                value={subValue || 0}
                symbol="USD"
                variant="h5"
                sx={{ mb: '2px' }}
                symbolsColor={onAccent}
                compact={false}
              />
              <FormattedNumber
                value={value}
                variant="subheader2"
                symbol={symbol}
                symbolsColor={onAccent}
                compact={false}
              />
            </Box>
          }
          arrow
          placement="top"
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Content
              symbol={symbol}
              value={value}
              subValue={subValue}
              capsComponent={capsComponent}
              disabled={disabled}
              withTooltip={withTooltip}
            />
          </Box>
        </Tooltip>
      ) : (
        <Content
          symbol={symbol}
          value={value}
          subValue={subValue}
          capsComponent={capsComponent}
          disabled={disabled}
          withTooltip={withTooltip}
        />
      )}
    </ListColumn>
  );
};
