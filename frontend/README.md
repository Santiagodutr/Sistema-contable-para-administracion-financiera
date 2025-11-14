# Frontend - Sistema de Gestión Contable

Interfaz web moderna desarrollada con React 18, TypeScript y TailwindCSS.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Build de Producción

```bash
npm run build
```

### Preview del Build

```bash
npm run preview
```

## 🛠️ Stack Tecnológico

- **React 18.2** - Biblioteca UI
- **TypeScript 5.3** - Tipado estático
- **Vite 5.1** - Build tool y dev server
- **React Router 6.22** - Enrutamiento SPA
- **TailwindCSS 3.4** - CSS utility-first
- **shadcn/ui** - Componentes UI (Radix UI)
- **Zustand 4.5** - State management
- **React Hook Form 7.50** - Formularios
- **Zod 3.22** - Validación de schemas
- **Lucide React** - Íconos
- **Sonner** - Toast notifications

## 📁 Estructura

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   └── table.tsx
│   ├── Header.tsx       # Navegación principal
│   └── Layout.tsx       # Layout wrapper
│
├── pages/               # Páginas de la app
│   ├── HomePage.tsx
│   ├── CuentasPage.tsx
│   ├── BalancePage.tsx
│   ├── EstadoResultadosPage.tsx
│   ├── NominaPage.tsx
│   ├── KardexPage.tsx
│   ├── AnalisisFinancieroPage.tsx
│   └── DepreciacionPage.tsx
│
├── stores/              # Zustand stores
│   ├── cuentasStore.ts
│   ├── nominaStore.ts
│   └── kardexStore.ts
│
├── lib/
│   └── utils.ts         # Utilidades y helpers
│
├── App.tsx              # Rutas y configuración
├── main.tsx             # Entry point
└── index.css            # Estilos globales + Tailwind
```

## 🎨 Componentes shadcn/ui

Para agregar más componentes:

```bash
npx shadcn-ui@latest add [component-name]
```

Ejemplos:
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
```

## 🗄️ State Management (Zustand)

### cuentasStore
- Gestión del plan de cuentas
- Registro de movimientos débito/crédito
- Cálculo automático de saldos
- Persistencia en localStorage

### nominaStore
- CRUD de empleados
- Registro de pagos
- Cálculo de deducciones (8%)

### kardexStore
- Gestión de productos
- Entradas/salidas de inventario
- Método PEPS/FIFO
- Valoración de inventario

## 🎯 Rutas

- `/` - Página de inicio
- `/cuentas` - Plan de cuentas
- `/balance` - Balance general
- `/estado-resultados` - Estado de resultados
- `/nomina` - Gestión de nómina
- `/kardex` - Control de inventario
- `/analisis` - Análisis financiero
- `/depreciacion` - Depreciación de activos

## 💅 Personalización de Tema

Edita `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      // ... más colores
    },
  },
}
```

Variables CSS en `index.css`:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* ... más variables */
}
```

## 🧪 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia dev server en puerto 5173 |
| `npm run build` | Build de producción en `/dist` |
| `npm run preview` | Preview del build |
| `npm run lint` | Ejecuta ESLint |

## 📝 Convenciones de Código

- Componentes en **PascalCase** (ej: `CuentasPage.tsx`)
- Funciones helper en **camelCase** (ej: `formatCurrency()`)
- Constantes en **UPPER_CASE** (ej: `TIPOS_CUENTA`)
- Interfaces TypeScript con prefijo **I** opcional

## 🔧 Configuración

### Vite
- Alias `@` → `./src`
- Puerto: 5173
- HMR habilitado

### TypeScript
- Strict mode activado
- Target: ES2020
- Module: ESNext

### TailwindCSS
- JIT mode
- Autoprefixer
- Plugin: tailwindcss-animate

## 📦 Dependencias Principales

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.22.0",
  "zustand": "^4.5.0",
  "react-hook-form": "^7.50.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0"
}
```

## 🎓 Recursos

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://docs.pmnd.rs/zustand)
- [React Hook Form](https://react-hook-form.com)

## 📄 Licencia

MIT
