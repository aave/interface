# Table

## Обзор

Компоненты таблицы дизайн-системы — обёртки над MUI Table. Включают `TableContainer`, `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell`. Соответствуют семантике HTML: `thead`, `tbody`, `tr`, `td`/`th`.

## Импорт

```tsx
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  tableCellClasses,
} from 'src/design-system/components/Table';
```

Или из барреля:

```tsx
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  tableCellClasses,
} from 'src/design-system/components';
```

## Компоненты

| Компонент | HTML | Назначение |
|-----------|------|------------|
| `TableContainer` | — | Обёртка над таблицей; при `maxHeight` даёт прокрутку |
| `Table` | `<table>` | Корневая таблица, по умолчанию `size="small"` |
| `TableHead` | `<thead>` | Блок заголовков |
| `TableBody` | `<tbody>` | Блок данных |
| `TableRow` | `<tr>` | Строка |
| `TableCell` | `<td>` / `<th>` | Ячейка |

## Базовый пример

```tsx
<TableContainer>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell><Typography variant="helperText">Колонка 1</Typography></TableCell>
        <TableCell align="right"><Typography variant="helperText">Колонка 2</Typography></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>Ячейка 1</TableCell>
        <TableCell align="right">Ячейка 2</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableContainer>
```

## Table — размеры

- `size="small"` (по умолчанию) — компактная таблица
- `size="medium"` — стандартная

## Sticky-заголовок

```tsx
<TableContainer sx={{ maxHeight: '270px' }}>
  <Table stickyHeader>
    <TableHead>...</TableHead>
    <TableBody>...</TableBody>
  </Table>
</TableContainer>
```

## Стилизация ячеек

Используйте `tableCellClasses` и `sx` у `TableRow` / `TableCell`:

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

## Подробнее

См. `src/design-system/guidelines/table.md`.
