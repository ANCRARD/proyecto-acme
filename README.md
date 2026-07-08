# Proyecto Acme — Sistema de Automatización

Descripción

- Aplicación web simple para gestión de usuarios, inventario y producción de la Planta Macondo.
- Tecnologías: HTML, CSS y JavaScript (sin frameworks). Datos mínimos persistidos en `localStorage`.

Estado actual

- La pantalla de inicio ahora muestra el formulario de **login** por defecto (se cambió en `index.html`).

Estructura de archivos

- `index.html` — Página principal (login/registro).
- `usuarios.js` (o `users_login.js`) — Lógica de registro e inicio de sesión.
- `inventario.html`, `inventario.js` — Módulo de inventario.
- `produccion.html`, `produccion.js` — Módulo de producción.
- `style.css` — Estilos globales.

Cómo ejecutar

1. Abrir `index.html` en el navegador (doble clic) o servir la carpeta con un servidor estático.
   - Con Python 3:

```bash
cd proyecto-acme
python -m http.server 8000
```

2. Navegar a `http://localhost:8000`.

Notas importantes

- Los usuarios se almacenan en `localStorage` bajo la clave `usuariosAcme`.
- Tras iniciar sesión se redirige a `inventario.html`.

Pruebas rápidas

- Registrar un usuario desde la opción "Regístrate" y luego usar sus credenciales para iniciar sesión.

Mejoras sugeridas

- Añadir validación más robusta y mensajes inline en lugar de `alert`.
- Implementar hash de contraseñas (actualmente se almacenan en texto plano en `localStorage`).
- Añadir protección de rutas y manejo de sesiones real en backend.

Contacto

- Si quieres que añada instrucciones adicionales o un despliegue simple, dime qué prefieres y lo preparo.
