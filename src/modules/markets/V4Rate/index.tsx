import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { dottedUnderlineSx } from 'src/utils/figmaColors';

interface V4RateProps {
  value?: number;
}

export const V4Rate = ({ value }: V4RateProps) =>
  value === undefined ? null : (
    <FormattedNumber
      value={value}
      percent
      variant="h5"
      color="purple-1"
      sx={{ mt: '0.375rem', ...dottedUnderlineSx }}
    />
  );
