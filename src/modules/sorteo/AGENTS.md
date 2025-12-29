# Agente: Sorteo y Feedback

## Descripción
Este módulo gestiona la interacción final con el usuario, recogiendo feedback sobre el evento y gestionando su participación en el sorteo. Funciona como un agente conversacional guiado (wizard).

## Archivos Principales
*   **Componente Principal:** `Sorteo.jsx`

## Flujo de Interacción
El agente guía al usuario paso a paso:
1.  **Valoración (NPS):** Pregunta por una puntuación del 1 al 10.
2.  **Opinión Cualitativa:** Solicita un breve comentario sobre lo que más le ha gustado.
3.  **Registro:** Pide el nombre del participante.
4.  **Contacto:** Solicita el email corporativo.
5.  **Confirmación:** Cierra el proceso confirmando la participación en el sorteo.

## Características
*   Interfaz de chat simplificada para la recogida de datos.
*   Validación básica de entrada (no permite avanzar sin respuesta).
