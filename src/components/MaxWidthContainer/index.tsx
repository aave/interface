import { PropsWithChildren } from 'react';

import { Container } from './styles';

export default function MaxWidthContainer(props: PropsWithChildren) {
  const { children } = props;
  return <Container>{children}</Container>;
}
