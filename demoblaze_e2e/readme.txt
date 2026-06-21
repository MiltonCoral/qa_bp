================================================================================
DEMOBPLAZE.COM — PRUEBA FUNCIONAL AUTOMATIZADA E2E (Selenium + Python)
================================================================================

1. DESCRIPCIÓN DEL PROYECTO
--------------------------------------------------------------------------------
Este proyecto implementa una prueba funcional automatizada End-to-End (E2E) del
flujo de compra en https://www.demoblaze.com/ utilizando Selenium WebDriver con
Python.

El flujo automatizado incluye:
  • Paso 1: Agregar 2 productos al carrito
  • Paso 2: Visualizar el carrito y verificar productos + total
  • Paso 3: Completar el formulario de compra y finalizar la transacción

2. REQUISITOS PREVIOS
--------------------------------------------------------------------------------
  • Python 3.8 o superior
  • Google Chrome instalado (o Chrome for Testing)
  • ChromeDriver compatible con la versión de Chrome instalada
  • Bibliotecas Python requeridas (ver sección 5)

3. INSTALACIÓN DE GOOGLE CHROME Y CHROMEDRIVER
--------------------------------------------------------------------------------

3.1.1 DESCARGAR CHROME FOR TESTING + CHROMEDRIVER

    Visite la página de versiones de Chrome for Testing:

        https://googlechromelabs.github.io/chrome-for-testing/

    Descargue los siguientes archivos para su sistema operativo:
      • chrome (navegador)
      • chromedriver

    A continuación se listan los enlaces directos de descarga para la versión
    151.0.7896.2 (ajuste la versión según la disponibilidad actual):

    --- LINUX x64 ---
      Chrome:        https://storage.googleapis.com/chrome-for-testing-public/151.0.7896.2/linux64/chrome-linux64.zip
      ChromeDriver:  https://storage.googleapis.com/chrome-for-testing-public/151.0.7896.2/linux64/chromedriver-linux64.zip

    --- MAC ARM64 (Apple Silicon: M1, M2, M3) ---
      Chrome:        https://storage.googleapis.com/chrome-for-testing-public/151.0.7896.2/mac-arm64/chrome-mac-arm64.zip
      ChromeDriver:  https://storage.googleapis.com/chrome-for-testing-public/151.0.7896.2/mac-arm64/chromedriver-mac-arm64.zip

    --- MAC x64 (Intel) ---
      Chrome:        https://storage.googleapis.com/chrome-for-testing-public/151.0.7896.2/mac-x64/chrome-mac-x64.zip
      ChromeDriver:  https://storage.googleapis.com/chrome-for-testing-public/151.0.7896.2/mac-x64/chromedriver-mac-x64.zip

    --- WINDOWS x64 ---
      Chrome:        https://storage.googleapis.com/chrome-for-testing-public/151.0.7896.2/win64/chrome-win64.zip
      ChromeDriver:  https://storage.googleapis.com/chrome-for-testing-public/151.0.7896.2/win64/chromedriver-win64.zip

    --- WINDOWS x32 ---
      Chrome:        https://storage.googleapis.com/chrome-for-testing-public/151.0.7896.2/win32/chrome-win32.zip
      ChromeDriver:  https://storage.googleapis.com/chrome-for-testing-public/151.0.7896.2/win32/chromedriver-win32.zip

3.1.2 EXTRAER LOS ARCHIVOS

    Cree una carpeta para el proyecto y extraiga ambos ZIP dentro:

        mkdir demoblaze_e2e
        cd demoblaze_e2e
        unzip chrome-linux64.zip          # ajuste según su SO
        unzip chromedriver-linux64.zip    # ajuste según su SO

    La estructura resultante será:

        demoblaze_e2e/
        ├── chrome-linux64/               # o chrome-win64, chrome-mac-arm64, etc.
        │   └── chrome                    # o chrome.exe en Windows
        ├── chromedriver-linux64/         # o chromedriver-win64, etc.
        │   └── chromedriver              # o chromedriver.exe en Windows
        └── (aquí irán los archivos del proyecto)

3.1.3 CONFIGURAR EL SCRIPT PARA USAR CHROME FOR TESTING

    En el archivo test_demoblaze.py, la función crear_driver() debe incluir
    las rutas absolutas al binario de Chrome y al ChromeDriver:

        from selenium.webdriver.chrome.service import Service

        def crear_driver():
            chrome_options = Options()
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")

            # --- Ruta al Chrome for Testing ---
            chrome_options.binary_location = "/home/usuario/proyecto/demoblaze_e2e/chrome-linux64/chrome"
            # Windows Ejemplo: "C:/Users/milton/Desktop/test/qa_bp/demoblaze_e2e/chrome-win64/chrome.exe"

            # Perfil temporal único
            user_data_dir = tempfile.mkdtemp(prefix=f"chrome-profile-{uuid.uuid4()}-")
            chrome_options.add_argument(f"--user-data-dir={user_data_dir}")
            chrome_options.add_argument("--incognito")

            # --- Ruta al ChromeDriver emparejado ---
            service = Service(executable_path="/home/usuario/proyecto/demoblaze_e2e/chromedriver-linux64/chromedriver")
            #Windows Ejemplo: "C:/Users/milton\Desktop/test/qa_bp/demoblaze_e2e/chromedriver-win64/chromedriver.exe"

            driver = webdriver.Chrome(service=service, options=chrome_options)
            driver.maximize_window()
            return driver

    NOTA: Ajuste las rutas absolutas según la ubicación real en su sistema.
    NOTA: Para Mac OS (Apple Silicon) ejecutar los siguientes comandos en los repectivos directorios de carpetas (navegador y driver)
      xattr -cr 'Google Chrome for Testing.app'
      chmod +x "DIRECTORIO/chromedriver-mac-arm64/chromedriver"


4. INSTALACIÓN DE DEPENDENCIAS PYTHON
--------------------------------------------------------------------------------
4.1 Instale las bibliotecas requeridas:

        pip install selenium
        
        o

        pip3 install selenium

5. ESTRUCTURA DEL PROYECTO
--------------------------------------------------------------------------------
    demoblaze_e2e/
    ├── chrome-linux64/        # Chrome for Testing 
    ├── chromedriver-linux64/  # ChromeDriver emparejado 
    ├── test_demoblaze.py      # Script principal con el flujo E2E completo
    ├── readme.txt             # Este archivo
    └── conclusiones.txt       # Hallazgos y conclusiones del ejercicio

6. EJECUCIÓN PASO A PASO
--------------------------------------------------------------------------------
6.1 Abra una terminal y navegue hasta la carpeta del proyecto:

    cd demoblaze_e2e

6.2 Ejecute el script de prueba:

    python test_demoblaze.py

    o también:

    python3 test_demoblaze.py

6.3 Durante la ejecución:
  • Se abrirá una ventana de Chrome (modo visible, no headless)
  • El navegador ejecutará automáticamente el flujo completo de compra
  • En la terminal se mostrará el progreso de cada paso
  • Al finalizar, el navegador se cerrará automáticamente

7. CONFIGURACIÓN DEL SCRIPT
--------------------------------------------------------------------------------
El script permite ajustar los siguientes parámetros en la sección __main__:

    product_ids=[2, 6]     # IDs de los productos a agregar (cambiar según necesidad)
    tiempo=2               # Delay en segundos para esperar cálculos y renderizado

Los productos disponibles en demoblaze.com tienen IDs consecutivos (1, 2, 3...).
Puede modificarlos según los productos que desee probar.

8. COMPORTAMIENTO DEL DRIVER
--------------------------------------------------------------------------------
8.1 Perfil único temporal:
  • Cada ejecución crea un perfil de Chrome temporal y único
  • Se ejecuta en modo incógnito para garantizar aislamiento
  • No se reutilizan cookies ni caché de ejecuciones anteriores

8.2 Limpieza post-ejecución:
  • Al finalizar, el script limpia cookies, localStorage, sessionStorage
  • Se ejecutan comandos CDP para limpiar caché del navegador
  • El perfil temporal se elimina al cerrar el navegador

9. NOTAS IMPORTANTES
--------------------------------------------------------------------------------
  • El sitio demoblaze.com utiliza JavaScript para renderizar contenido dinámico
  • Se implementaron esperas explícitas (WebDriverWait) para manejar la carga AJAX
  • Las alertas del navegador ("Product added") se manejan con switch_to.alert
  • El modal de confirmación de compra utiliza SweetAlert (swal)

10. POSIBLES PROBLEMAS Y SOLUCIONES
--------------------------------------------------------------------------------

  PROBLEMA: SessionNotCreatedException: This version of ChromeDriver only supports...
  SOLUCIÓN: La versión de ChromeDriver no coincide con la de Chrome. Use versiones iguales
            de driver y navegador para arreglar el error. 

  PROBLEMA: "unknown error: cannot find Chrome binary"
  SOLUCIÓN: Selenium no encuentra el ejecutable de Chrome, asegúrese de configurar chrome_options.binary_location
            con la ruta absoluta al binario de Chrome.

  PROBLEMA: Timeout en la carga de elementos
  SOLUCIÓN: Aumente el valor de 'tiempo' o el timeout del WebDriverWait.

  PROBLEMA: Productos incorrectos en el carrito
  SOLUCIÓN: Asegúrese de que el driver navegue primero a la página de inicio
            (index.html) antes de acceder a las URLs de productos individuales.
            Esto es crítico porque el frontend inicializa el catálogo en memoria
            durante la carga del home.

Notas Importantes : La ejecucion fue probada tanto en Mac OS Apple Silicon , Linux Fedora 42 y Windows 10 x64
No olvidar añadir al PATH de windows python para que sea posible ejecutar de consola python3 o python
, de igual forma con el resto de OS, Se adjunta una demo en formato .mp4 para verificar el funcionamiento

================================================================================
Autor: Milton Coral
Fecha: 2026-06-19
Framework: Selenium WebDriver + Python 3
================================================================================