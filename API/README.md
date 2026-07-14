# 🔐 API de Login con FastAPI y SQL Server

Sistema de autenticación seguro con JWT, contraseñas hasheadas con bcrypt y base de datos SQL Server.

---

## 📋 Requisitos Previos

Antes de activar la API, asegúrate de tener:

### 1. **Base de Datos SQL Server**

- SQL Server instalado y ejecutándose
- Base de datos `DB_LOGIN_EXAMPLE` creada
- Las tablas creadas (ver `SQL.SQL`)

### 2. **Dependencias Python**

```bash
pip install fastapi uvicorn sqlalchemy pyodbc passlib python-jose bcrypt python-multipart
```

O usa `uv`:

```bash
uv pip install fastapi uvicorn sqlalchemy pyodbc passlib python-jose bcrypt python-multipart
```

### 3. **Credenciales en database.py**

Verifica que las credenciales de SQL Server sean correctas:

```python
DATABASE_USER = "YOUR_DB_USER"
DATABASE_PASSWORD = "YOUR_DB_PASSWORD"
DATABASE_SERVER = "localhost"
DATABASE_NAME = "DB_LOGIN_EXAMPLE"
```

---

## 🚀 Activar la API

### Paso 1: Insertar datos de prueba (Opcional)

```bash
cd API
python insert_data.py
```

Esto insertará 4 usuarios de ejemplo con contraseñas hasheadas.

### Paso 2: Iniciar el servidor

```bash
python -m uvicorn main:app --reload
```

La API estará disponible en: **http://127.0.0.1:8000**

## 📡 Rutas Disponibles

### 1. **POST `/register`** - Registro de nuevos usuarios

Registra un usuario con contraseña hasheada.

**Headers:**

```json
Content-Type: application/json
```

**Body:**

```json
{
  "username": "juan_perez",
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**Respuestas:**

- ✅ **201 Created** - Usuario registrado exitosamente

```json
{
  "username": "juan_perez",
  "email": "juan@example.com",
  "disabled": false
}
```

- ❌ **400 Bad Request** - Usuario o email ya existe

```json
{
  "detail": "El nombre de usuario ya está registrado."
}
```

---

### 2. **POST `/token`** - Login / Obtener JWT

Genera un token JWT para acceder a endpoints protegidos.

**Headers:**

```
Content-Type: application/x-www-form-urlencoded
```

**Body:**

```
username=juan_perez&password=Password123!
```

**Respuesta:**

- ✅ **200 OK** - Login exitoso

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

- ❌ **401 Unauthorized** - Credenciales inválidas

```json
{
  "detail": "Usuario o contraseña incorrectos"
}
```

---

### 3. **GET `/users/me`** - Obtener datos del usuario autenticado

Endpoint protegido que requiere un token válido.

**Headers:**

```
Authorization: Bearer <tu_token_aqui>
```

**Respuesta:**

- ✅ **200 OK** - Datos del usuario

```json
{
  "username": "juan_perez",
  "email": "juan@example.com",
  "disabled": false
}
```

- ❌ **401 Unauthorized** - Token inválido o expirado

---

## 🧪 Pruebas Automatizadas

### Ejecutar pruebas con pytest

```bash
pip install pytest requests
cd API
pytest test_api.py -v
```

### Ejecutar pruebas manualmente

```bash
python test_api.py
```

### Pruebas incluidas:

- ✅ Registro exitoso
- ✅ Validación de usuario duplicado
- ✅ Validación de email duplicado
- ✅ Validación de datos incompletos
- ✅ Login exitoso
- ✅ Login con contraseña incorrecta
- ✅ Login con usuario inexistente
- ✅ Rechazo de acceso sin token
- ✅ Rechazo de token inválido
- ✅ Acceso con token válido

---

## 🔒 Seguridad Implementada

### 1. **Contraseñas Hasheadas**

- Algoritmo: **bcrypt**
- Salt rounds: 12
- Las contraseñas nunca se almacenan en texto plano

### 2. **Tokens JWT**

- Algoritmo: **HS256**
- Expiramiento: 30 minutos
- Secret key: Configurable en `main.py`

### 3. **Validaciones**

- Usernames únicos (Llave Primaria)
- Emails únicos
- Contraseña máximo 72 bytes (limitación de bcrypt)

---

## 📝 Ejemplos con cURL

### Registro

```bash
curl -X POST "http://127.0.0.1:8000/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Login

```bash
curl -X POST "http://127.0.0.1:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test_user&password=TestPass123!"
```

### Acceso protegido

```bash
curl -X GET "http://127.0.0.1:8000/users/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🛠️ Estructura del Proyecto

```
API_LOGIN_EXAMPLE/
│
├── API/
│   ├── main.py              # Endpoints y lógica de la API
│   ├── database.py          # Configuración de SQL Server y modelos
│   ├── insert_data.py       # Script para insertar datos de prueba
│   ├── test_api.py          # Suite de pruebas automatizadas
│   └── SQL.SQL              # Scripts de creación de tablas
│
└── README.md                # Este archivo
```

---

## ⚠️ Solución de Problemas

### Error: "ModuleNotFoundError: No module named 'fastapi'"

```bash
pip install fastapi uvicorn sqlalchemy pyodbc passlib python-jose bcrypt python-multipart
```

### Error: "ModuleNotFoundError: No module named 'API'"

Asegúrate de ejecutar los comandos desde dentro de la carpeta `API`:

```bash
cd API
python -m uvicorn main:app --reload
```

### Error: "Connection to database failed"

- Verifica que SQL Server está ejecutándose
- Comprueba las credenciales en `database.py`
- Verifica que la base de datos `DB_LOGIN_EXAMPLE` existe
- Ejecuta el script `SQL.SQL` para crear las tablas

### Error: "password cannot be longer than 72 bytes"

Las contraseñas se truncan automáticamente a 72 bytes (limitación de bcrypt).

---

## 📚 Tecnologías Utilizadas

- **FastAPI** - Framework web moderno
- **SQLAlchemy** - ORM para SQL Server
- **PyODBC** - Driver de conexión a SQL Server
- **Passlib/Bcrypt** - Hashing seguro de contraseñas
- **PyJWT** - Generación y validación de tokens JWT
- **Pytest** - Framework de testing

---

## 📧 Notas Adicionales

- Los tokens expiran después de 30 minutos (configurable)
- El script `insert_data.py` hashea automáticamente todas las contraseñas
- La API crea las tablas automáticamente si no existen
- Usa HTTPS en producción

---

**Última actualización:** 2026-07-14
