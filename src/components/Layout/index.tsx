'use client';

import { FC, PropsWithChildren } from 'react';
import Footer from 'src/components/Footer';
import Header from 'src/components/Header';

const Layout: FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
