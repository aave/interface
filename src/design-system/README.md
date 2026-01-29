# Дизайн-система

## Обзор

Дизайн-система проекта обеспечивает единообразие интерфейса, упрощает разработку и поддерживает масштабируемость.

## Структура

```
design-system/
├── README.md                 # Общая документация
├── theme/                    # Тема и конфигурация
│   ├── colors.md            # Цветовая палитра
│   ├── typography.md        # Типографика
│   └── tokens.ts            # Токены дизайн-системы
├── components/              # Компоненты дизайн-системы
│   ├── Button/             # Компонент Button
│   │   ├── Button.tsx      # Реализация
│   │   └── README.md       # Документация
│   ├── Switch/             # Компонент Switch
│   │   ├── Switch.tsx      # Реализация
│   │   └── README.md       # Документация
│   ├── Table/              # Таблица (Container, Table, Head, Body, Row, Cell)
│   │   ├── Table.tsx       # Реализация
│   │   └── README.md       # Документация
│   └── Label/              # Метка для полей формы
│       ├── Label.tsx       # Реализация
│       └── README.md       # Документация
└── guidelines/              # Руководящие принципы
    ├── usage.md            # Правила использования
    ├── table.md            # Таблица (Table, thead, tbody, tr, td)
    └── label.md            # Label (метки, FormControlLabel, Typography)
```

## Основные принципы

1. **Единообразие**: Все компоненты следуют единым правилам именования и использования
2. **Переиспользование**: Компоненты спроектированы для максимального переиспользования
3. **Доступность**: Все компоненты соответствуют стандартам доступности
4. **Документированность**: Каждый компонент имеет полную документацию состояний и вариантов

## Использование

Импортируйте компоненты из дизайн-системы:

```tsx
import { Button, Switch } from 'src/design-system/components';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell } from 'src/design-system/components';
import { Label } from 'src/design-system/components';
```

## Тема

Тема настроена в `src/utils/theme.tsx` и включает:
- Цветовую палитру (light/dark режимы)
- Типографику
- Breakpoints
- Глобальные стили

