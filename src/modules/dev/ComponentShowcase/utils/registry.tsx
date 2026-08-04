import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

export interface ShowcaseSection {
  slug: string;
  label: string;
  group: string;
  Component: ComponentType;
  /** Opt out of the layout's max-width content container (e.g. full-width page banners). */
  fullBleed?: boolean;
}

// One entry per route (`/dev/components/<slug>`). Each section is lazily loaded so a
// given page only ships its own section's code — keeping every page light.
export const SHOWCASE_SECTIONS: ShowcaseSection[] = [
  {
    slug: 'colors',
    label: 'Colors',
    group: 'Foundations',
    Component: dynamic(() => import('../components/ColorsSection').then((m) => m.ColorsSection)),
  },
  {
    slug: 'typography',
    label: 'Typography',
    group: 'Foundations',
    Component: dynamic(() =>
      import('../components/TypographySection').then((m) => m.TypographySection)
    ),
  },
  {
    slug: 'icons',
    label: 'Icons',
    group: 'Foundations',
    Component: dynamic(() => import('../components/IconsSection').then((m) => m.IconsSection)),
  },
  {
    slug: 'buttons',
    label: 'Buttons',
    group: 'Inputs & actions',
    Component: dynamic(() => import('../components/ButtonsSection').then((m) => m.ButtonsSection)),
  },
  {
    slug: 'form-controls',
    label: 'Form controls',
    group: 'Inputs & actions',
    Component: dynamic(() =>
      import('../components/FormControlsSection').then((m) => m.FormControlsSection)
    ),
  },
  {
    slug: 'toggles-badges',
    label: 'Toggles & badges',
    group: 'Inputs & actions',
    Component: dynamic(() =>
      import('../components/TogglesBadgesSection').then((m) => m.TogglesBadgesSection)
    ),
  },
  {
    slug: 'feedback',
    label: 'Feedback',
    group: 'Feedback & overlays',
    Component: dynamic(() =>
      import('../components/FeedbackSection').then((m) => m.FeedbackSection)
    ),
  },
  {
    slug: 'overlays',
    label: 'Overlays & modal',
    group: 'Feedback & overlays',
    Component: dynamic(() =>
      import('../components/OverlaysSection').then((m) => m.OverlaysSection)
    ),
  },
  {
    slug: 'empty-states',
    label: 'Empty states',
    group: 'Feedback & overlays',
    Component: dynamic(() =>
      import('../components/EmptyStatesSection').then((m) => m.EmptyStatesSection)
    ),
  },
  {
    slug: 'surfaces',
    label: 'Surfaces & cards',
    group: 'Data & surfaces',
    Component: dynamic(() =>
      import('../components/SurfacesSection').then((m) => m.SurfacesSection)
    ),
  },
  {
    slug: 'data-primitives',
    label: 'Data primitives',
    group: 'Data & surfaces',
    Component: dynamic(() =>
      import('../components/DataPrimitivesSection').then((m) => m.DataPrimitivesSection)
    ),
  },
  {
    slug: 'banners',
    label: 'Banners',
    group: 'Data & surfaces',
    fullBleed: true,
    Component: dynamic(() => import('../components/BannersSection').then((m) => m.BannersSection)),
  },
  // TEMPORARY: audit gallery of every in-app <Alert> usage (mock data) for the alert cleanup.
  // Remove this entry and the AlertsAuditSection component once the cleanup lands.
  {
    slug: 'alerts',
    label: 'Alerts (temp audit)',
    group: 'Temporary',
    Component: dynamic(() =>
      import('../components/AlertsAuditSection').then((m) => m.AlertsAuditSection)
    ),
  },
  // TEMPORARY: every visual change expected from the v3 neutral-ramp token update, so each can be
  // signed off. Remove this entry and the ColorRegressionSection folder once the ramp is approved.
  {
    slug: 'color-regressions',
    label: 'Color regressions (temp)',
    group: 'Temporary',
    Component: dynamic(() =>
      import('../components/ColorRegressionSection').then((m) => m.ColorRegressionSection)
    ),
  },
];

// Sections grouped for the sidebar, preserving declaration order.
export const SHOWCASE_GROUPS = SHOWCASE_SECTIONS.reduce<
  { label: string; sections: ShowcaseSection[] }[]
>((groups, section) => {
  const group = groups.find((g) => g.label === section.group);
  if (group) {
    group.sections.push(section);
  } else {
    groups.push({ label: section.group, sections: [section] });
  }
  return groups;
}, []);
