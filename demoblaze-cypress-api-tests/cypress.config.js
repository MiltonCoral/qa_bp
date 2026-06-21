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

    // ============================================
    // CONFIGURACIÓN DE REPORTES (Mochawesome)
    // ============================================
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      charts: true,                           // Gráficos de estadísticas
      reportPageTitle: 'Demoblaze API Tests', // Título del reporte
      embeddedScreenshots: true,              // Screenshots embebidos en el reporte
      inlineAssets: true,                     // CSS/JS embebidos (reporte portable)
      saveAllAttempts: false,                 // Solo guardar el último intento
      overwrite: false,                       // No sobrescribir reportes anteriores
      html: true,                             // Generar HTML
      json: true,                             // Generar JSON
      reportDir: 'cypress/reports',           // Carpeta de salida
      reportFilename: 'demoblaze-api-report-[datetime]',
      timestamp: 'longDate'
    },

    // ============================================
    // CONFIGURACIÓN DE VIDEO Y SCREENSHOTS
    // ============================================
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,

    // Tamaño de ventana del navegador
    viewportWidth: 1280,
    viewportHeight: 720,

    // Timeouts (en milisegundos)
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    setupNodeEvents(on, config) {
      // Plugin de mochawesome reporter
      require('cypress-mochawesome-reporter/plugin')(on);
      
      return config;
    },
  },
});