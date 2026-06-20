// ================================================================
// ARCHIVO DE SOPORTE - Se carga AUTOMÁTICAMENTE antes de cada test
// ================================================================
// Aquí importamos los comandos personalizados que definimos
import './commands';

// Ignorar excepciones no capturadas para que no fallen los tests
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

// Comando helper para loggear requests
Cypress.Commands.add('logApiRequest', (method, url, body) => {
  cy.log(`📤 REQUEST: ${method} ${url}`);
  if (body) {
    cy.log(`📦 Body: ${JSON.stringify(body)}`);
  }
});

// Comando helper para loggear responses
Cypress.Commands.add('logApiResponse', (status, body, duration) => {
  cy.log(`📥 RESPONSE: Status ${status} | Duración: ${duration}ms`);
  cy.log(`📄 Body: ${JSON.stringify(body)}`);
});
