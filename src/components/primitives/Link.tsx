import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import { CustomMarket } from 'src/ui-config/marketsConfig';

// Add support for the sx prop for consistency with the other branches.
const Anchor = styled('a')({});

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
        href={to}
        prefetch={prefetch}
        as={linkAs}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        passHref
        locale={locale}
      >
        <Anchor ref={ref} {...other} />
      </NextLink>
    );
  }
);

export type LinkProps = {
  as?: NextLinkProps['as'];
  href: NextLinkProps['href'];
  linkAs?: NextLinkProps['as']; // Useful when the as prop is shallow by styled().
  noLinkStyle?: boolean;
} & Omit<NextLinkComposedProps, 'to' | 'linkAs' | 'href'> &
  Omit<MuiLinkProps, 'href'>;

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const {
    as: linkAs,
    className: classNameProps,
    href,
    noLinkStyle,
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
    if (noLinkStyle) {
      return (
        <Anchor
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

  if (noLinkStyle) {
    return (
      <NextLinkComposed className={className} ref={ref} to={href} underline="none" {...other} />
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
  dashboard: '/dashboard',
  markets: '/',
  staking: '/staking',
  governance: '/governance',
  faucet: '/faucet',
  airdrop: '/airdrop',
  migrationTool: '/v3-migration',
  managePaw: '/managePaw',
  tge: '/tge',
  leverage: '/leverage',
  prerenderedProposal: (proposalId: number) => `/governance/proposal/${proposalId}`,
  dynamicRenderedProposal: (proposalId: number) => `/governance/proposal?proposalId=${proposalId}`,
  reserveOverview: (underlyingAsset: string, marketName: CustomMarket) =>
    `/reserve-overview/?underlyingAsset=${underlyingAsset}&marketName=${marketName}`,
};
