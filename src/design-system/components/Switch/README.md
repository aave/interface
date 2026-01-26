# Switch Component

## Обзор

Компонент Switch - это переключатель из дизайн-системы, используемый для включения/выключения опций.

## Импорт

```tsx
import { DesignSystemSwitch as Switch } from 'src/design-system/components/Switch';
// или
import Switch from 'src/design-system/components/Switch';
```

## Размеры (Sizes)

### medium (по умолчанию)
- Высота: 32px (20px + 6px padding с каждой стороны)
- Ширина: 46px (34px + 6px padding с каждой стороны)
- Thumb: 16px × 16px
- Track: 8px высота, border-radius 8px

```tsx
<Switch size="medium" />
```

### small
Уменьшенная версия переключателя.

```tsx
<Switch size="small" />
```

## Состояния (States)

### Default (Unchecked)
Переключатель в выключенном состоянии.

```tsx
<Switch checked={false} />
```

**Визуальные характеристики:**
- Track: цвет `action.active`
- Thumb: белый, расположен слева
- Opacity: 1

### Checked
Переключатель во включённом состоянии.

```tsx
<Switch checked={true} />
```

**Визуальные характеристики:**
- Track: цвет `success.main` (зелёный)
- Thumb: белый, сдвинут вправо на 14px
- Opacity: 1

### Hover
Состояние при наведении курсора. Автоматически обрабатывается темой.

**Особенности:**
- Улучшенная видимость интерактивности
- Плавный переход состояний

### Active (Pressed)
Состояние при нажатии. Автоматически обрабатывается темой.

**Особенности:**
- Визуальная обратная связь при взаимодействии
- Ripple эффект (если не отключён)

### Disabled
Переключатель недоступен для взаимодействия.

```tsx
<Switch checked={enabled} disabled />
```

**Визуальные характеристики:**
- Opacity: 0.3 (dark mode) / 0.7 (light mode)
- Не реагирует на клики
- Не получает фокус

### Loading
Состояние загрузки. Реализуется через обёртку с индикатором загрузки.

```tsx
<Box sx={{ position: 'relative' }}>
  <Switch checked={enabled} disabled={isLoading} />
  {isLoading && (
    <CircularProgress
      size={16}
      sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    />
  )}
</Box>
```

## Цвета (Colors)

### default (по умолчанию)
Стандартный цвет. В checked состоянии используется `success.main`.

```tsx
<Switch color="default" />
```

### primary
Основной цвет темы.

```tsx
<Switch color="primary" />
```

### secondary
Вторичный цвет темы.

```tsx
<Switch color="secondary" />
```

### success
Цвет успеха (по умолчанию для checked состояния).

```tsx
<Switch color="success" />
```

## Примеры использования

### Базовое использование

```tsx
const [enabled, setEnabled] = useState(false);

<Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
```

### С меткой

```tsx
<FormControlLabel
  control={<Switch checked={enabled} onChange={handleChange} />}
  label="Включить уведомления"
/>
```

### Disabled состояние

```tsx
<Switch checked={enabled} disabled />
```

### Без ripple эффекта

```tsx
<Switch checked={enabled} disableRipple />
```

### Использование в списке (как в проекте)

```tsx
<ListItemUsedAsCollateral
  isIsolated={isIsolated}
  usageAsCollateralEnabledOnUser={enabled}
  canBeEnabledAsCollateral={canEnable}
  onToggleSwitch={handleToggle}
  disabled={isLoading}
/>
```

## Технические характеристики

### Размеры (medium)
- **Root**: height: 32px, width: 46px, padding: 6px
- **SwitchBase**: padding: 8px
- **Thumb**: 16px × 16px, border-radius: 6px
- **Track**: border-radius: 8px, opacity: 1

### Анимации
- Плавный переход при изменении состояния
- Transform для перемещения thumb: `translateX(14px)` в checked состоянии
- Transition для всех изменений состояния

### Цвета (из темы)
- **Track (unchecked)**: `theme.palette.action.active`
- **Track (checked)**: `theme.palette.success.main`
- **Thumb**: `theme.palette.common.white`
- **Shadow**: `0px 1px 1px rgba(0, 0, 0, 0.12)`

## Ограничения

1. **Размеры**: Фиксированные размеры для medium варианта
2. **Цвета**: В checked состоянии всегда используется success цвет (зелёный)
3. **Доступность**: Требуется правильная связь с label через `aria-labelledby` или `FormControlLabel`

## Доступность

- Поддерживает навигацию с клавиатуры (Tab, Space)
- Правильные ARIA-атрибуты (`role="switch"`, `aria-checked`)
- Поддерживает фокус и активное состояние
- В состоянии disabled не получает фокус

## Интеграция с темой

Все стили переключателя определены в `src/utils/theme.tsx` в секции `MuiSwitch`. Изменения темы автоматически применяются ко всем переключателям.

## Использование в проекте

Switch используется в следующих местах:
- `ListItemUsedAsCollateral` - для включения/выключения использования как залога
- Настройки темы (dark/light mode)
- Различные настройки и опции

