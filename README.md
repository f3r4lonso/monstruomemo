# Monstruomemo

Prototipo web en español de un juego de memoria para tabletas. Ejecutá `npm start` y abrí `http://localhost:4200/`. El juego no necesita una cuenta ni una API externa. La Pokédex original sigue disponible en `/pokemon-listing`.

- En el menú inicial podés elegir **Español** o **English**. Cada carta dice una frase al darla vuelta para ayudarte a recordarla.
- Hay tres niveles de Tierra y tres de Espacio. Cada nivel tiene 20 cartas: nueve parejas y dos poderes. Después del nivel 3 también se desbloquea el **Súper Memotest**: 18 parejas y cuatro poderes (40 cartas). El navegador guarda los niveles desbloqueados.
- Si las cartas no coinciden, perdés **1/2**, **1/3** o **2/3** vidas (un monstruo/dos monstruos), según la dificultad del nivel. Esa curva se repite en el espacio; el Súper usa la dificultad más alta. Dos objetos no hacen daño.
- Tierra: la poción repone las 10 vidas apenas se encuentra. La vidente desaparece y deja una carta visible hasta que se encuentra su pareja. Si la elegís segunda, anula la primera carta sin daño.
- Espacio: el escudo bloquea un ataque completo y el satélite muestra temporalmente los monstruos ocultos. No hay poción ni vidente.
- Súper Memotest: poción, escudo, vidente y Abracadabra. Abracadabra hace desaparecer un monstruo al azar junto con su carta pareja, y cuenta como pareja resuelta.

Los 20 prompts originales de animación para Stable Diffusion están en [`card-animation-prompts.json`](card-animation-prompts.json).

Esta versión es web. Para venderla en App Store y Google Play todavía hay que empaquetar las apps para iOS y Android, probarlas en dispositivos reales y completar las fichas, la clasificación por edad y la revisión de cada tienda. El precio objetivo es de aproximadamente US$1.

### Poner tus propios sonidos

1. Guardá los archivos en `src/assets/audio/memo/`.
2. En [`memo-sound-slots.ts`](src/app/features/memo/memo-sound-slots.ts), reemplazá el `null` del evento por la ruta, por ejemplo `heal: 'assets/audio/memo/mi-pocion.mp3'`.
3. Probá en la tableta. Si el slot queda vacío o el archivo no se puede reproducir, el juego usa un sonido generado. El botón de altavoz permite silenciar todos los efectos.

Los slots son `flip` (dar vuelta), `match` (pareja), `miss` (dos objetos), `hit` (golpe), `doubleHit` (dos golpes), `heal` (poción), `seer` (vidente o satélite), `shield` (escudo), `abracadabra` (hechizo), `win` (victoria) y `lose` (derrota).

## Proyecto Angular original

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.0.10.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
