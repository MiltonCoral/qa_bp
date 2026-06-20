/// <reference types="cypress" />

/**
 * ============================================================================
 * PRUEBAS DE API REST - DEMOBLAZE.COM
 * ============================================================================
 * 
 * Endpoints probados:
 *   • POST /signup  → Registro de usuarios
 *   • POST /login   → Autenticación de usuarios
 * 
 * Casos de prueba:
 *   1. Crear un nuevo usuario en signup
 *   2. Intentar crear un usuario ya existente
 *   3. Usuario y password correcto en login
 *   4. Usuario y password incorrecto en login
 * ============================================================================
 */

describe('Demoblaze API - Pruebas de Servicios REST', () => {

  // ================================================================
  // CONFIGURACIÓN
  // ================================================================
  const BASE_URL = 'https://api.demoblaze.com';
  const SIGNUP_ENDPOINT = '/signup';
  const LOGIN_ENDPOINT = '/login';

  // Generar username único con timestamp para evitar conflictos
  const timestamp = Date.now();
  const NEW_USERNAME = `testuser_${timestamp}`;
  const NEW_PASSWORD = 'TestPass123!';

  // Usuario que crearemos primero para usar en pruebas de duplicado
  const EXISTING_USERNAME = `existinguser_${timestamp}`;
  const EXISTING_PASSWORD = 'ExistingPass123!';

  // ================================================================
  // BEFORE: Preparar el entorno antes de todos los tests
  // ================================================================
  before(() => {
    cy.log('🔧 Preparando entorno de pruebas...');

    // Crear un usuario "existente" que usaremos en las pruebas
    cy.request({
      method: 'POST',
      url: `${BASE_URL}${SIGNUP_ENDPOINT}`,
      body: {
        username: EXISTING_USERNAME,
        password: EXISTING_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.log(`✅ Usuario de preparación creado: ${EXISTING_USERNAME}`);
      cy.log(`   Respuesta: ${JSON.stringify(response.body)}`);
    });
  });

  // ================================================================
  // CASO 1: CREAR UN NUEVO USUARIO EN SIGNUP
  // ================================================================
  describe('📋 CASO 1: Crear un nuevo usuario (Signup)', () => {

    it('Debe crear exitosamente un nuevo usuario con datos válidos', () => {
      // ENTRADA: Datos de un usuario nuevo
      const requestBody = {
        username: NEW_USERNAME,
        password: NEW_PASSWORD
      };

      cy.log('═══════════════════════════════════════════════════════');
      cy.log('📤 REQUEST - Signup (Nuevo Usuario)');
      cy.log(`   URL: ${BASE_URL}${SIGNUP_ENDPOINT}`);
      cy.log(`   Method: POST`);
      cy.log(`   Headers: Content-Type: application/json`);
      cy.log(`   Body: ${JSON.stringify(requestBody)}`);
      cy.log('═══════════════════════════════════════════════════════');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}${SIGNUP_ENDPOINT}`,
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        // CAPTURAR SALIDA
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📥 RESPONSE - Signup (Nuevo Usuario)');
        cy.log(`   Status Code: ${response.status}`);
        cy.log(`   Response Time: ${response.duration}ms`);
        cy.log(`   Body: ${JSON.stringify(response.body)}`);
        cy.log('═══════════════════════════════════════════════════════');

        // ASSERTIONS (Verificaciones)
        expect(response.status).to.eq(200);                    // Status 200
        expect(response.body).to.eq('');                        // Body vacío = éxito
        expect(response.duration).to.be.lessThan(5000);       // < 5 segundos

        // Guardar usuario para uso posterior
        cy.wrap({ username: NEW_USERNAME, password: NEW_PASSWORD }).as('createdUser');
      });
    });

    it('Debe verificar que el usuario creado puede hacer login', () => {
      const requestBody = {
        username: NEW_USERNAME,
        password: NEW_PASSWORD
      };

      cy.log('📤 Verificando login con usuario recién creado...');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}${LOGIN_ENDPOINT}`,
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📥 RESPONSE - Login (Verificación usuario nuevo)');
        cy.log(`   Status Code: ${response.status}`);
        cy.log(`   Body: ${JSON.stringify(response.body)}`);
        cy.log('═══════════════════════════════════════════════════════');

        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('Auth_token');   // Debe tener token
        expect(response.body.Auth_token).to.be.a('string').and.not.be.empty;
      });
    });
  });

  // ================================================================
  // CASO 2: INTENTAR CREAR UN USUARIO YA EXISTENTE
  // ================================================================
  describe('📋 CASO 2: Intentar crear un usuario ya existente (Signup)', () => {

    it('Debe rechazar la creación de un usuario duplicado', () => {
      // ENTRADA: Usuario que YA EXISTE (creado en el before)
      const requestBody = {
        username: EXISTING_USERNAME,
        password: EXISTING_PASSWORD
      };

      cy.log('═══════════════════════════════════════════════════════');
      cy.log('📤 REQUEST - Signup (Usuario Existente)');
      cy.log(`   URL: ${BASE_URL}${SIGNUP_ENDPOINT}`);
      cy.log(`   Method: POST`);
      cy.log(`   Body: ${JSON.stringify(requestBody)}`);
      cy.log('═══════════════════════════════════════════════════════');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}${SIGNUP_ENDPOINT}`,
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        // CAPTURAR SALIDA
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📥 RESPONSE - Signup (Usuario Existente)');
        cy.log(`   Status Code: ${response.status}`);
        cy.log(`   Response Time: ${response.duration}ms`);
        cy.log(`   Body: ${JSON.stringify(response.body)}`);
        cy.log('═══════════════════════════════════════════════════════');

        // ASSERTIONS
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('errorMessage');
        expect(response.body.errorMessage).to.eq('This user already exist.');
        expect(response.body).to.not.have.property('Auth_token');
        expect(response.duration).to.be.lessThan(5000);
      });
    });
  });

  // ================================================================
  // CASO 3: USUARIO Y PASSWORD CORRECTO EN LOGIN
  // ================================================================
  describe('📋 CASO 3: Login con credenciales correctas', () => {

    it('Debe autenticar exitosamente con usuario y password válidos', () => {
      // ENTRADA: Credenciales correctas
      const requestBody = {
        username: EXISTING_USERNAME,
        password: EXISTING_PASSWORD
      };

      cy.log('═══════════════════════════════════════════════════════');
      cy.log('📤 REQUEST - Login (Credenciales Correctas)');
      cy.log(`   URL: ${BASE_URL}${LOGIN_ENDPOINT}`);
      cy.log(`   Method: POST`);
      cy.log(`   Body: ${JSON.stringify(requestBody)}`);
      cy.log('═══════════════════════════════════════════════════════');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}${LOGIN_ENDPOINT}`,
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        // CAPTURAR SALIDA
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📥 RESPONSE - Login (Credenciales Correctas)');
        cy.log(`   Status Code: ${response.status}`);
        cy.log(`   Response Time: ${response.duration}ms`);
        cy.log(`   Body: ${JSON.stringify(response.body)}`);
        cy.log('═══════════════════════════════════════════════════════');

        // ASSERTIONS
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('Auth_token');
        expect(response.body.Auth_token).to.be.a('string').and.not.be.empty;
        expect(response.body.Auth_token).to.have.length.greaterThan(10);
        expect(response.body).to.not.have.property('errorMessage');
        expect(response.duration).to.be.lessThan(5000);

        // Guardar token para uso futuro
        cy.wrap(response.body.Auth_token).as('authToken');
      });
    });
  });

  // ================================================================
  // CASO 4: USUARIO Y PASSWORD INCORRECTO EN LOGIN
  // ================================================================
  describe('📋 CASO 4: Login con credenciales incorrectas', () => {

    it('Debe rechazar login con password incorrecto', () => {
      // ENTRADA: Usuario existe pero password es incorrecto
      const requestBody = {
        username: EXISTING_USERNAME,
        password: 'WrongPassword123!'
      };

      cy.log('═══════════════════════════════════════════════════════');
      cy.log('📤 REQUEST - Login (Password Incorrecto)');
      cy.log(`   URL: ${BASE_URL}${LOGIN_ENDPOINT}`);
      cy.log(`   Method: POST`);
      cy.log(`   Body: ${JSON.stringify(requestBody)}`);
      cy.log('═══════════════════════════════════════════════════════');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}${LOGIN_ENDPOINT}`,
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        // CAPTURAR SALIDA
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📥 RESPONSE - Login (Password Incorrecto)');
        cy.log(`   Status Code: ${response.status}`);
        cy.log(`   Response Time: ${response.duration}ms`);
        cy.log(`   Body: ${JSON.stringify(response.body)}`);
        cy.log('═══════════════════════════════════════════════════════');

        // ASSERTIONS
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('errorMessage');
        expect(response.body.errorMessage).to.eq('Wrong password.');
        expect(response.body).to.not.have.property('Auth_token');
        expect(response.duration).to.be.lessThan(5000);
      });
    });

    it('Debe rechazar login con usuario inexistente', () => {
      // ENTRADA: Usuario que NO EXISTE en el sistema
      const requestBody = {
        username: 'nonexistentuser_99999',
        password: 'SomePassword123!'
      };

      cy.log('═══════════════════════════════════════════════════════');
      cy.log('📤 REQUEST - Login (Usuario Inexistente)');
      cy.log(`   URL: ${BASE_URL}${LOGIN_ENDPOINT}`);
      cy.log(`   Method: POST`);
      cy.log(`   Body: ${JSON.stringify(requestBody)}`);
      cy.log('═══════════════════════════════════════════════════════');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}${LOGIN_ENDPOINT}`,
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        // CAPTURAR SALIDA
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📥 RESPONSE - Login (Usuario Inexistente)');
        cy.log(`   Status Code: ${response.status}`);
        cy.log(`   Response Time: ${response.duration}ms`);
        cy.log(`   Body: ${JSON.stringify(response.body)}`);
        cy.log('═══════════════════════════════════════════════════════');

        // ASSERTIONS
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('errorMessage');
        expect(response.body.errorMessage).to.eq('User does not exist.');
        expect(response.body).to.not.have.property('Auth_token');
        expect(response.duration).to.be.lessThan(5000);
      });
    });
  });

  // ================================================================
  // RESUMEN FINAL
  // ================================================================
  describe('📊 Resumen de Resultados', () => {
    it('Resumen de todas las pruebas ejecutadas', () => {
      cy.log('╔═══════════════════════════════════════════════════════╗');
      cy.log('║         RESUMEN DE PRUEBAS DE API DEMOBLAZE           ║');
      cy.log('╠═══════════════════════════════════════════════════════╣');
      cy.log('║  ✅ CASO 1: Crear nuevo usuario (Signup)              ║');
      cy.log('║     → Entrada: {username, password} válidos           ║');
      cy.log('║     → Salida: Status 200, body vacío                  ║');
      cy.log('║                                                        ║');
      cy.log('║  ✅ CASO 2: Usuario ya existente (Signup)             ║');
      cy.log('║     → Entrada: {username, password} existentes        ║');
      cy.log('║     → Salida: Status 200, errorMessage: ya existe     ║');
      cy.log('║                                                        ║');
      cy.log('║  ✅ CASO 3: Login correcto                            ║');
      cy.log('║     → Entrada: {username, password} correctos          ║');
      cy.log('║     → Salida: Status 200, Auth_token generado         ║');
      cy.log('║                                                        ║');
      cy.log('║  ✅ CASO 4: Login incorrecto                          ║');
      cy.log('║     → Entrada: {username, password} incorrectos        ║');
      cy.log('║     → Salida: Status 200, errorMessage de error       ║');
      cy.log('╚═══════════════════════════════════════════════════════╝');
    });
  });
});
