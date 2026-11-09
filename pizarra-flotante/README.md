# Pizarra Flotante

Pizarra transparente para anotar sobre la pantalla (Windows 11). Prototipo v0.1 con Electron.

## Ejecutar
```
npm install
npm start
```

## Atajos
| Atajo | Acción |
|---|---|
| Ctrl+Shift+D | Alternar modo dibujo / pasar clics |
| Ctrl+Shift+X | Limpiar todo |
| Ctrl+Shift+Q | Cerrar la app |
| Ctrl+Z | Deshacer (en modo dibujo) |
| 1–6 | Color |
| + / - | Grosor |

## Instalador
Sube un tag (`git tag v0.1.0 && git push --tags`) y GitHub Actions generará el .exe en Releases.

## Estructura
- `src/main/` proceso principal (ventana, atajos globales)
- `src/renderer/` interfaz y canvas de dibujo
- `.github/workflows/` build del instalador
