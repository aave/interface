import { ExternalLinkIcon, InformationCircleIcon } from '@heroicons/react/outline';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Radio,
  Select,
  SvgIcon,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
import { ReserveHeaderIconButton } from 'src/modules/reserve-overview/ReserveHeaderIconButton';
import { figVars } from 'src/utils/figmaColors';

import { formatColor, HEX_TEXT } from '../../utils/tokenHex';
import { Section } from '../Section';
import { RegressionCase } from './components/RegressionCase';
import { SwatchLadder } from './components/SwatchLadder';
import { TokenDiff } from './components/TokenDiff';
import { BG_DELTAS, FG_DELTAS, RETIRED_TOKENS } from './utils/previousTokens';

const RAMPS = [
  { title: 'Background ramp', deltas: BG_DELTAS, role: 'bg' },
  { title: 'Foreground ramp', deltas: FG_DELTAS, role: 'fg' },
] as const;

// Showcase-only: keep Select menus inline so they inherit the showcase's LOCAL color scheme instead
// of portalling to <body> and following the app's global one.
const SELECT_MENU_PROPS = { disablePortal: true } as const;

// Shared so the button specimens don't each restate the SvgIcon wrapper.
const INFO_ICON = (
  <SvgIcon>
    <InformationCircleIcon />
  </SvgIcon>
);

// The reserve icon-circle children are sized by the circle, not the icon's own default.
const CIRCLE_ICON_SX = { fontSize: '0.875rem' } as const;

const GroupHeading = ({ title, blurb }: { title: string; blurb: string }) => (
  <Box sx={{ flex: '1 1 100%', mt: 4 }}>
    <Typography variant="h3">{title}</Typography>
    <Typography variant="description" color="fg-2" sx={{ display: 'block', mt: 1, maxWidth: 760 }}>
      {blurb}
    </Typography>
  </Box>
);

// One level below GroupHeading, for the blocks inside a group.
const SubHeading = ({ title, blurb }: { title: string; blurb?: string }) => (
  <>
    <Typography variant="subheader1" sx={{ mb: blurb ? 1 : 4, display: 'block' }}>
      {title}
    </Typography>
    {blurb && (
      <Typography
        variant="description"
        color="fg-2"
        sx={{ display: 'block', mb: 4, maxWidth: 760 }}
      >
        {blurb}
      </Typography>
    )}
  </>
);

/**
 * TEMPORARY audit page for the v3 neutral-ramp token update (`/dev/components/color-regressions`).
 *
 * The update moved values across the `bg-*`/`fg-*` ramps and deleted the `bgp-*`/`fgp-*` family. Only
 * the token *values* moved — no consumer was repointed — so anywhere a token's role shifted, the
 * consumer now renders differently. This page collects every such spot found by auditing the
 * consumers, so each can be signed off or sent back rather than discovered in the app later.
 *
 * Use the sidebar's Light/Dark toggle: most cases are light-only, a few are dark-only, and each is
 * tagged. Delete this section, its folder, and the registry entry once the ramp is signed off.
 */
export const ColorRegressionSection = () => (
  <Section
    title="Color regressions (temp audit)"
    description="Every visual change the v3 neutral-ramp token update is expected to cause. Values moved; consumers did not. Each case names the token movement that caused it and what to look at — flip the Light/Dark toggle to match each case's tag."
  >
    {/* ---------------------------------------------------------------- value diff ------------- */}
    <GroupHeading
      title="1 · What the values actually did"
      blurb="Before/after for every bg and fg token, butted together with no seam — an unchanged token shows as one solid block, a changed one shows an edge down the middle. Both modes' hexes are printed so they can be checked against the spec directly."
    />

    {RAMPS.map(({ title, deltas, role }) => (
      <Box key={role} sx={{ flex: '1 1 100%' }}>
        <SubHeading title={title} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {deltas.map((delta) => (
            <TokenDiff key={delta.name} delta={delta} role={role} />
          ))}
        </Box>
      </Box>
    ))}

    <Box sx={{ flex: '1 1 100%' }}>
      <SubHeading
        title="Deleted `p`-suffix tokens"
        blurb="Each was repointed to the same-index token. Every one of them had a dark value identical to its replacement's new dark value, so dark mode should be pixel-identical — only the light column can move."
      />
      <Table>
        <TableHead>
          <TableRow>
            {['Deleted', 'Its old light / dark', 'Now reads', 'Consumers repointed'].map((h) => (
              <TableCell key={h}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {RETIRED_TOKENS.map((t) => (
            <TableRow key={t.name}>
              <TableCell>
                <Typography variant="main12">{t.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="helperText" color="fg-3" sx={HEX_TEXT}>
                  {formatColor(t.prevLight)} / {formatColor(t.prevDark)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="main12" color="fg-2">
                  {t.replacedBy}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="helperText" color="fg-2">
                  {t.consumers}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>

    {/* ------------------------------------------------------- bg-max white surfaces ----------- */}
    <GroupHeading
      title="2 · Repointed off bg-max — verify these are white again"
      blurb="bg-max went #ffffff → #f0f0f0 in light, which greyed out every control that had used it as the white surface. All five are now repointed: outlined buttons and Select triggers to bg-4 (stepping to bone on hover), and the checkbox/radio, text-input and reserve icon-circle surfaces to bg-3. Both tokens are #ffffff in light, so these should read white again."
    />

    <RegressionCase
      title="Outlined / secondary “white pill” button"
      cause="secondaryPillStyle — base bg-max → bg-4, hover bg-1 → bone"
      check="Base should be white (#ffffff) and hover should settle to bone (#f6f7f4) — darker, not brighter. bg-4 is #1e1e20 in dark, exactly what the pill already used, so dark is unchanged; bone is mode-agnostic off-white so dark still steps to bg-5 instead."
      mode="light"
    >
      <Button variant="outlined" color="primary">
        Secondary pill
      </Button>
      <Button variant="outlined" color="primary" startIcon={INFO_ICON}>
        With icon
      </Button>
      <Button variant="outlined" color="primary" disabled>
        Disabled
      </Button>
      <SwatchLadder
        steps={[
          { token: 'bg-4', label: 'base' },
          { token: 'bone', label: 'hover' },
          { token: 'bg-5', label: 'hover (dark)' },
        ]}
      />
    </RegressionCase>

    <RegressionCase
      title="Text input surface"
      cause="MuiOutlinedInput (non-Select) — backgroundColor bg-max → bg-3"
      check="Text fields, amount inputs and search boxes should be white again. Note this also moves dark: bg-3 is #18181b where bg-max was #0a0a0b, so dark inputs now match the page fill rather than sitting darker than it — worth a look in dark too."
      mode="both"
    >
      <TextField placeholder="Placeholder" size="small" />
      <TextField defaultValue="0.00" size="small" />
      <TextField placeholder="Disabled" size="small" disabled />
    </RegressionCase>

    <RegressionCase
      title="Unchecked checkbox + radio"
      cause="selectionControlResting — backgroundColor bg-max → bg-3; the dark override is now redundant and was dropped"
      check="Unchecked boxes and circles should be white again. bg-3 is #18181b in dark — exactly the value the dark override was forcing — so dark is unchanged and one token now covers both modes. Hover one: the hairline darkens to fg-4, which also moved (#bcbbbb → #a8a8a8)."
      mode="light"
    >
      <FormControlLabel control={<Checkbox />} label="Unchecked" />
      <FormControlLabel control={<Checkbox defaultChecked />} label="Checked" />
      <FormControlLabel control={<Radio />} label="Unselected" />
      <FormControlLabel control={<Radio defaultChecked />} label="Selected" />
      <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
    </RegressionCase>

    <RegressionCase
      title="Active toggle pill (transaction-modal tabs)"
      cause="StyledToggleButton activeFill — backgroundColor bg-max → bg-3"
      check="The selected tab's pill should pop white out of the bg-5 track again. Hover the active tab: it steps to bg-1 (#fafafa), one shade darker than the white base. Dark keeps its own bg-5 fill / bg-6 hover, so it is unchanged."
      mode="light"
    >
      <Box sx={{ width: 280 }}>
        <StyledTxModalToggleGroup color="primary" value="market" exclusive>
          <StyledTxModalToggleButton value="market" disabled>
            <Typography variant="h5">Market</Typography>
          </StyledTxModalToggleButton>
          <StyledTxModalToggleButton value="limit">
            <Typography variant="h5">Limit</Typography>
          </StyledTxModalToggleButton>
        </StyledTxModalToggleGroup>
      </Box>
      <SwatchLadder
        steps={[
          { token: 'bg-5', label: 'track (light)' },
          { token: 'bg-2', label: 'track (dark)' },
          { token: 'bg-3', label: 'active pill' },
          { token: 'bg-1', label: 'active hover' },
        ]}
      />
    </RegressionCase>

    <RegressionCase
      title="Reserve-header icon circles"
      cause="ReserveHeaderIconButton — bgcolor bg-max → bg-3; hover repointed bgp-5 → bg-5"
      check="Not visible in the showcase — this one lives on the reserve-overview page header. Fill should be white again. Its hover moved separately: bgp-5 was bone #f6f7f4 and bg-5 is #f2f2f2, so hover is a neutral grey now rather than a warm off-white. Dark also moves here (#0a0a0b → #18181b), which is the one dark change in this group."
      mode="both"
    >
      <ReserveHeaderIconButton tooltipText="Token contracts">
        <SvgIcon sx={CIRCLE_ICON_SX}>
          <InformationCircleIcon />
        </SvgIcon>
      </ReserveHeaderIconButton>
      <ReserveHeaderIconButton tooltipText="Oracle price">
        <SvgIcon sx={CIRCLE_ICON_SX}>
          <ExternalLinkIcon />
        </SvgIcon>
      </ReserveHeaderIconButton>
      <SwatchLadder
        steps={[
          { token: 'bg-3', label: 'base' },
          { token: 'bg-5', label: 'hover' },
        ]}
      />
    </RegressionCase>

    <RegressionCase
      title="Elevation inversion — bg-max is now darker than the page"
      cause="body fill is bg-2 (#fcfcfc light); bg-max is now #f0f0f0"
      check="The root cause behind the five cases above, kept here because bg-max now has NO consumer left. It used to be lighter than the page and read as raised; it is now darker than the page, so it reads as recessed. Decide whether bg-max is meant to be the page floor — if so this is correct and simply unused."
      mode="light"
    >
      <Box
        sx={{
          p: 8,
          borderRadius: '12px',
          backgroundColor: 'bg-2',
          boxShadow: `inset 0 0 0 1px ${figVars['border-1']}`,
        }}
      >
        <Typography variant="helperText" color="fg-3" sx={{ display: 'block', mb: 3 }}>
          bg-2 — the page/body fill
        </Typography>
        <Box
          sx={{
            p: 6,
            borderRadius: '10px',
            backgroundColor: 'bg-max',
            boxShadow: `0px 2px 4px 0px ${figVars['shadow-low']}, 0px 0px 0px 1px ${figVars['shadow-stroke-2']}`,
          }}
        >
          <Typography variant="subheader1">bg-max surface</Typography>
          <Typography variant="description" color="fg-2" sx={{ display: 'block' }}>
            Raised, or sunken?
          </Typography>
        </Box>
      </Box>
    </RegressionCase>

    {/* ------------------------------------------------------------- hover inversions ---------- */}
    <GroupHeading
      title="3 · Hover ladders — confirm they step darker again"
      blurb="Three interaction ladders are built as “step the fill one shade darker on hover”. The new values had inverted all three in light mode; the repoints above should restore the direction. Read each strip left to right — the hexes are printed under every patch, so the direction is checkable without hovering."
    />

    <RegressionCase
      title="Select / dropdown trigger"
      cause="MuiOutlinedInput Select block — base bg-1 → bg-4, hover bg-4 → bone, matching the pill token for token"
      check="The Select trigger was NOT covered by the outlined-button fix — it is a separate `:has(.MuiSelect-select)` block that used bg-1, so it needed the same repoint. It now matches the pill exactly: white base, bone hover. bone (#f6f7f4) is also the value bg-4 held before this update, so the hover colour is unchanged from what you had. Dark is untouched (#1e1e20 → #28282a)."
      mode="light"
    >
      <Select
        defaultValue="ethereum"
        size="small"
        MenuProps={SELECT_MENU_PROPS}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="ethereum">Ethereum</MenuItem>
        <MenuItem value="base">Base</MenuItem>
        <MenuItem value="arbitrum">Arbitrum</MenuItem>
      </Select>
      <SwatchLadder
        steps={[
          { token: 'bg-4', label: 'base' },
          { token: 'bone', label: 'hover / open' },
          { token: 'bg-5', label: 'hover (dark)' },
        ]}
      />
    </RegressionCase>

    <RegressionCase
      title="bg-3 and bg-4 are now the same colour"
      cause="bg-3 #fcfbfb → #ffffff and bg-4 #f6f7f4 → #ffffff (light); #18181b vs #1e1e20 in dark"
      check="Seamless strip — in light there should be no visible seam between bg-3 and bg-4 at all (both #ffffff), while bg-2 beside them is a hair darker. In dark they do differ. Neither token has an app consumer today, so this is a ramp-design question rather than a broken screen."
      mode="both"
    >
      <SwatchLadder
        seamless
        steps={[
          { token: 'bg-2', label: 'bg-2' },
          { token: 'bg-3', label: 'bg-3' },
          { token: 'bg-4', label: 'bg-4' },
        ]}
      />
    </RegressionCase>

    {/* ------------------------------------------------------------------ ink changes ---------- */}
    <GroupHeading
      title="4 · Ink"
      blurb="fg-1 went pure black in light and fg-3 got noticeably brighter in dark. fg-1 is text.primary and primary.main; fg-3 is text.muted and action.active, so these reach ~290 call sites between them."
    />

    <RegressionCase
      title="Primary text is now pure black — and identical to fg-max"
      cause="fg-1 light #201d1d → #000000; fg-max light is already #000000"
      check="All body copy and headings lose the slight warmth of #201d1d. The two lines below are fg-max and fg-1 — they should now be indistinguishable in both modes (both #000 in light, both #ffffff in dark), which means the top of the ink ramp has collapsed to a single value."
      mode="light"
    >
      <Box>
        <Typography variant="h2" sx={{ color: 'fg-max' }}>
          fg-max — the quick brown fox
        </Typography>
        <Typography variant="h2" sx={{ color: 'fg-1' }}>
          fg-1 — the quick brown fox
        </Typography>
        <Typography variant="description" sx={{ color: 'fg-1', display: 'block', mt: 3 }}>
          Body copy at fg-1. Supplying liquidity earns interest paid by borrowers, and the aToken
          balance grows in place — check whether this reads harsher than before at paragraph length.
        </Typography>
      </Box>
    </RegressionCase>

    <RegressionCase
      title="Muted text and icons are brighter in dark"
      cause="fg-3 dark #727274 → #8f8e8e (this is the old fgp-3 value)"
      check="fg-3 is text.muted and action.active, so secondary labels, placeholder text, sortable-column chevrons and button start-icons all lift. Check the contrast against fg-2 (#bcbbbb) directly above it — the gap between the two muted steps is now much smaller."
      mode="dark"
    >
      <Box sx={{ minWidth: 300 }}>
        <Typography variant="secondary16" sx={{ color: 'fg-1', display: 'block' }}>
          fg-1 — Supply balance
        </Typography>
        <Typography variant="secondary16" sx={{ color: 'fg-2', display: 'block' }}>
          fg-2 — $12,480.22
        </Typography>
        <Typography variant="secondary16" sx={{ color: 'fg-3', display: 'block' }}>
          fg-3 — Net APY 3.41%
        </Typography>
        <Typography variant="secondary16" sx={{ color: 'fg-4', display: 'block' }}>
          fg-4 — unavailable
        </Typography>
      </Box>
      <Button variant="outlined" startIcon={INFO_ICON}>
        fg-3 start icon
      </Button>
    </RegressionCase>

    <RegressionCase
      title="Disabled text darkened"
      cause="fg-4 light #bcbbbb → #a8a8a8 (text.disabled + the checkbox hover hairline)"
      check="Disabled labels and values get noticeably darker in light mode, so they read less “off”. Check they're still clearly distinguishable from fg-3 (#858585) enabled-but-muted text."
      mode="light"
    >
      <Box sx={{ minWidth: 260 }}>
        <Typography variant="secondary16" sx={{ color: 'fg-3', display: 'block' }}>
          fg-3 — muted but enabled
        </Typography>
        <Typography variant="secondary16" sx={{ color: 'fg-4', display: 'block' }}>
          fg-4 — text.disabled
        </Typography>
      </Box>
      <Button variant="contained" disabled>
        Disabled action
      </Button>
      <TextField placeholder="Disabled field" size="small" disabled />
    </RegressionCase>

    <RegressionCase
      title="fg-5 in dark is now pure white"
      cause="fg-5 dark #383838 → #ffffff (light #cfcece → #b3b3b3)"
      check="Confirmed intentional, and fg-5 has no app consumer today — it only appears on the swatch page. Flagging because it inverts the ramp: fg-4 is #636161 (dim) and fg-5 jumps past every other step to maximum brightness, so the ramp is no longer monotonic in dark."
      mode="both"
    >
      <Box>
        {(['fg-1', 'fg-2', 'fg-3', 'fg-4', 'fg-5'] as const).map((token) => (
          <Typography key={token} variant="secondary16" sx={{ color: token, display: 'block' }}>
            {token} — the quick brown fox
          </Typography>
        ))}
      </Box>
    </RegressionCase>

    {/* ----------------------------------------------------------- dark surface shifts --------- */}
    <GroupHeading
      title="5 · Dark surface ramp"
      blurb="The top of the dark ramp moved most: bg-6 #393737 → #36363a and bg-7 #3f3e3e → #45454a, both a touch lighter and cooler. bg-3 also collapsed onto bg-2."
    />

    <RegressionCase
      title="Switch track and tertiary buttons"
      cause="bg-7 dark #3f3e3e → #45454a (switch track, tertiary hover); bg-6 dark #393737 → #36363a"
      check="The switch's off-track and the tertiary button's hover both lift slightly and shed their warm cast. Hover the tertiary buttons to see the bg-5 → bg-6 step in dark, and bg-6 → bg-7 in light."
      mode="dark"
    >
      <Switch />
      <Switch defaultChecked />
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="tertiary" startIcon={INFO_ICON}>
        Claim
      </Button>
      <SwatchLadder
        steps={[
          { token: 'bg-5', label: 'base (dark)' },
          { token: 'bg-6', label: 'base (light) / hover (dark)' },
          { token: 'bg-7', label: 'hover (light)' },
        ]}
      />
    </RegressionCase>

    <RegressionCase
      title="bg-2 and bg-3 are now the same colour in dark"
      cause="bg-3 dark #1f1e1e → #18181b, which is exactly bg-2 dark"
      check="Seamless strip — in dark there should be no seam between bg-2 and bg-3. Since bg-2 is the body fill, any surface that were to use bg-3 would now disappear into the page in dark while being pure white in light."
      mode="dark"
    >
      <SwatchLadder
        seamless
        steps={[
          { token: 'bg-max', label: 'bg-max' },
          { token: 'bg-1', label: 'bg-1' },
          { token: 'bg-2', label: 'bg-2' },
          { token: 'bg-3', label: 'bg-3' },
          { token: 'bg-4', label: 'bg-4' },
          { token: 'bg-5', label: 'bg-5' },
          { token: 'bg-6', label: 'bg-6' },
          { token: 'bg-7', label: 'bg-7' },
        ]}
      />
    </RegressionCase>

    {/* --------------------------------------------------------------- p-token repoints -------- */}
    <GroupHeading
      title="6 · The p-token repoints"
      blurb="These should be invisible in dark by construction — each retired token's dark value is exactly its replacement's new dark value. Only light mode can move, and only in three places."
    />

    <RegressionCase
      title="Alert gradient + checkbox dark fill (bgp-2 → bg-2)"
      cause="theme.tsx:113 alert dark gradient and theme.tsx:136 checkbox dark fill"
      check="Expected to be pixel-identical in both modes — bgp-2 and bg-2 held the same value in light (#fcfcfc) and in dark (#18181b). If anything shifted here, the repoint is wrong."
      mode="both"
    >
      <Box sx={{ flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Alert severity="info">Alert surface fades to bg-2 on the right.</Alert>
        <Alert severity="warning" data-size="small">
          Small variant, same gradient base.
        </Alert>
      </Box>
      <FormControlLabel control={<Checkbox />} label="Unchecked fill = bg-2 in dark" />
    </RegressionCase>

    <RegressionCase
      title="Notification bar surface (bgp-1 → bg-1)"
      cause="TopBarNotify.tsx:191 — light #f7f7f7 → #fafafa"
      check="The top notification strip's fill lightens very slightly in light mode; dark is unchanged (#0f0f10 both before and after). Below is the same fill on the page background."
      mode="light"
    >
      <Box
        sx={{
          flex: '1 1 100%',
          px: 6,
          py: 3,
          borderRadius: '8px',
          backgroundColor: 'bg-1',
          boxShadow: `inset 0 0 0 1px ${figVars['border-1']}`,
        }}
      >
        <Typography variant="description">
          bg-1 surface — previously bgp-1 (#f7f7f7), now #fafafa in light
        </Typography>
      </Box>
    </RegressionCase>

    <RegressionCase
      title="Link icons (fgp-3 → fg-3)"
      cause="TopInfoPanelItem, Bridge modal and GovernanceTopPanel link icons — light #8b8b8d → #858585"
      check="Three trailing “open in new tab” icons get very slightly darker and lose their faint blue cast in light. Dark is unchanged — fg-3's new dark value (#8f8e8e) is exactly what fgp-3 was."
      mode="light"
    >
      <Button
        variant="text"
        endIcon={
          <SvgIcon sx={{ color: 'fg-3' }}>
            <ExternalLinkIcon />
          </SvgIcon>
        }
      >
        Governance forum
      </Button>
      <Typography variant="description" sx={{ color: 'fg-3' }}>
        fg-3 ink at description size
      </Typography>
    </RegressionCase>

    {/* ------------------------------------------------------------- table headers ------------- */}
    <GroupHeading
      title="7 · Table headers standardised on fg-3"
      blurb="Column labels are now fg-3 everywhere. No showcase section rendered a table header before, so both header flavours are reproduced here. The MUI-table flavour is the one that actually moved: it inherited MUI's default head colour of text.primary (fg-1), which light mode just took to pure #000000 — so those labels were the darkest ink on the page."
    />

    <RegressionCase
      title="MUI TableHead — was fg-1 (pure black in light), now fg-3"
      cause="theme.tsx MuiTableCell.head — added color: fg-3, overriding MUI's text.primary default"
      check="Covers the e-mode asset tables (e-mode modal + collateral options) and every markdown table in a governance proposal body. Check the labels read as muted column headers rather than as body text, and that they sit correctly against the bg-2 fill the e-mode table gives its header cells."
      mode="both"
    >
      <Table sx={{ maxWidth: 520 }}>
        <TableHead>
          <TableRow>
            {['Asset', 'Boosted LTV', 'Liquidation threshold'].map((label) => (
              <TableCell
                key={label}
                align="center"
                sx={{ backgroundColor: 'bg-2', textTransform: 'uppercase' }}
              >
                <Typography variant="helperText">{label}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell align="center">
              <Typography variant="secondary16">USDC</Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="secondary16">90.00%</Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="secondary16">93.00%</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </RegressionCase>

    <RegressionCase
      title="List headers — was fg-2, now fg-3"
      cause="ListHeaderTitle.tsx:43 fg-2 → fg-3, plus 7 hand-rolled header cells in the voters lists and migration mobile list"
      check="The real ListHeaderWrapper + ListHeaderTitle, not a copy — so this case actually tracks the primitive it signs off. A one-step lightening; check the labels are still legible at subheader2 size, especially in dark where fg-3 also moved (#727274 → #8f8e8e, so this one got brighter). The sortable columns render their real chevron, which still uses the separate fg-icon token (#A8A8A8) and is therefore now LIGHTER than the label beside it in light mode."
      mode="both"
    >
      <Box sx={{ width: '100%', maxWidth: 560 }}>
        <ListHeaderWrapper>
          {[
            { label: 'Asset', sortKey: 'symbol' },
            { label: 'APY', sortKey: 'apy' },
            { label: 'Balance', sortKey: undefined },
          ].map(({ label, sortKey }) => (
            <ListColumn key={label} isRow={!sortKey}>
              <ListHeaderTitle sortKey={sortKey} source="color-regression-audit">
                {label}
              </ListHeaderTitle>
            </ListColumn>
          ))}
        </ListHeaderWrapper>
      </Box>
    </RegressionCase>
  </Section>
);
