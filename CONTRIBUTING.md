# Guía de Colaboración

## Flujo de trabajo

Este equipo usa **GitHub Flow** — un modelo simple para colaborar sin conflictos.

### Regla de oro: Nunca trabajar directamente en `main`

Cada cambio va en una rama separada y se integra vía Pull Request (PR).

### Paso a paso

1. **Actualizar tu rama main local**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Crear una rama para tu cambio**
   ```bash
   git checkout -b feature/nombre-descriptivo
   ```
   Ejemplos: `feature/login-page`, `fix/validacion-formulario`, `config/ci-pipeline`

3. **Trabajar y hacer commits**
   ```bash
   git add .
   git commit -m "feat: descripción corta del cambio"
   ```

4. **Subir tu rama a GitHub**
   ```bash
   git push -u origin feature/nombre-descriptivo
   ```

5. **Crear un Pull Request en GitHub**
   - Ve a tu repositorio en GitHub
   - Aparecerá un botón "Compare & pull request"
   - Llena el template y asigna a un compañero como reviewer

6. **Review y merge**
   - Un compañero revisa y aprueba
   - Se hace merge a `main`
   - Eliminar la rama después del merge

## Convención de ramas

| Prefijo | Uso |
|---------|-----|
| `feature/` | Nueva funcionalidad |
| `fix/` | Corrección de errores |
| `config/` | Configuración, CI/CD, infra |
| `docs/` | Solo documentación |

## Convención de commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar página de login
fix: corregir validación de email
docs: actualizar README con instrucciones de setup
config: agregar GitHub Actions para lint
```

## Configuración inicial (cada miembro del equipo)

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <nombre-del-repo>
```

### 2. Configurar token de JFrog (obligatorio para instalar dependencias)

**Windows (PowerShell):**
```powershell
[System.Environment]::SetEnvironmentVariable("JFROG_AUTH_TOKEN", "TU_TOKEN", "User")
```

**Windows (CMD) — sesión actual:**
```cmd
set JFROG_AUTH_TOKEN=TU_TOKEN
```

**Mac/Linux:**
```bash
echo 'export JFROG_AUTH_TOKEN="TU_TOKEN"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Instalar dependencias

```bash
npm install
```

## Resolución de conflictos

Si al hacer pull hay conflictos:

1. Git te indicará qué archivos tienen conflicto
2. Abre esos archivos y busca las marcas `<<<<<<<`, `=======`, `>>>>>>>`
3. Decide qué código mantener
4. Haz commit del archivo resuelto

En caso de duda, habla con el compañero que hizo el otro cambio.
