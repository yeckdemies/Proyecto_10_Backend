# Proyecto_10_Backend

## Descripción
Este proyecto contiene el backend desarrollado con **Node.js** y **Express** para la plataforma **PetAdopt**, una aplicación que permite gestionar adopciones de mascotas. Proporciona una **API REST** segura y sencilla para gestionar usuarios, mascotas y procesos relacionados con las adopciones.

## Backend desplegado en Render

## Características Principales

- Autenticación JWT
- Gestión de usuarios (registro, login, roles)
- CRUD completo para usuarios, mascotas y adopciones
- Middleware de seguridad basado en tokens JWT
- Organización modular del código (routes, controllers, models)
- Base de datos MongoDB con Mongoose

## Tecnología

- **Node.js**
- **Express.js**
- **MongoDB** (con Mongoose)
- **JWT** (Autenticación y seguridad)
- **dotenv** (variables de entorno)
- **bcryptjs** (hashing de contraseñas)
- **cloudinary**

## Instalación y Configuración

### 1. Clona el repositorio:
```bash
git clone https://github.com/yeckdemies/Proyecto_10_Backend.git
```

### 2. Entra al directorio del proyecto:
```bash
cd Proyecto_10_Backend
```

### Usuarios para pruebas

| Usuario | Contraseña | Rol   |
|---------|------------|-------|
| admin   | admin      | Admin |
| user    | user       | User  |
