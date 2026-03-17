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

### Impact on Health Factor

When switching e-modes, the liquidation threshold changes for **ALL** collateral positions, not just the asset being supplied. Some assets may have 0% LTV in the new category. This is why we use `formatUserSummary()` to recalculate the entire user position under the new e-mode, rather than just adjusting the threshold for the newly supplied asset.

### Collateral Options in Supply Modal

The `CollateralOptionsSelector` component shows users their collateralization choices when supplying:
- Each e-mode category where the asset can be collateral, with its LTV % and borrowable assets
- A "Default" option (category 0) with the base reserve LTV
- E-mode names are abstracted — users see LTV percentages and borrowable asset lists

When a user selects a different e-mode tier, the supply transaction bundles `setUserEMode` + `supply` into a single atomic multicall on the Pool contract.

### On-Chain Transaction Bundling

The Aave V3 Pool contract supports `multicall(bytes[])`. When the user selects an e-mode different from their current one, `SupplyActions` encodes both `setUserEMode(categoryId)` and `supply(asset, amount, onBehalfOf, referralCode)` as calldata and sends them as a single multicall transaction. This ensures atomicity — either both succeed or both revert.

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

All assets revert to their base LTV/liquidation threshold. When switching to category 0, the borrow check validates that each borrowed asset has `borrowingEnabled` on its base reserve config (not the e-mode bitmap). The HF check ensures the position stays above 1.0 at base thresholds.

### Supply as first position (no existing borrows)

The simplest case — if `userConfig.isEmpty()`, `validateSetUserEMode` returns immediately with no checks. Any e-mode switch is safe. HF is infinite (-1) regardless of category. The e-mode choice only matters for future borrows.

### Isolation mode interaction

If the user is in isolation mode (supplying an isolated asset as sole collateral), e-mode settings are mostly irrelevant because isolation mode overrides the LTV/threshold calculation. The `CollateralOptionsSelector` should not appear for isolated assets since their collateral behavior is governed by isolation mode, not e-mode.
