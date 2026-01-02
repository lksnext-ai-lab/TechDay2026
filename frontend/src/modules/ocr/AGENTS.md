# Agente: Digitalización OCR

## Descripción
Este agente demuestra las capacidades de digitalización automática de documentos físicos mediante reconocimiento óptico de caracteres (OCR) y visión artificial.

## Archivos Principales
*   **Componente Principal:** `Ocr.jsx`

## Funcionalidades
*   **Simulación de Webcam:** Interfaz visual que simula la vista de una cámara para capturar documentos.
*   **Escaneo Visual:** Efecto de animación "láser" que recorre la imagen durante el proceso de captura.
*   **Extracción de Datos:** Procesa la imagen capturada para extraer campos estructurados:
    *   Tipo de Documento
    *   NIF / CIF
    *   Fecha
    *   Conceptos e Importes
*   **Integración:** Simula la exportación automática de los datos extraídos a un sistema ERP.
