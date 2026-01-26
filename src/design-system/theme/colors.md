# Цветовая палитра

## Обзор

Цветовая палитра поддерживает светлую и тёмную темы. Все цвета определены в `src/utils/theme.tsx`.

## Основные цвета

### Primary
- **main**: `#383D51` (light) / `#EAEBEF` (dark)
- **light**: `#62677B` (light) / `#F1F1F3` (dark)
- **dark**: `#292E41` (light) / `#D2D4DC` (dark)
- **contrast**: `#FFFFFF` (light) / `#0F121D` (dark)

### Secondary
- **main**: `#FF607B` (light) / `#F48FB1` (dark)
- **light**: `#FF607B` (light) / `#F6A5C0` (dark)
- **dark**: `#B34356` (light) / `#AA647B` (dark)

## Семантические цвета

### Error
- **main**: `#BC0000B8` (light) / `#F44336` (dark)
- **light**: `#D26666` (light) / `#E57373` (dark)
- **dark**: `#BC0000` (light) / `#D32F2F` (dark)
- **100**: Для текста алертов
- **200**: Для фона алертов

### Warning
- **main**: `#F89F1A` (light) / `#FFA726` (dark)
- **light**: `#FFCE00` (light) / `#FFB74D` (dark)
- **dark**: `#C67F15` (light) / `#F57C00` (dark)
- **100**: Для текста алертов
- **200**: Для фона алертов

### Info
- **main**: `#0062D2` (light) / `#29B6F6` (dark)
- **light**: `#0062D2` (light) / `#4FC3F7` (dark)
- **dark**: `#002754` (light) / `#0288D1` (dark)
- **100**: Для текста алертов
- **200**: Для фона алертов

### Success
- **main**: `#4CAF50` (light) / `#66BB6A` (dark)
- **light**: `#90FF95` (light) / `#90FF95` (dark)
- **dark**: `#318435` (light) / `#388E3C` (dark)
- **100**: Для текста алертов
- **200**: Для фона алертов

## Текст

- **primary**: `#303549` (light) / `#F1F1F3` (dark)
- **secondary**: `#62677B` (light) / `#A5A8B6` (dark)
- **disabled**: `#D2D4DC` (light) / `#62677B` (dark)
- **muted**: `#A5A8B6` (light) / `#8E92A3` (dark)
- **highlight**: `#383D51` (light) / `#C9B3F9` (dark)

## Фон

- **default**: `#F1F1F3` (light) / `#1B2030` (dark)
- **paper**: `#FFFFFF` (light) / `#292E41` (dark)
- **surface**: `#F7F7F9` (light) / `#383D51` (dark)
- **surface2**: `#F9F9FB` (light) / `#383D51` (dark)
- **header**: `#2B2D3C` (light) / `#1B2030` (dark)
- **disabled**: `#EAEBEF` (light) / `#EBEBEF14` (dark)

## Градиенты

- **aaveGradient**: `linear-gradient(248.86deg, #B6509E 10.51%, #2EBAC6 93.41%)`
- **newGradient**: `linear-gradient(79.67deg, #8C3EBC 0%, #007782 95.82%)`

## Использование

Все цвета доступны через тему Material-UI:

```tsx
import { useTheme } from '@mui/material/styles';

const theme = useTheme();
const primaryColor = theme.palette.primary.main;
```

