# Agente: Soporte Técnico Inteligente (SAT)

## Descripción
Este módulo simula un proceso de diagnóstico técnico avanzado asistido por Inteligencia Artificial. Demuestra cómo la IA puede predecir fallos y sugerir acciones correctivas en maquinaria industrial.

## Archivos Principales
*   **Componente Principal:** `Sat.jsx`

## Flujo del Proceso
1.  **Entrada:** El usuario introduce un número de serie (ej: LKS-mach-2024-X).
2.  **Análisis (Simulado):** Se muestran logs de consola simulando conexión remota, descarga de telemetría y análisis de patrones.
3.  **Resultados:**
    *   **Estado Actual:** Muestra métricas en tiempo real (Temperatura, Vibración).
    *   **Predicción:** Alerta sobre posibles fallos futuros (ej: fallo en rodamientos).
    *   **Recomendaciones:** Lista de acciones sugeridas automáticamente por la IA para evitar el fallo.
17: 
18: ### Agente de Call Center
19: *   **Interfaz:** Chat interactivo (`CallCenterAgent.jsx`).
20: *   **Backend:** Agente IA Mattin con acceso a herramientas MCP.
21: *   **Capacidades:**
22:     *   Consultar tipos de máquinas.
23:     *   Consultar modelos disponibles.
24:     *   Crear nuevas incidencias en base de datos.
