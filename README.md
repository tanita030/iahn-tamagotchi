# IAHN Tamagotchi V46

Base estable V44 + PWA instalable. La pantalla de inicio usa el mismo fondo de START y ofrece instalar IAHN y un botón de ayuda.

El icono de la app usa el sprite 01_normal suministrado. Firebase y el chat/presencia de V44 se mantienen.


## V46.1 — optimización Firebase
- `game/iahn`: cambios agrupados durante 15 s antes de una escritura.
- `users/{uid}`: solo se escribe si cambian usuario, estrellas o habitación; debounce de 5 s.
- Presencia: actualización cada 2 min y ventana de conexión de 5 min.
- Service Worker: `iahn-v46-1`.
