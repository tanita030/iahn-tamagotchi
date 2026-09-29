# Firebase — IAHN Tamagotchi

Esta versión mantiene el juego funcionando en local si `FIREBASE_CONFIG` es `null`.
Cuando se añada la configuración de Firebase, activa automáticamente:

- usuario anónimo por navegador;
- habitación y estrellas privadas por usuario;
- estadísticas de Iahn compartidas entre usuarios;
- compras permanentes de decoración.

## 1. Crear el proyecto

En Firebase crea un proyecto y activa:

- Authentication → Sign-in method → Anonymous
- Firestore Database

## 2. Configuración

Abre `firebase-config.js` y sustituye `null` por la configuración Web que proporciona Firebase:

```js
window.FIREBASE_CONFIG = {
  apiKey: '...',
  authDomain: '...firebaseapp.com',
  projectId: '...',
  storageBucket: '...appspot.com',
  messagingSenderId: '...',
  appId: '...'
};
```

El juego usa autenticación anónima al cargar y, al pulsar START por primera vez, pide un nombre de usuario. Ese nombre se guarda en `users/{uid}`.

## 3. Estructura usada

```text
game/iahn
  mood
  hunger
  energy
  health

users/{uid}
  stars
  roomItems[]
```

Cada usuario tiene su propia habitación. Las estadísticas de Iahn viven en `game/iahn` y se escuchan en tiempo real.

## 4. Reglas iniciales para prototipo

Consulta `firebase-rules.txt`. Son adecuadas para un prototipo con usuarios anónimos; antes de publicar conviene endurecer las reglas para impedir que un cliente pueda modificar libremente las estrellas o las estadísticas.
