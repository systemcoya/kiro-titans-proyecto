# 🏦 Proyecto Colaborativo — Kiro Titans

Repositorio base para el equipo de 4 personas. Evento de Seguros Bolívar.

## 🚀 Inicio Rápido (para cada miembro del equipo)

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <nombre-del-repo>
```

### 2. Configurar token de JFrog (obligatorio)

Este proyecto usa el registro privado de Seguros Bolívar. Necesitas tu token personal.

**Windows (PowerShell) — persistente:**
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

## 📋 Flujo de trabajo

Usamos **GitHub Flow**. Regla principal: **nunca trabajar directamente en `main`**.

1. Crear rama → `git checkout -b feature/mi-cambio`
2. Trabajar y hacer commits
3. Subir → `git push -u origin feature/mi-cambio`
4. Crear Pull Request en GitHub
5. Un compañero revisa y aprueba
6. Merge a main

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para detalles completos.

## 🛠 Tech Stack

Definido en los steering rules del proyecto:
- **Frontend:** Angular o React
- **Backend:** Spring Boot, FastAPI, o Express/Fastify
- **Base de datos:** PostgreSQL 15+
- **Dependencias:** Solo desde JFrog, versiones pinned

## 📁 Estructura del proyecto

```
├── .github/            # PR templates
├── .kiro/steering/     # Reglas del agente IA
├── docs/               # Documentación del proyecto
├── src/                # Código fuente (cuando se defina el proyecto)
├── CHANGELOG.md        # Registro de cambios
├── CONTRIBUTING.md     # Guía de colaboración
└── package.json        # Dependencias
```

## 👥 Equipo

4 integrantes con acceso al repositorio. Todos trabajan en ramas y hacen PR.
