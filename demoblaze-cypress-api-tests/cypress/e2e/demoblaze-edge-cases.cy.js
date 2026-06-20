/// <reference types="cypress" />

/**
 * ============================================================================
 * PRUEBAS ADICIONALES - CASOS LÍMITE Y EDGE CASES
 * ============================================================================
 */

describe('Demoblaze API - Casos Límite y Edge Cases', () => {

  const BASE_URL = 'https://api.demoblaze.com';
  const SIGNUP_ENDPOINT = '/signup';
  const LOGIN_ENDPOINT = '/login';

  describe('🔒 Pruebas de Seguridad', () => {

    it('Debe manejar SQL Injection en username', () => {
      const maliciousPayload = {
        username: "' OR '1'='1",
        password: "password123"
      };

      cy.request({
        method: 'POST',
        url: `${BASE_URL}${SIGNUP_ENDPOINT}`,
        body: maliciousPayload,
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 500]);
        cy.log(`SQL Injection test - Status: ${response.status}`);
      });
    });

    it('Debe manejar XSS en username', () => {
      const xssPayload = {
        username: "<script>alert('xss')</script>",
        password: "password123"
      };

      cy.request({
        method: 'POST',
        url: `${BASE_URL}${SIGNUP_ENDPOINT}`,
        body: xssPayload,
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
        cy.log(`XSS test - Status: ${response.status}`);
      });
    });
  });

  describe('📏 Pruebas de Validación de Datos', () => {

    it('Debe manejar username muy largo', () => {
      cy.request({
        method: 'POST',
        url: `${BASE_URL}${SIGNUP_ENDPOINT}`,
        body: {
          username: "a".repeat(100),
          password: "password123"
        },
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('Debe manejar password muy corto', () => {
      cy.request({
        method: 'POST',
        url: `${BASE_URL}${SIGNUP_ENDPOINT}`,
        body: {
          username: `shortpass_${Date.now()}`,
          password: "1"
        },
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('Debe manejar campos vacíos', () => {
      cy.request({
        method: 'POST',
        url: `${BASE_URL}${SIGNUP_ENDPOINT}`,
        body: { username: "", password: "" },
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  describe('⚡ Pruebas de Rendimiento', () => {

    it('Debe responder en menos de 5 segundos', () => {
      const startTime = Date.now();

      cy.request({
        method: 'POST',
        url: `${BASE_URL}${LOGIN_ENDPOINT}`,
        body: { username: "testuser", password: "testpass" },
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false
      }).then(() => {
        const duration = Date.now() - startTime;
        cy.log(`⏱️ Tiempo total: ${duration}ms`);
        expect(duration).to.be.lessThan(5000);
      });
    });
  });
});
