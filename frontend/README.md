# LKS Tech Day 2026 - Demo Frontend

Este proyecto es la demostración frontend desarrollada para el evento LKS Tech Day 2026. Está construido con React y Vite, y presenta cuatro módulos interactivos principales integrados bajo la identidad de marca de LKS Next.

## Módulos

El sistema consta de los siguientes módulos accesibles desde la página principal:

*   **Chatbot:** Asistente virtual para consultas.
*   **SAT:** Simulador de procesos de asistencia técnica.
*   **OCR:** Escáner de documentos mediante webcam.
*   **Sorteo:** Feedback del evento y participación en sorteos.

Para más detalles sobre los agentes, consulta el archivo [AGENTS.md](./AGENTS.md).

## Requisitos Previos

*   Node.js (versión 18 o superior recomendada)
*   npm (incluido con Node.js)

## Instalación y Ejecución

Sigue estos pasos para poner en marcha el proyecto en tu entorno local:

1.  **Clonar el repositorio (si no lo has hecho ya):**
    ```bash
    git clone <url-del-repositorio>
    cd TechDay2026
    ```

2.  **Instalar dependencias:**
    Ejecuta el siguiente comando en la raíz del proyecto para instalar todas las librerías necesarias:
    ```bash
    npm install
    ```

3.  **Iniciar el servidor de desarrollo:**
    Para lanzar la aplicación en modo desarrollo (con recarga en caliente):
    ```bash
    npm run dev
    ```
    
    Una vez iniciado, abre tu navegador y visita la URL que aparece en la terminal (usualmente `http://localhost:5173`).

## Construcción para Producción

Para generar una versión optimizada para producción:

```bash
npm run build
```

Los archivos generados se guardarán en la carpeta `dist`.

## Estructura del Proyecto

*   `src/`: Código fuente de la aplicación.
    *   `components/`: Componentes reutilizables (Layout, etc.).
    *   `pages/`: Vistas principales de cada módulo (Home, Chat, Sat, Ocr, Sorteo).
    *   `assets/`: Imágenes y recursos estáticos.

---
Desarrollado para LKS Next - Tech Day 2026
