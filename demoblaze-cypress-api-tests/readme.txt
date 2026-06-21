================================================================================
                    PRUEBAS DE API REST - DEMOBLAZE.COM
                         Proyecto Cypress.io
================================================================================

DESCRIPCIÓN
-----------
Este proyecto contiene pruebas automatizadas de API REST para los servicios de
registro (signup) y autenticación (login) de la página demoblaze.com.

Endpoints probados:
  • POST https://api.demoblaze.com/signup
  • POST https://api.demoblaze.com/login

Casos de prueba:
  1. Crear un nuevo usuario en signup
  2. Intentar crear un usuario ya existente
  3. Usuario y password correcto en login
  4. Usuario y password incorrecto en login

================================================================================
REQUISITOS PREVIOS
================================================================================

1. Node.js (versión 16 o superior)
   Descargar desde: https://nodejs.org/

2. npm (viene incluido con Node.js)

3. Navegador web (Chrome, Firefox, Edge, etc.)

================================================================================
INSTALACIÓN
================================================================================

Paso 1: Descomprimir el archivo del proyecto
-------------------------------------------
Descomprimir el archivo .zip o .rar en una carpeta de su preferencia.

Paso 2: Abrir una terminal
---------------------------
Abrir una terminal y navegar hasta la carpeta del proyecto:

    cd demoblaze-cypress-api-tests

Paso 3: Instalar dependencias
------------------------------
Ejecutar:

    npm install

Este comando instalará Cypress (versión 13.x) y todas las dependencias.

================================================================================
EJECUCIÓN DE LAS PRUEBAS
================================================================================

OPCIÓN A: Modo Interactivo (Cypress Test Runner)
------------------------------------------------
    npm run cy:open

Luego:
  1. Seleccionar "E2E Testing"
  2. Elegir el navegador (Chrome recomendado)
  3. Hacer clic en "demoblaze-api.cy.js"
  4. Ver los tests ejecutarse con logs detallados

OPCIÓN B: Modo Headless (Línea de comandos)
-------------------------------------------
    npm run cy:run

O simplemente:

    npm test

================================================================================
ESTRUCTURA DEL PROYECTO
================================================================================

demoblaze-cypress-api-tests/
│
├── cypress.config.js              ← Configuración de Cypress
├── package.json                   ← Dependencias y scripts
│
├── cypress/
│   ├── e2e/
│   │   └── demoblaze-api.cy.js   ← Tests principales (4 casos)
│   │  
│   ├── fixtures/
│   │   └── testData.json         ← Datos de prueba
│   ├── support/
│   │   ├── commands.js           ← Comandos personalizados
│   │   └── e2e.js                ← Configuración de soporte
│   ├── screenshots/              ← Capturas (auto)
│   └── videos/                   ← Videos (auto)
│
├── reports/                      ← Reportes generados (auto)
├── readme.txt                    ← Este archivo
└── conclusiones.txt             ← Hallazgos y conclusiones

================================================================================
EJEMPLO DE LOS CASOS DE PRUEBA
================================================================================

CASO 1: Crear un nuevo usuario (Signup)
---------------------------------------
  Entrada:
    POST /signup
    Body: {"username": "testuser_1234567890", "password": "TestPass123!"}
    Headers: Content-Type: application/json

  Salida esperada:
    Status: 200 OK
    Body: "" (string vacío)
    Tiempo: < 5000ms

CASO 2: Intentar crear usuario ya existente (Signup)
----------------------------------------------------
  Entrada:
    POST /signup
    Body: {"username": "existinguser_1234567890", "password": "ExistingPass123!"}

  Salida esperada:
    Status: 200 OK
    Body: {"errorMessage": "This user already exist."}

CASO 3: Login con credenciales correctas
-----------------------------------------
  Entrada:
    POST /login
    Body: {"username": "existinguser_1234567890", "password": "ExistingPass123!"}

  Salida esperada:
    Status: 200 OK
    Body: {"Auth_token": "token_de_autenticacion"}

CASO 4: Login con credenciales incorrectas
------------------------------------------
  Entrada:
    POST /login
    Body: {"username": "existinguser_1234567890", "password": "WrongPassword123!"}

  Salida esperada:
    Status: 200 OK
    Body: {"errorMessage": "Wrong password."}

  Variante - Usuario inexistente:
    Body: {"username": "nonexistentuser_99999", "password": "SomePassword123!"}
    Salida esperada: {"errorMessage": "User does not exist."}

================================================================================
NOTAS IMPORTANTES
================================================================================

1. La API de demoblaze.com devuelve siempre status code 200, incluso para
   errores de negocio. Los errores se identifican por el campo "errorMessage"
   en el body de la respuesta.

2. Los usernames se generan con un timestamp para evitar conflictos entre
   ejecuciones de prueba.

3. El token de autenticación (Auth_token) se genera únicamente en login exitoso.

4. Las pruebas incluyen validaciones de:
   - Status code HTTP
   - Estructura del body de respuesta
   - Mensajes de error específicos
   - Tiempo de respuesta (< 5000ms)
   - Ausencia/presencia de propiedades esperadas

================================================================================
SOLUCIÓN DE PROBLEMAS
================================================================================

Problema: "cypress: command not found"
Solución: Ejecutar "npm install" para instalar las dependencias.

Problema: "Error de conexión a api.demoblaze.com"
Solución: Verificar conexión a internet. La API debe estar accesible.

Problema: "Tests fallan intermitentemente"
Solución: La API de demoblaze puede tener latencia. Aumentar el timeout en
cypress.config.js si es necesario.