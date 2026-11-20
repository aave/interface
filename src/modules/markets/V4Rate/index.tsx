import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { figVars } from 'src/utils/figmaColors';

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
      sx={{
        mt: '0.375rem',
        backgroundImage: `radial-gradient(circle, ${figVars['fg-4']} 0.6px, transparent 0.75px)`,
        backgroundSize: '3px 1.5px',
        backgroundRepeat: 'space no-repeat',
        backgroundPosition: 'left bottom',
      }}
    />
  );
