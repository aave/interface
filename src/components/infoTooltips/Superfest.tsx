import { Link, Tooltip } from '@mui/material';
import Image from 'next/image';

export const SuperfestTooltip = () => (
  <Tooltip title={`This position is eligible for Superfest`} arrow placement="top">
    <Link
      href={'https://jumper.exchange/superfest'}
      target="_blank"
      onClick={(e) => e.stopPropagation()}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Image src={'/icons/other/superfest.svg'} height={25} width={25} />
    </Link>
  </Tooltip>
);
