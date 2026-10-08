# ReservaSalas

Proyecto de reserva y gestión de salas para estudiantes, docentes y administradores.

## Objetivo del sprint

Desarrollar un prototipo funcional de ReservaSalas que permita consultar la disponibilidad de las salas y realizar reservas de manera sencilla, simulando un proceso digital para la comunidad universitaria.

## Historias de usuario trabajadas

- Consultar la disponibilidad de una sala.
- Reservar una sala.
- Recibir confirmación de la reserva.
- Evitar reservas duplicadas.
- Gestionar las reservas de las salas.

## Decisiones técnicas

- Se utilizó Replit para desarrollar y probar rápidamente el prototipo.
- Se utilizó React con TypeScript para construir la interfaz.
- Se utilizó CSS para la presentación visual de la aplicación.
- Las reservas del prototipo se almacenan localmente en el navegador.
- Se utilizó GitHub para controlar versiones y organizar el código del proyecto.
- Se trabajó con ramas de Git para integrar los cambios de forma segura en la rama principal `main`.

## Funcionalidades del prototipo

- Selección de sala.
- Selección de fecha.
- Selección de hora de inicio y finalización.
- Consulta de disponibilidad.
- Registro de una reserva.
- Confirmación de la reserva.
- Visualización de las reservas del día.
- Identificación de salas ocupadas y disponibles.
- Prevención de reservas que coincidan con una reserva existente.

## Riesgos identificados

- El almacenamiento local limita la información al navegador y dispositivo donde se realiza la reserva.
- El prototipo todavía no utiliza una base de datos centralizada.
- La aplicación requiere una evolución posterior para manejar usuarios, permisos y reservas compartidas entre diferentes dispositivos.
- Se debe realizar mayor validación y pruebas antes de utilizar el sistema en un entorno real.

## Próximos pasos

- Implementar una base de datos centralizada.
- Incorporar autenticación de usuarios.
- Definir roles para estudiantes, docentes y administradores.
- Mejorar la gestión y consulta de reservas.
- Realizar pruebas funcionales con diferentes escenarios.
- Continuar refinando las historias de usuario y el backlog del proyecto.

## Estado del sprint

El prototipo funcional fue desarrollado en Replit y posteriormente integrado con GitHub. La rama `replit-app` fue fusionada con la rama principal `main`.

El prototipo permite realizar una reserva y visualizar su confirmación, demostrando una funcionalidad mínima verificable para el sprint.
