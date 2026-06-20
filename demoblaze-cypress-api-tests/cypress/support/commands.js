// ================================================================
// COMANDOS PERSONALIZADOS DE CYPRESS
// ================================================================
// Estos comandos se pueden usar en cualquier test como:
//   cy.apiPost('/signup', { username: 'x', password: 'y' })
//   cy.signupUser('x', 'y')
//   cy.loginUser('x', 'y')

// Petición POST genérica a la API
Cypress.Commands.add('apiPost', (endpoint, body) => {
  return cy.request({
    method: 'POST',
    url: endpoint,
    body: body,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    failOnStatusCode: false  // No fallar automáticamente en status 4xx/5xx
  });
});

// Comando para registrar un usuario (signup)
Cypress.Commands.add('signupUser', (username, password) => {
  return cy.apiPost('/signup', { username, password });
});

// Comando para hacer login
Cypress.Commands.add('loginUser', (username, password) => {
  return cy.apiPost('/login', { username, password });
});
