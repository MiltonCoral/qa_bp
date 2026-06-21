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

// ================================================================
// COMANDOS PERSONALIZADOS (se cargan antes de los tests)
// ================================================================
const API_URL = 'https://api.demoblaze.com';

// Codificación base64 con soporte Unicode (igual que b64EncodeUnicode del dashboard)
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode('0x' + p1);
  }));
}

// Petición POST genérica a la API
Cypress.Commands.add('apiPost', (endpoint, body) => {
  return cy.request({
    method: 'POST',
    url: `${API_URL}${endpoint}`,
    body: body,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    failOnStatusCode: false
  });
});

// Comando para registrar un usuario (signup) - codifica password igual que el dashboard
Cypress.Commands.add('signupUser', (username, password) => {
  const encodedPassword = b64EncodeUnicode(password);
  return cy.apiPost('/signup', { username, password: encodedPassword });
});

// Comando para hacer login - codifica password y guarda cookie tokenp_ igual que el dashboard
Cypress.Commands.add('loginUser', (username, password) => {
  const encodedPassword = b64EncodeUnicode(password);
  return cy.apiPost('/login', { username, password: encodedPassword }).then((response) => {
    // El dashboard guarda el token como string "Auth_token: <token>"
    if (response.status === 200 && typeof response.body === 'string' && response.body.includes('Auth_token:')) {
      const token = response.body.replace('Auth_token: ', '');
      cy.setCookie('tokenp_', token);
    }
    return cy.wrap(response);
  });
});

// Comando para verificar token
Cypress.Commands.add('checkToken', (token) => {
  return cy.apiPost('/check', { token });
});

// ================================================================
// TESTS
// ================================================================
describe('Demoblaze API - Pruebas de Servicios REST', () => {

  const timestamp = Date.now();
  const NEW_USERNAME = `miltoncoral_${timestamp}`;
  const NEW_PASSWORD = 'miltontest';

  const EXISTING_USERNAME = `miltoncoralexistente_${timestamp}`;
  const EXISTING_PASSWORD = 'miltontest';

  // ================================================================
  // BEFORE: Preparar el entorno antes de todos los tests
  // ================================================================
  before(() => {
    cy.log('🔧 Preparando entorno de pruebas...');

    // Crear un usuario "existente" usando el comando personalizado (con codificación correcta)
    cy.signupUser(EXISTING_USERNAME, EXISTING_PASSWORD).then((response) => {
      cy.log(`✅ Usuario de preparación creado: ${EXISTING_USERNAME}`);
      cy.log(`   Respuesta: ${JSON.stringify(response.body)}`);
    });
  });

  // ================================================================
  // CASO 1: CREAR UN NUEVO USUARIO EN SIGNUP
  // ================================================================
  describe('📋 CASO 1: Crear un nuevo usuario (Signup)', () => {

    it('Debe crear exitosamente un nuevo usuario con datos válidos', () => {
      cy.log('═══════════════════════════════════════════════════════');
      cy.log('📤 REQUEST - Signup (Nuevo Usuario)');
      cy.log(`   Username: ${NEW_USERNAME}`);
      cy.log(`   Password: ${NEW_PASSWORD} (codificado con b64EncodeUnicode)`);
      cy.log('═══════════════════════════════════════════════════════');

      // Usar comando personalizado que codifica la contraseña igual que el dashboard
      cy.signupUser(NEW_USERNAME, NEW_PASSWORD).then((response) => {
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📥 RESPONSE - Signup (Nuevo Usuario)');
        cy.log(`   Status Code: ${response.status}`);
        cy.log(`   Response Time: ${response.duration}ms`);
        cy.log(`   Body: ${JSON.stringify(response.body)}`);
        cy.log('═══════════════════════════════════════════════════════');

        // ASSERTIONS
        expect(response.status).to.eq(200);
        // El dashboard recibe body vacío string cuando el signup es exitoso
        expect(response.body).to.eq('');
        expect(response.duration).to.be.lessThan(5000);

        cy.wrap({ username: NEW_USERNAME, password: NEW_PASSWORD }).as('createdUser');
      });
    });

    it('Debe verificar que el usuario creado puede hacer login', () => {
      cy.log('📤 Verificando login con usuario recién creado...');

      // Usar comando personalizado de login (codifica password automáticamente)
      cy.loginUser(NEW_USERNAME, NEW_PASSWORD).then((response) => {
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📥 RESPONSE - Login (Verificación usuario nuevo)');
        cy.log(`   Status Code: ${response.status}`);
        cy.log(`   Body: ${JSON.stringify(response.body)}`);
        cy.log('═══════════════════════════════════════════════════════');

        expect(response.status).to.eq(200);
        // El dashboard recibe "Auth_token: <token>" como string, no como objeto
        expect(response.body).to.be.a('string');
        expect(response.body).to.include('Auth_token:');
        expect(response.body).to.have.length.greaterThan(20);

        // Verificar que la cookie se guardó (como hace el dashboard)
        cy.getCookie('tokenp_').should('exist');
      });
    });
  });

  // ================================================================
  // CASO 2: INTENTAR CREAR UN USUARIO YA EXISTENTE
  // ================================================================
  describe('📋 CASO 2: Intentar crear un usuario ya existente (Signup)', () => {

    it('Debe rechazar la creación de un usuario duplicado', () => {
      cy.log('═══════════════════════════════════════════════════════');
      cy.log('📤 REQUEST - Signup (Usuario Existente)');
      cy.log(`   Username: ${EXISTING_USERNAME}`);
      cy.log(`   Password: ${EXISTING_PASSWORD} (codificado con b64EncodeUnicode)`);
      cy.log('═══════════════════════════════════════════════════════');

      // Usar comando personalizado
      cy.signupUser(EXISTING_USERNAME, EXISTING_PASSWORD).then((response) => {
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
        expect(response.duration).to.be.lessThan(5000);
      });
    });
  });

  // ================================================================
  // CASO 3: USUARIO Y PASSWORD CORRECTO EN LOGIN
  // ================================================================
  describe('📋 CASO 3: Login con credenciales correctas', () => {

    it('Debe autenticar exitosamente con usuario y password válidos', () => {
      cy.log('═══════════════════════════════════════════════════════');
      cy.log('📤 REQUEST - Login (Credenciales Correctas)');
      cy.log(`   Username: ${EXISTING_USERNAME}`);
      cy.log(`   Password: ${EXISTING_PASSWORD} (codificado con b64EncodeUnicode)`);
      cy.log('═══════════════════════════════════════════════════════');

      // Usar comando personalizado de login
      cy.loginUser(EXISTING_USERNAME, EXISTING_PASSWORD).then((response) => {
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📥 RESPONSE - Login (Credenciales Correctas)');
        cy.log(`   Status Code: ${response.status}`);
        cy.log(`   Response Time: ${response.duration}ms`);
        cy.log(`   Body: ${JSON.stringify(response.body)}`);
        cy.log('═══════════════════════════════════════════════════════');

        // ASSERTIONS
        expect(response.status).to.eq(200);
        // El dashboard recibe string "Auth_token: <token>", no objeto JSON
        expect(response.body).to.be.a('string');
        expect(response.body).to.include('Auth_token:');
        expect(response.body).to.have.length.greaterThan(20);
        expect(response.duration).to.be.lessThan(5000);

        // Guardar token para uso futuro
        const token = response.body.replace('Auth_token: ', '');
        cy.wrap(token).as('authToken');

        // Verificar que la cookie se guardó (como hace el dashboard real)
        cy.getCookie('tokenp_').should('exist').its('value').should('eq', token);
      });
    });
  });

  // ================================================================
  // CASO 4: USUARIO Y PASSWORD INCORRECTO EN LOGIN
  // ================================================================
  describe('📋 CASO 4: Login con credenciales incorrectas', () => {

    it('Debe rechazar login con password incorrecto', () => {
      cy.log('═══════════════════════════════════════════════════════');
      cy.log('📤 REQUEST - Login (Password Incorrecto)');
      cy.log(`   Username: ${EXISTING_USERNAME}`);
      cy.log(`   Password: WrongPassword123! (codificado con b64EncodeUnicode)`);
      cy.log('═══════════════════════════════════════════════════════');

      // Usar comando personalizado de login
      cy.loginUser(EXISTING_USERNAME, 'WrongPassword123!').then((response) => {
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
        // No debe haber cookie tokenp_ cuando el login falla
        cy.getCookie('tokenp_').should('not.exist');
      });
    });

    it('Debe rechazar login con usuario inexistente', () => {
      cy.log('═══════════════════════════════════════════════════════');
      cy.log('📤 REQUEST - Login (Usuario Inexistente)');
      cy.log(`   Username: nonexistentuser_99999`);
      cy.log(`   Password: SomePassword123! (codificado con b64EncodeUnicode)`);
      cy.log('═══════════════════════════════════════════════════════');

      // Usar comando personalizado de login
      cy.loginUser('nonexistentuser_99999', 'SomePassword123!').then((response) => {
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
      cy.log('║     → Entrada: {username, password} codificados       ║');
      cy.log('║     → Salida: Status 200, body vacío                  ║');
      cy.log('║                                                        ║');
      cy.log('║  ✅ CASO 2: Usuario ya existente (Signup)             ║');
      cy.log('║     → Entrada: {username, password} codificados       ║');
      cy.log('║     → Salida: Status 200, errorMessage: ya existe     ║');
      cy.log('║                                                        ║');
      cy.log('║  ✅ CASO 3: Login correcto                            ║');
      cy.log('║     → Entrada: {username, password} codificados       ║');
      cy.log('║     → Salida: Status 200, Auth_token como string      ║');
      cy.log('║     → Cookie tokenp_ guardada automáticamente           ║');
      cy.log('║                                                        ║');
      cy.log('║  ✅ CASO 4: Login incorrecto                          ║');
      cy.log('║     → Entrada: {username, password} codificados       ║');
      cy.log('║     → Salida: Status 200, errorMessage de error       ║');
      cy.log('╚═══════════════════════════════════════════════════════╝');
    });
  });
});