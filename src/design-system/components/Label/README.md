# Label

## Обзор

Компонент Label — метка для полей формы. Оборачивает MUI `FormLabel` с дизайн-системными стилями по умолчанию (`mb: 1`, `color: 'text.secondary'`). Используется над полями ввода, селектами и т.п.

Для меток у **Switch** / **Checkbox** используйте `FormControlLabel` из MUI, а не этот компонент.

## Импорт

```tsx
import { Label } from 'src/design-system/components/Label';
// или
import Label from 'src/design-system/components/Label';
```

Или из барреля:

```tsx
import { Label } from 'src/design-system/components';
```

## Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `children` | `ReactNode` | — | Текст или содержимое метки |
| `htmlFor` | `string` | — | `id` связанного поля (доступность) |
| `required` | `boolean` | `false` | Показывает * после текста |
| `sx` | `SxProps<Theme>` | — | Доп. стили (мержатся с дефолтными) |

Остальные props передаются в `FormLabel` (MUI).

## Примеры

### Метка над полем

```tsx
<Label htmlFor="email">
  <Trans>Email</Trans>
</Label>
<OutlinedInput id="email" />
```

### Метка над селектом

```tsx
<FormControl>
  <Label>
    <Trans>Reward(s) to claim</Trans>
  </Label>
  <Select>...</Select>
</FormControl>
```

### Обязательное поле

```tsx
<Label htmlFor="name" required>
  <Trans>Name</Trans>
</Label>
<OutlinedInput id="name" required />
```

### Кастомные стили

```tsx
<Label sx={{ mb: 2, fontWeight: 600 }}>
  <Trans>Custom label</Trans>
</Label>
```

## Доступность

- Используйте `htmlFor` и `id` у поля для связи метки с контролом.
- Для обязательных полей используйте `required` на метке и на самом поле.

## Подробнее

См. `src/design-system/guidelines/label.md`.
