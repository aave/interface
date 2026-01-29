# Таблица (Table)

## Обзор

Таблицы в проекте строятся на компонентах дизайн-системы **Table** (обёртки над MUI): `TableContainer`, `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell`. Они соответствуют семантике HTML-таблицы (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`, `<th>`).

## Соответствие HTML и MUI

| HTML | MUI | Назначение |
|------|-----|------------|
| `<table>` | `Table` | Корневой контейнер таблицы |
| `<thead>` | `TableHead` | Блок заголовков колонок |
| `<tbody>` | `TableBody` | Блок строк с данными |
| `<tr>` | `TableRow` | Строка (заголовочная или ячеек) |
| `<th>` | `TableCell` | Ячейка заголовка (в `TableHead`) |
| `<td>` | `TableCell` | Ячейка данных (в `TableBody`) |

Для обёртки таблицы с прокруткой используется `TableContainer` (аналог контейнера вокруг `<table>`).

## Импорт

Используйте компоненты дизайн-системы:

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  tableCellClasses,
} from 'src/design-system/components';
```

## Структура

### Базовый каркас

```tsx
<TableContainer>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Колонка 1</TableCell>
        <TableCell>Колонка 2</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>Ячейка 1</TableCell>
        <TableCell>Ячейка 2</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableContainer>
```

- **TableContainer** — оборачивает таблицу, при задании `maxHeight` включает вертикальную прокрутку.
- **Table** — сама таблица. Часто `size="small"` для компактного вида.
- **TableHead** — блок заголовков (`<thead>`).
- **TableBody** — блок данных (`<tbody>`).
- **TableRow** — строка (`<tr>`).
- **TableCell** — ячейка (`<th>` или `<td>`). В `TableHead` используется для заголовков.

## Варианты использования

### Заголовки с Typography

В заголовках обычно используется `Typography variant="helperText"`:

```tsx
<TableHead>
  <TableRow>
    <TableCell align="center">
      <Typography variant="helperText">
        <Trans>Asset</Trans>
      </Typography>
    </TableCell>
    <TableCell align="right">
      <Typography variant="helperText">
        <Trans>Amount</Trans>
      </Typography>
    </TableCell>
  </TableRow>
</TableHead>
```

### Выравнивание ячеек

- `align="left"` | `align="center"` | `align="right"` у `TableCell`.
- Для числовых колонок — `align="right"`.
- Для первой колонки часто `align="left"` и `sx={{ pl: 0 }}`, для последней — `sx={{ pr: 0 }}`.

### Таблица с фиксированным заголовком (sticky)

При прокрутке контента заголовок остаётся видимым:

```tsx
<TableContainer sx={{ maxHeight: '270px' }}>
  <Table size="small" stickyHeader>
    <TableHead>
      <TableRow>...</TableRow>
    </TableHead>
    <TableBody>...</TableBody>
  </Table>
</TableContainer>
```

### Стилизация строк и ячеек

Через `sx` у `TableRow` и `TableCell`, в т.ч. с `tableCellClasses`:

```tsx
<TableRow
  sx={{
    [`& .${tableCellClasses.root}`]: {
      py: 2,
      lineHeight: 0,
    },
  }}
>
  <TableCell>...</TableCell>
</TableRow>
```

Убрать нижнюю границу у последней строки:

```tsx
<TableRow
  sx={{
    [`& .${tableCellClasses.root}`]: {
      borderBottom: 'none',
    },
  }}
>
  ...
</TableRow>
```

### Рендер HTML-таблиц из Markdown

В `ProposalOverview` HTML-таблицы из Markdown маппятся на MUI:

- `thead` → `TableHead`
- `tbody` → `TableBody`
- `tr` → `TableRow`
- `td` / `th` → `TableCell`

## Тема

Стили таблицы задаются в `src/utils/theme.tsx` в `MuiTableCell`:

- `borderColor: theme.palette.divider` для границ ячеек.

Остальное — через `sx` в местах использования.

## Примеры в проекте

- **EmodeModalContent** — таблица режимов (Asset, Collateral, Borrowable), `stickyHeader`, `TableContainer` с `maxHeight`.
- **GhoPieChartContainer** — легенда в виде таблицы (Borrow balance, Amount, APY).
- **ProposalOverview** — таблицы из Markdown-описания предложений через `ReactMarkdown` и кастомные компоненты для `thead` / `tbody` / `tr` / `td` / `th`.

## Ограничения

1. Для сложной сортировки, пагинации и т.п. требуется своя логика поверх `Table*`.
2. На мобильных часто таблицы заменяются на карточки или упрощённые списки (например, `MarketAssetsList`).

## Доступность

- Используется семантичная разметка (`thead` / `tbody` через MUI).
- Заголовки колонок задаются через `TableCell` в `TableHead` и при необходимости `Typography`.
- Для скроллируемых таблиц с `stickyHeader` учитывайте, что фокус при навигации с клавиатуры остаётся внутри видимой области.
