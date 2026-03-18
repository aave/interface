# Supply + E-Mode Integration

## How E-Mode Works

E-Mode (Efficiency Mode) in Aave V3 allows users to get higher LTV (Loan-to-Value) when their collateral and borrows are correlated assets (e.g. ETH and wstETH).

### Key Concepts

- **E-Mode Category**: A grouping of correlated assets (e.g. "ETH correlated" includes WETH, wstETH, cbETH). Each category defines its own LTV, liquidation threshold, and liquidation bonus — higher than the base reserve values.
- **Category ID 0**: Means "no e-mode" — the user gets default/base LTV values for each asset.
- **One active category per user**: A user can only be in one e-mode category at a time. Switching categories requires that all existing borrows are compatible with the new category.
- **Collateral vs Borrowable**: Within an e-mode category, each asset is flagged as `collateralEnabled` and/or `borrowingEnabled`. An asset can be collateral in one category but not another.

### Data Flow

1. **Reserve-level e-modes** (`poolReserve.eModes`): Array of `FormattedReserveEMode` — tells you which e-mode categories this specific asset belongs to, and whether it's collateral/borrowable in each.
2. **Global e-modes** (`eModes` from `useAppDataContext()`): `Record<number, EmodeCategory>` — full category info including all assets in each category with their collateral/borrowable flags.
3. **User's current e-mode** (`user.userEmodeCategoryId`): The category the user is currently in (0 = none).

## Bitmaps

Each e-mode category has three bitmaps. Each bit represents a reserve (by its on-chain reserve ID). All are **opt-in** — governance explicitly sets each bit.

### `collateralBitmap`
Marks which assets are recognized as collateral in this e-mode category. If an asset's bit is set, it gets the category's boosted liquidation threshold for HF calculation. If not set, the asset falls back to its base reserve liquidation threshold.

### `borrowableBitmap`
Marks which assets can be borrowed while in this e-mode. When a user is in an e-mode, they can **only** borrow assets in this bitmap. Switching e-modes reverts if the user has borrows outside the target category's borrowable bitmap.

### `ltvzeroBitmap`
A subset of `collateralBitmap`. Marks which collateral assets get **0 LTV** (zero borrow power) despite being in the category. The asset still gets the e-mode liquidation threshold (protects HF), but contributes nothing to borrow power. Used by governance for assets that are correlated enough to protect against liquidation but too risky to borrow against at boosted rates. Only checked when the asset is already in `collateralBitmap` — setting it without collateral has no effect.

## LTV Resolution (`getUserReserveLtv`)

The on-chain function that determines an asset's LTV for a user, evaluated in order:

```
1. Is the user in an e-mode (categoryId != 0)?
   AND is the asset in that category's collateralBitmap?

   YES → Is the asset in the ltvzeroBitmap?
         YES → LTV = 0 (zero borrow power)
         NO  → LTV = category's boosted LTV (e.g. 90%)

   NO  → LTV = base reserve LTV (baseLTVasCollateral)
         This could be 0 if governance set it that way.

2. If user is NOT in e-mode (categoryId = 0):
   → LTV = base reserve LTV (always)
```

## Liquidation Threshold Resolution

Similar but simpler — no ltvzero concept:

```
1. User in e-mode AND asset in collateralBitmap?
   YES → liquidation threshold = category's boosted threshold
   NO  → liquidation threshold = base reserve threshold

2. User NOT in e-mode?
   → liquidation threshold = base reserve threshold (always)
```

Key difference from LTV: ltvzero does NOT affect liquidation threshold. A ltvzero asset still gets the boosted liquidation threshold, protecting HF. It just can't generate borrow power.

## Base Reserve Config (outside e-mode)

Set by governance on the reserve itself, not on any e-mode category:
- `baseLTVasCollateral` — LTV when not boosted by e-mode. If 0, asset cannot be collateral outside e-mode.
- `liquidationThreshold` — threshold when not boosted by e-mode. If 0, asset cannot be collateral at all.
- `usageAsCollateralEnabled` — derived from liquidation threshold being non-zero.

## `hasZeroLtvCollateral` Flag

During HF calculation (`calculateUserAccountData`), if any collateral asset has LTV = 0, a flag `hasZeroLtvCollateral` is set. This flag is used in `validateHFAndLtvzero` (called on withdraw/transfer) to enforce: if you have zero-LTV collateral, you must withdraw/transfer that asset first before touching your good collateral. Prevents users from gaming the system.

## Impact on Health Factor

When switching e-modes, the liquidation threshold changes for **ALL** collateral positions, not just the asset being supplied. Some assets may have 0% LTV in the new category. This is why we use `formatUserSummary()` to recalculate the entire user position under the new e-mode, rather than just adjusting the threshold for the newly supplied asset.

## Cases That Revert

### `setUserEMode` reverts when:

1. **Incompatible borrows** — user has a borrow on an asset not in target category's `borrowableBitmap` (or not `borrowingEnabled` on base config if switching to category 0). Error: `InvalidDebtInEmode`.

2. **Collateral with 0 LTV** — user has collateral enabled on an asset where `getUserReserveLtv` returns 0 in the target category. This happens when:
   - Asset is in target's `collateralBitmap` AND `ltvzeroBitmap` → 0
   - Asset is NOT in target's `collateralBitmap` AND base LTV is 0 → 0
   Error: `InvalidCollateralInEmode`.

3. **HF drops below 1.0** — after applying the new e-mode, the recalculated health factor is below `HEALTH_FACTOR_LIQUIDATION_THRESHOLD`. Error: `HealthFactorLowerThanLiquidationThreshold`.

### `setUserEMode` does NOT revert when:

- User has no positions (`userConfig.isEmpty()` → skips all checks)
- Asset is in `collateralBitmap` but NOT in `ltvzeroBitmap` → gets boosted LTV, fine
- Asset is NOT in `collateralBitmap` but has non-zero base LTV → falls back to base, fine
- User has the asset supplied but NOT enabled as collateral → `isEnabledAsCollateral` is false, skipped

### Supply never reverts due to LTV/e-mode:

- Supply always succeeds regardless of LTV or e-mode state
- On first supply, `validateAutomaticUseAsCollateral` decides if collateral is auto-enabled
- If LTV is 0 (base or via ltvzero), collateral is NOT auto-enabled — asset earns yield only
- User cannot manually enable collateral on a 0-LTV asset either (`validateUseAsCollateral` blocks it)

## Caveats for Changing E-Mode

The on-chain `executeSetUserEMode` in `SupplyLogic.sol` runs two validation steps before allowing an e-mode switch:

1. **`validateSetUserEMode`** — checks borrow and collateral compatibility
2. **`validateHealthFactor`** — requires `healthFactor >= HEALTH_FACTOR_LIQUIDATION_THRESHOLD` (1.0)

Both are hard reverts. The transaction fails if either check does not pass.

### Existing borrows block category switches (on-chain revert)

`validateSetUserEMode` iterates all user positions and requires that every borrowed asset is `borrowingEnabled` in the target category's `borrowableBitmap`. If a user has a USDC borrow and tries to switch to "ETH correlated" e-mode (which only allows borrowing ETH-correlated assets), the tx reverts with `InvalidDebtInEmode(asset, categoryId)`. The UI checks this via `isEModeCategoryAvailable()` in `EmodeModalContent.tsx` — the `CollateralOptionsSelector` should also respect this and disable/hide unavailable categories.

### Collateral with 0 LTV in target category blocks the switch (on-chain revert)

`validateSetUserEMode` also checks every asset the user has enabled as collateral. If the asset would have 0 LTV in the target category (i.e. `getUserReserveLtv()` returns 0), the tx reverts with `InvalidCollateralInEmode(asset, categoryId)`. This means you cannot switch to a category where any of your active collateral would become dead weight — you'd have to disable that collateral first.

### Health factor dropping below 1.0 blocks the switch (on-chain revert)

After updating the e-mode category, `validateHealthFactor` recalculates the user's HF with the new liquidation thresholds applied to all positions. If HF < 1.0, the tx reverts with `HealthFactorLowerThanLiquidationThreshold()`. The existing e-mode UI blocks at HF < 1.01 to give a safety margin above the on-chain 1.0 threshold.

### Switching from e-mode 0 to a category

When a user is in no e-mode (category 0) and switches to a category, assets in that category get the boosted LTV. This is generally safe and increases borrow power, but the user becomes restricted to borrowing only assets within the category. The on-chain check still validates that all existing borrows are compatible and all active collateral has non-zero LTV in the new category.

### Switching between two non-zero categories

Assets in the old category but not the new one lose their e-mode LTV boost. The on-chain validation will revert if any borrowed asset is not borrowable in the new category, or if any active collateral would have 0 LTV. The multicall (setUserEMode + supply) is atomic so it can't leave the user in a partial state.

### Disabling e-mode (switching to category 0)

All assets revert to their base LTV/liquidation threshold. When switching to category 0, the borrow check validates that each borrowed asset has `borrowingEnabled` on its base reserve config (not the e-mode bitmap). The HF check ensures the position stays above 1.0 at base thresholds. Assets with 0 base LTV that were only collateral-eligible via e-mode will cause the switch to revert if the user still has them enabled as collateral.

### Supply as first position (no existing borrows)

The simplest case — if `userConfig.isEmpty()`, `validateSetUserEMode` returns immediately with no checks. Any e-mode switch is safe. HF is infinite (-1) regardless of category. The e-mode choice only matters for future borrows.

### Isolation mode interaction

If the user is in isolation mode (supplying an isolated asset as sole collateral), e-mode settings are mostly irrelevant because isolation mode overrides the LTV/threshold calculation. The `CollateralOptionsSelector` should not appear for isolated assets since their collateral behavior is governed by isolation mode, not e-mode.

## Collateral Options in Supply Modal

The `CollateralOptionsSelector` component shows users their collateralization choices when supplying:
- Each e-mode category where the asset can be collateral, with its LTV % and borrowable assets
- The user's current e-mode always appears and is never blocked (no switch needed)
- A "Default" option (category 0) with the base reserve LTV (even if 0)
- Blocked options show a tooltip explaining why (incompatible borrows, 0 LTV collateral)

When a user selects a different e-mode tier, the supply transaction bundles `setUserEMode` + `supply` into a single atomic multicall on the Pool contract.

## On-Chain Transaction Bundling

The Aave V3 Pool contract supports `multicall(bytes[])`. When the user selects an e-mode different from their current one, `SupplyActions` encodes both `setUserEMode(categoryId)` and `supply(asset, amount, onBehalfOf, referralCode)` as calldata and sends them as a single multicall transaction. This ensures atomicity — either both succeed or both revert.
