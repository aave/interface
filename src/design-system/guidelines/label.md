# Label (метка)

## Обзор

Для меток над полями формы используется компонент дизайн-системы **Label** (обёртка над MUI `FormLabel`). Метки у Switch/Checkbox — **FormControlLabel** (MUI). Для пар «метка — значение» — примитив **Row** (`caption`). Для доступности — `aria-label` у интерактивных элементов без видимого текста.

## Варианты использования

### 1. FormControlLabel (Switch, Checkbox)

Связывает контрол (Switch, Checkbox) с текстовой меткой. Метка может быть строкой или React-узлом (например, `Typography` с `<Trans>`).

**Импорт:**

```tsx
import { FormControlLabel, Switch } from '@mui/material';
// или
import { FormControlLabel, Checkbox } from '@mui/material';
```

**Примеры:**

```tsx
// Switch с меткой
<FormControlLabel
  control={<Switch checked={enabled} onChange={handleChange} />}
  label="Включить уведомления"
/>

// С Typography и i18n
<FormControlLabel
  control={<Switch checked={useConnectedAccount} onClick={handleToggle} />}
  labelPlacement="start"
  label={
    <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary">
      <Trans>Use connected account</Trans>
    </Typography>
  }
/>

// Checkbox с меткой
<FormControlLabel
  control={
    <Checkbox checked={isChecked} onChange={handleChange} size="small" />
  }
  label={
    <Typography variant="description">
      <Trans>I fully understand the risks of migrating.</Trans>
    </Typography>
  }
/>
```

**Свойства:**

- `control` — Switch или Checkbox.
- `label` — строка или `ReactNode` (часто `Typography` + `Trans`).
- `labelPlacement` — `"end"` | `"start"` | `"top"` | `"bottom"`. Например, `"start"` для метки слева от Switch.
- `sx` — стили (например, `margin: 0`, `mx: 0`).

Используется в: `BridgeDestinationInput`, `DashboardListTopPanel`, `DarkModeSwitcher`, `TestNetModeSwitcher`, `MigrationBottomPanel`, `StakeCooldownModalContent`, `GovRepresentativesModalContent` и др.

### 2. Label (дизайн-система)

Метка для полей и селектов. Обычно над полем. Дефолтные стили: `mb: 1`, `color: 'text.secondary'`.

**Импорт:**

```tsx
import { Label } from 'src/design-system/components';
```

**Пример:**

```tsx
<FormControl>
  <Label>
    <Trans>Reward(s) to claim</Trans>
  </Label>
  {/* Поле или селект */}
</FormControl>
```

Используется в: `RewardsSelect` (после перехода на компонент) и в новых формах.

### 3. Typography как метка

Обычная типографика для подписей над полями, в формах и модалках.

**Примеры:**

```tsx
// Над полем (цвет secondary)
<Typography color="text.secondary">
  <Trans>To</Trans>
</Typography>
<InputBase placeholder="..." />

// Заголовок блока формы
<Typography variant="subheader2" gutterBottom>
  <Trans>{title}</Trans>
</Typography>
<OutlinedInput ... />
```

Варианты: `description`, `subheader2`, `caption`, `helperText` в зависимости от иерархии. Цвет часто `text.secondary`.

Используется в: `CalculatorInput` (`title`), `BridgeDestinationInput` («To»), `TxModalDetails` («Transaction overview») и др.

### 4. Row с caption (пары «метка — значение»)

Примитив **Row** из `src/components/primitives/Row` рисует строку «метка слева — значение справа». Метка задаётся через `caption`.

**Импорт:**

```tsx
import { Row } from 'src/components/primitives/Row';
```

**Пример:**

```tsx
<Row caption={description} captionVariant="description" mb={4}>
  <FormattedNumber value={value} />
</Row>
```

**Свойства:**

- `caption` — `ReactNode`, текст или узел метки.
- `captionVariant` — `'secondary16'` | `'description'` | `'subheader1'` | `'caption'` | `'h3'`.
- `captionColor` — цвет метки.
- `align` — `'center'` | `'flex-start'` для выравнивания по вертикали.

Используется в: `DetailsNumberLine`, `DetailsNumberLineWithSub` и других блоках «Transaction overview» в модалках.

### 5. aria-label (доступность)

Для кнопок и контролов без видимой текстовой метки (иконки, бургер-меню и т.п.) задаётся `aria-label`:

```tsx
<IconButton aria-label="Go to homepage" ... />
<IconButton aria-label="settings" ... />
<IconButton aria-label="more" ... />
<Select aria-label="select market" ... />
```

Так скринридеры получают осмысленное описание действия.

## Когда что использовать

| Сценарий | Что использовать |
|----------|-------------------|
| Метка у Switch / Checkbox | `FormControlLabel` |
| Метка над полем/селектом в форме | `Label` (дизайн-система) |
| Заголовок блока (калькулятор, секция) | `Typography` (`subheader2`, `h3` и т.д.) |
| Строка «метка — значение» в модалках | `Row` с `caption` |
| Иконка-кнопка без подписи | `aria-label` |
| Подпись к полю в произвольной вёрстке | `Typography` + `color="text.secondary"` или `Label` |

## Ограничения

1. Для форм обязательно связывать контрол с меткой (`Label` + `htmlFor`/`id`, или `FormControlLabel`) для доступности.
2. Switch и Checkbox всегда должны иметь метку (через `FormControlLabel` или `aria-labelledby`).

## Доступность

- У каждого интерактивного элемента должна быть доступная метка: видимая и/или через `aria-label` / `aria-labelledby`.
- `FormControlLabel` и `FormLabel` обеспечивают связь метки с контролом для скринридеров.
- При использовании только `Typography` рядом с полем убедитесь, что связь с полем очевидна (разметка, `aria-labelledby` или обёртка `FormControl`).
