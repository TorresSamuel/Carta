# Sincronizacion automatica con Netlify

Esta carpeta ya esta preparada para que Netlify publique la web desde:

`pagina sm foods`

El archivo `netlify.toml` de la raiz del repositorio apunta a esta carpeta como carpeta publicada.

## Como usarlo

1. Abre `INICIAR_SYNC_NETLIFY.bat`.
2. Deja esa ventana abierta mientras trabajas.
3. Cada vez que guardes cambios en esta carpeta, el script espera unos segundos, hace commit y sube a GitHub.
4. Si Netlify esta conectado al repositorio `TorresSamuel/Carta` en la rama `main`, el deploy se inicia automaticamente.

## Importante

- Para que funcione, esta PC debe tener permiso de `git push` al repo.
- Si trabajas desde otra cuenta o computador, tambien debe subir cambios al mismo repo/rama.
- Si cierras la ventana del sincronizador, los cambios se quedan locales hasta que vuelvas a abrirlo o hagas push manual.
