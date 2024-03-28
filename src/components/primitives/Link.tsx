import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link';
import clsx from 'clsx';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import { CustomMarket } from 'src/ui-config/marketsConfig';

interface NextLinkComposedProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    Omit<NextLinkProps, 'href' | 'as'> {
  to: NextLinkProps['href'];
  linkAs?: NextLinkProps['as'];
  href?: NextLinkProps['href'];
}

export const NextLinkComposed = React.forwardRef<HTMLAnchorElement, NextLinkComposedProps>(
  function NextLinkComposed(props, ref) {
    const { to, linkAs, href, replace, scroll, shallow, prefetch, locale, ...other } = props;

    return (
      <NextLink
        ref={ref}
        href={to}
        prefetch={prefetch}
        as={linkAs}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        locale={locale}
        {...other}
      />
    );
  }
);

export type LinkProps = {
  as?: NextLinkProps['as'];
  href: NextLinkProps['href'];
  linkAs?: NextLinkProps['as']; // Useful when the as prop is shallow by styled().
} & Omit<NextLinkComposedProps, 'to' | 'linkAs' | 'href'> &
  Omit<MuiLinkProps, 'href'>;

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const {
    as: linkAs,
    className: classNameProps,
    href,
    role, // Link don't have roles.
    ...other
  } = props;

  const isExternal =
    typeof href === 'string' && (href.indexOf('http') === 0 || href.indexOf('mailto:') === 0);

  const router = useRouter();
  const pathname = typeof href === 'string' ? href : href.pathname;
  const className = clsx(classNameProps, {
    active: router?.pathname === pathname,
  });
  if (isExternal) {
    return (
      <MuiLink
        className={className}
        href={href}
        ref={ref}
        target="_blank"
        rel="noopener"
        underline="none"
        {...other}
      />
    );
  }

  return (
    <MuiLink
      component={NextLinkComposed}
      linkAs={linkAs}
      className={className}
      ref={ref}
      to={href}
      underline="none"
      {...other}
    />
  );
});

export const ROUTES = {
  dashboard: '/',
  markets: '/markets',
  staking: '/staking',
  governance: '/governance',
  faucet: '/faucet',
  migrationTool: '/v3-migration',
  dynamicRenderedProposal: (proposalId: number) =>
    `/governance/v3/proposal?proposalId=${proposalId}`,
  reserveOverview: (underlyingAsset: string, marketName: CustomMarket) =>
    `/reserve-overview/?underlyingAsset=${underlyingAsset}&marketName=${marketName}`,
  history: '/history',
};
