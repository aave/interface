import { Icon, IconProps } from '@mui/material';

interface TokenIconProps extends IconProps {
  tokenSymbol: string;
}

/**
 * Renders a tokenIcon specified by symbol.
 * @param param0
 * @returns
 */
export function TokenIcon({ tokenSymbol, ...rest }: TokenIconProps) {
  return (
    <Icon {...rest} sx={{ display: 'flex' }}>
      <img src={`/icons/tokens/${tokenSymbol.toLowerCase()}.svg`} width="100%" height="100%" />
    </Icon>
  );
}
