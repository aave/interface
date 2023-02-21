import {
  Avatar as MaterialAvatar,
  AvatarProps as MaterialAvatarProps,
  Badge,
  Skeleton,
} from '@mui/material';
import makeBlockie from 'ethereum-blockies-base64';
import { ReactNode, useEffect, useState } from 'react';

export enum AvatarSize {
  XS = 20,
  SM = 22,
  MD = 24,
  LG = 32,
  XL = 40,
}

export interface AvatarProps extends Omit<MaterialAvatarProps, 'src'> {
  image?: string;
  fallbackImage?: string;
  size?: AvatarSize | number;
  loading?: boolean;
  badge?: ReactNode;
  invisibleBadge?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  image,
  fallbackImage = makeBlockie('default'),
  size = AvatarSize.MD,
  sx,
  loading = false,
  invisibleBadge = false,
  badge,
  ...rest
}) => {
  const [useFallbackImage, setUseFallbackImage] = useState(false);

  useEffect(() => {
    setUseFallbackImage(false);
  }, [image]);

  return loading ? (
    <Skeleton variant="circular" width={size} height={size} />
  ) : (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={badge}
      invisible={invisibleBadge || loading}
    >
      <MaterialAvatar
        src={useFallbackImage || !image ? fallbackImage : image}
        sx={{ width: size, height: size, border: '1px solid #FAFBFC1F', ...sx }}
        alt="avatar"
        imgProps={{
          onError: () => setUseFallbackImage(true),
        }}
        {...rest}
      />
    </Badge>
  );
};
