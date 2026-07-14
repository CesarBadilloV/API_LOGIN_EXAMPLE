-- 1. Crear la base de datos (omite este paso si ya la tienes creada)
CREATE DATABASE DB_LOGIN_EXAMPLE;
GO

-- 2. Asegurarnos de usar la base de datos correcta
USE DB_LOGIN_EXAMPLE;
GO

-- 3. Crear la tabla de usuarios con las restricciones de seguridad
CREATE TABLE usuarios (
    username NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    hashed_password NVARCHAR(255) NOT NULL,
    disabled BIT NOT NULL DEFAULT 0,
    
    -- Definir la llave primaria
    CONSTRAINT PK_usuarios PRIMARY KEY CLUSTERED (username),
    -- El correo debe ser único para evitar registros duplicados
    CONSTRAINT UQ_usuarios_email UNIQUE (email)
);
GO

-- 4. Crear índices para acelerar las consultas de autenticación y búsquedas
CREATE NONCLUSTERED INDEX IX_usuarios_username ON usuarios (username);
CREATE NONCLUSTERED INDEX IX_usuarios_email ON usuarios (email);
GO