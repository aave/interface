import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';
import { MarketAssetsListContainer } from 'src/modules/markets/MarketAssetsListContainer';
import { MarketsTopPanel } from 'src/modules/markets/MarketsTopPanel';
import { useRootStore } from 'src/store/root';

// Markets-specific Container overrides, shared with MarketsTopPanel (`containerProps=`) so the
// top-panel stats align with the asset table at Markets' wider max-width. The theme's MuiContainer
// override already supplies display/flexDirection/flex + the 39px bottom padding, so only the wider
// px/maxWidth are set here.
//
// The ladder is monotonic — content never narrows as the viewport widens. `xl` keeps its 96px
// gutter, so its cap is the 1440px content ceiling plus that gutter (1440 + 2×96 = 1632); it grows
// 1383px → 1440px across 1575–1632 and then holds, meeting `xxl`'s 1440px exactly. Leaving `xl`
// uncapped instead let content reach 1607px at 1799px, which then *dropped* to 1440px at 1800px.
export const marketContainerProps = {
  sx: {
    px: {
      xs: 2,
      xsm: 5,
      sm: 12,
      md: 5,
      lg: 0,
      xl: '96px',
      xxl: 0,
    },
    maxWidth: {
      xs: 'unset',
      lg: '1240px',
      xl: '1632px',
      xxl: '1440px',
    },
  },
};

export default function Markets() {
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Markets',
    });
  }, [trackEvent]);

  return (
    <>
      <MarketsTopPanel />
      <ContentContainer containerProps={marketContainerProps}>
        <MarketAssetsListContainer />
      </ContentContainer>
    </>
  );
}

Markets.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
