import { Box, Tooltip } from '@mui/material';
import { ReactNode } from 'react';

import { ListColumn } from '../../../components/lists/ListColumn';
import { FormattedNumber } from '../../../components/primitives/FormattedNumber';

interface ListValueColumnProps {
  symbol?: string;
  value: string | number;
  subValue?: string | number;
  withTooltip?: boolean;
  capsComponent?: ReactNode;
  disabled?: boolean;
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
          variant="secondary14"
          sx={{ mb: !withTooltip && !!subValue ? '2px' : 0 }}
          color={disabled ? 'text.disabled' : 'text.main'}
          data-cy={`nativeAmount`}
        />
        {capsComponent}
      </Box>

      {!withTooltip && !!subValue && !disabled && (
        <FormattedNumber
          value={subValue}
          symbol="USD"
          variant="secondary12"
          color="text.secondary"
        />
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
}: ListValueColumnProps) => {
  return (
    <ListColumn>
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
                variant="secondary14"
                sx={{ mb: '2px' }}
                symbolsColor="common.white"
                compact={false}
              />
              <FormattedNumber
                value={value}
                variant="secondary12"
                symbol={symbol}
                symbolsColor="common.white"
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
