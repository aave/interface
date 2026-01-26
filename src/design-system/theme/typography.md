# Типографика

## Обзор

Типографика использует шрифт **Inter** с резервным шрифтом **Arial**. Все варианты определены в `src/utils/theme.tsx`.

## Варианты типографики

### Заголовки

#### display1
- **Font size**: 32px
- **Font weight**: 700
- **Line height**: 123.5%
- **Letter spacing**: 0.25px
- **Использование**: Главные заголовки страниц

#### h1
- **Font size**: 28px
- **Font weight**: 700
- **Line height**: 123.5%
- **Letter spacing**: 0.25px
- **Использование**: Основные заголовки секций

#### h2
- **Font size**: 21px
- **Font weight**: 600
- **Line height**: 133.4%
- **Использование**: Подзаголовки секций

#### h3
- **Font size**: 18px
- **Font weight**: 600
- **Line height**: 160%
- **Letter spacing**: 0.15px
- **Использование**: Заголовки подсекций

#### h4
- **Font size**: 16px
- **Font weight**: 600
- **Line height**: 24px
- **Letter spacing**: 0.15px
- **Использование**: Мелкие заголовки

### Текст

#### subheader1
- **Font size**: 14px
- **Font weight**: 600
- **Line height**: 20px
- **Letter spacing**: 0.15px
- **Использование**: Подзаголовки в списках

#### subheader2
- **Font size**: 12px
- **Font weight**: 500
- **Line height**: 16px
- **Letter spacing**: 0.1px
- **Использование**: Мелкие подзаголовки

#### description
- **Font size**: 14px
- **Font weight**: 400
- **Line height**: 143%
- **Letter spacing**: 0.15px
- **Использование**: Основной текст (по умолчанию)

#### caption
- **Font size**: 12px
- **Font weight**: 400
- **Line height**: 16px
- **Letter spacing**: 0.15px
- **Использование**: Вспомогательный текст

### Кнопки

#### buttonL
- **Font size**: 16px
- **Font weight**: 500
- **Line height**: 24px
- **Letter spacing**: 0.46px
- **Использование**: Большие кнопки

#### buttonM
- **Font size**: 14px
- **Font weight**: 500
- **Line height**: 24px
- **Использование**: Средние кнопки

#### buttonS
- **Font size**: 10px
- **Font weight**: 600
- **Line height**: 20px
- **Letter spacing**: 0.46px
- **Text transform**: uppercase
- **Использование**: Маленькие кнопки

### Специальные варианты

#### main21
- **Font size**: 21px
- **Font weight**: 800
- **Line height**: 133.4%
- **Использование**: Акцентные числа

#### secondary21
- **Font size**: 21px
- **Font weight**: 500
- **Line height**: 133.4%
- **Использование**: Вторичные числа

#### main16
- **Font size**: 16px
- **Font weight**: 600
- **Line height**: 24px
- **Letter spacing**: 0.15px
- **Использование**: Основные числа среднего размера

#### secondary16
- **Font size**: 16px
- **Font weight**: 500
- **Line height**: 24px
- **Letter spacing**: 0.15px
- **Использование**: Вторичные числа среднего размера

#### main14
- **Font size**: 14px
- **Font weight**: 600
- **Line height**: 20px
- **Letter spacing**: 0.15px
- **Использование**: Основные числа

#### secondary14
- **Font size**: 14px
- **Font weight**: 500
- **Line height**: 20px
- **Letter spacing**: 0.15px
- **Использование**: Вторичные числа

#### main12
- **Font size**: 12px
- **Font weight**: 600
- **Line height**: 16px
- **Letter spacing**: 0.1px
- **Использование**: Основные числа малого размера

#### secondary12
- **Font size**: 12px
- **Font weight**: 500
- **Line height**: 16px
- **Letter spacing**: 0.1px
- **Использование**: Вторичные числа малого размера

### Вспомогательные

#### helperText
- **Font size**: 10px
- **Font weight**: 400
- **Line height**: 12px
- **Letter spacing**: 0.4px
- **Использование**: Текст подсказок

#### tooltip
- **Font size**: 12px
- **Font weight**: 400
- **Line height**: 16px
- **Letter spacing**: 0.15px
- **Использование**: Текст в тултипах

## Использование

```tsx
import { Typography } from '@mui/material';

<Typography variant="h1">Заголовок</Typography>
<Typography variant="description">Основной текст</Typography>
<Typography variant="buttonL">Текст кнопки</Typography>
```

