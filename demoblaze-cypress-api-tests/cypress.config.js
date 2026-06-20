const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // URL base de la API de demoblaze
    baseUrl: 'https://api.demoblaze.com',

    // Patrón para encontrar archivos de test
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',

    // Archivo de soporte que se carga antes de cada test
    supportFile: 'cypress/support/e2e.js',

    // Carpetas para fixtures, screenshots y videos
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    // Configuración de reportes
    reporter: 'json',
    reporterOptions: {
      output: 'reports/cypress-report.json'
    },

    // Grabar videos de las pruebas
    video: true,

    // Tomar screenshot cuando un test falla
    screenshotOnRunFailure: true,

    // Tamaño de ventana del navegador
    viewportWidth: 1280,
    viewportHeight: 720,

    // Timeouts (en milisegundos)
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    setupNodeEvents(on, config) {
      // Aquí puedes agregar event listeners de Node.js
      return config;
    },
  },
});
