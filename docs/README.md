# LearnHub Dashboard - GitHub Pages

Este dashboard estático muestra el análisis completo de los datos de LearnHub.

## 🚀 Generar el Dashboard

Ejecuta el script para generar el dashboard con datos actualizados:

```bash
npm run dashboard
```

O directamente:

```bash
node generar_dashboard.js
```

El script:
1. Se conecta a MongoDB Atlas
2. Recopila todos los datos de agregaciones
3. Genera un archivo HTML estático en `docs/index.html`

## 📊 Desplegar en GitHub Pages

1. **Genera el dashboard**:
   ```bash
   npm run dashboard
   ```

2. **Commit y push a GitHub**:
   ```bash
   git add docs/index.html
   git commit -m "Actualizar dashboard"
   git push
   ```

3. **Configura GitHub Pages**:
   - Ve a Settings → Pages en tu repositorio
   - Selecciona la rama `main` (o `master`)
   - Selecciona la carpeta `/docs`
   - Guarda los cambios

4. **Accede al dashboard**:
   - Tu dashboard estará disponible en: `https://TU_USUARIO.github.io/NOMBRE_REPO/`

## 📁 Estructura

```
docs/
└── index.html    # Dashboard HTML estático generado
```

El archivo `index.html` es completamente estático y no requiere servidor, perfecto para GitHub Pages.

