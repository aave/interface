import {
  Avatar as MaterialAvatar,
  AvatarProps as MaterialAvatarProps,
  Skeleton,
} from '@mui/material';
import makeBlockie from 'ethereum-blockies-base64';
import { useEffect, useState } from 'react';

export enum AvatarSize {
  XS = 20,
  SM = 22,
  MD = 24,
  LG = 40,
}

export interface AvatarProps extends Omit<MaterialAvatarProps, 'src'> {
  image?: string;
  fallbackImage?: string;
  size?: AvatarSize | number;
  loading?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  image,
  fallbackImage = makeBlockie('default'),
  size = AvatarSize.MD,
  sx,
  loading,
  ...rest
}) => {
  const [useFallbackImage, setUseFallbackImage] = useState(false);

  useEffect(() => {
    setUseFallbackImage(false);
  }, [image]);

  return loading ? (
    <Skeleton variant="circular" width={size} height={size} />
  ) : (
    <MaterialAvatar
      src={useFallbackImage || !image ? fallbackImage : image}
      sx={{ width: size, height: size, ...sx }}
      alt="avatar"
      imgProps={{
        onError: () => setUseFallbackImage(true),
      }}
      {...rest}
    />
  );
};
