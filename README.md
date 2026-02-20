# Sistema de Gestión Contable para Administración Financiera

![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.1-purple)

Una solución integral y moderna para la administración financiera, diseñada con un enfoque en la experiencia de usuario premium, rendimiento optimizado y precisión contable.

## ✨ Características Principales

Este sistema ofrece una suite completa de herramientas para el control financiero:

*   **📈 Gestión de Cuentas**: Plan de cuentas completo (Activos, Pasivos, Patrimonio, Ingresos, Gastos, Costos) con registro de movimientos y cálculo de saldos en tiempo real.
*   **📊 Estados Financieros**: Generación automatizada de Balance General y Estado de Resultados con visualizaciones modernas.
*   **📦 Control de Inventario (Kardex)**: Gestión de productos y movimientos de almacén utilizando el método PEPS (FIFO).
*   **👥 Nómina y RRHH**: Registro de empleados, cálculo de devengados, deducciones de ley y generación de colillas de pago.
*   **⚖️ Análisis Financiero**: Indicadores de liquidez, rentabilidad y endeudamiento con representaciones gráficas.
*   **📉 Depreciación de Activos**: Múltiplos métodos de cálculo (Línea Recta, Suma de Dígitos, Tasa Fija) para la valoración de activos fijos.

## 🎨 Diseño y UX

El proyecto ha sido recientemente refactorizado para ofrecer una interfaz **Premium Dark Theme**:

*   **Aesthetics**: Glassmorphism, efectos de brillo ("Emerald Glow") y animaciones fluidas.
*   **Tipografía**: Combinación moderna de 'Sora' para títulos y 'DM Sans' para lectura técnica.
*   **Responsive**: Diseño adaptativo con barra lateral colapsable y componentes optimizados para cualquier pantalla.

## 🛠️ Stack Tecnológico

*   **Frontend**: React (Vite) + TypeScript
*   **Estilos**: Tailwind CSS + shadcn/ui (Radix UI)
*   **Estado**: Zustand (con persistencia local)
*   **Formularios**: React Hook Form + Zod
*   **Iconos**: Lucide React (optimizado con ESM imports)
*   **Utilidades**: XLSX (Exportación a Excel), date-fns

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn

### Pasos
1. Navegar a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2. Instalar dependencias:
    ```bash
    npm install
    ```
3. Iniciar el servidor de desarrollo:
    ```bash
    npm run dev
    ```
4. Para generar el build de producción:
    ```bash
    npm run build
    ```

## 📁 Estructura del Proyecto

*   `frontend/src/pages`: Implementación de cada módulo financiero.
*   `frontend/src/stores`: Lógica de estado y persistencia de datos.
*   `frontend/src/components`: Componentes de interfaz reutilizables y layout.
*   `frontend/public`: Recursos estáticos y activos de marca.

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.
