from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import tempfile
import uuid

BASE_URL = "https://www.demoblaze.com"



from selenium.webdriver.chrome.service import Service

def crear_driver():
    # Crear Perfil Unico Random para pruebas
    chrome_options = Options()
    # chrome_options.add_argument("--headless")

    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # --- Chrome for Testing: ubicación manual ---
    chrome_options.binary_location = "/home/milton/Desktop/BPQA/qa_bp/demoblaze_e2e/chrome-linux64/chrome"  # o chrome.exe en Windows

    # Perfil temporal único -> sin cookies/caché de ejecuciones anteriores
    user_data_dir = tempfile.mkdtemp(prefix=f"chrome-profile-{uuid.uuid4()}-")
    chrome_options.add_argument(f"--user-data-dir={user_data_dir}")
    chrome_options.add_argument("--incognito")  # opcional, refuerza el aislamiento

    # --- Chromedriver: debe ser la versión que viene con ese Chrome for Testing ---
    service = Service(executable_path="/home/milton/Desktop/BPQA/qa_bp/demoblaze_e2e/chromedriver-linux64/chromedriver") # o chromedriver.exe en Windows

    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.maximize_window()
    return driver


def agregar_producto_por_id(driver, wait, product_id):
    #Agrega un producto al carrito usando su ID directo.#
 
    product_url = f"{BASE_URL}/prod.html?idp_={product_id}"
    driver.get(product_url)

    wait.until(EC.presence_of_element_located((By.ID, "tbodyid")))
    
    time.sleep(1)
    add_to_cart_btn = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a.btn-success.btn-lg"))
    )
    add_to_cart_btn.click()

    wait.until(EC.alert_is_present())
    alert = driver.switch_to.alert
    alert_text = alert.text
    print(f"  → Producto ID={product_id} | Alerta: '{alert_text}'")
    time.sleep(1)
    alert.accept()
    
    return alert_text


def agregar_dos_productos(driver, wait, product_ids):
    #Agrega varios productos al carrito.#
    print("=" * 50)
    print("PASO 1: AGREGAR PRODUCTOS AL CARRITO")
    print("=" * 50)
    inicio = f"{BASE_URL}"
    driver.get(inicio)  # Es necesario llamar al index principal para evitar que el backend detecte el bot que hace QA
    resultados = []
    for pid in product_ids:
        print(f"\n🛒 Agregando producto con ID={pid}...")
        resultado = agregar_producto_por_id(driver, wait, pid)
        resultados.append(resultado)

    print("\n" + "=" * 50)
    print("✅ PASO 1 COMPLETADO: productos agregados")
    print("=" * 50)
    return resultados


# ============================================================
# PASO 2: VISUALIZAR EL CARRITO
# ============================================================

def visualizar_carrito(driver, wait,tiempo):
   # Navega a la página del carrito y verifica que los productos estén listados.#
 
    print("\n" + "=" * 50)
    print("PASO 2: VISUALIZAR EL CARRITO")
    print("=" * 50)

    # 1. Navegar al carrito
    time.sleep(tiempo)
    driver.get(f"{BASE_URL}/cart.html")

    # 2. Esperar a que cargue la tabla de productos (tbodyid)    
    wait.until(EC.presence_of_element_located((By.ID, "tbodyid")))

    # 3. Verificar que hay productos en el carrito
    # Los productos se renderizan en <tr class="success"> dentro de tbodyid
    productos = driver.find_elements(By.CSS_SELECTOR, "#tbodyid tr.success")
    total_productos = len(productos)

    print(f"  → Productos en el carrito: {total_productos}")
    
    
    # 4. Verificar que el total se muestra correctamente
    time.sleep(tiempo)
    total_label = wait.until(
        EC.presence_of_element_located((By.ID, "totalp"))
    )
    print(f"  → Monto Total Pago: {total_label.text}")
    

    # 5. Verificar que hay botón "Place Order"
    place_order_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Place Order')]"))
    )
    print(f"  → Botón 'Place Order' disponible: SÍ")

    print("\n" + "=" * 50)
    print("✅ PASO 2 COMPLETADO: Carrito visualizado correctamente")
    print("=" * 50)

    return total_productos, total_label.text


# ============================================================
# PASO 3: COMPLETAR EL FORMULARIO DE COMPRA
# ============================================================

def completar_formulario_compra(driver, wait):
    """
    Abre el modal de compra, llena el formulario y confirma.
    """
    print("\n" + "=" * 50)
    print("PASO 3: COMPLETAR FORMULARIO DE COMPRA")
    print("=" * 50)

    # 1. Click en "Place Order" para abrir el modal
    place_order_btn = wait.until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-target='#orderModal']"))
    )
    place_order_btn.click()
    print("  → Click en 'Place Order'")

    # 2. Esperar a que aparezca el modal (id="orderModal")
    wait.until(EC.visibility_of_element_located((By.ID, "orderModal")))

    # 3. Llenar el formulario con datos de prueba
    datos = {
        "name": "Milton Coral",
        "country": "Ecuador",
        "city": "Quito",
        "card": "12312312432554",
        "month": "06",
        "year": "2026"
    }

    for campo, valor in datos.items():
        time.sleep(0.5) # tiempo de espera para visualizar los campos llenados
        input_field = wait.until(
            EC.presence_of_element_located((By.ID, campo))
        )
        input_field.clear()
        input_field.send_keys(valor)
        print(f"  → Campo '{campo}' = '{valor}'")
    
    # 4. Click en "Purchase"
    purchase_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Purchase')]"))
    )
    purchase_btn.click()
    print("  → Click en 'Purchase'")

    # 5. Esperar y capturar el mensaje de confirmación (SweetAlert)
    # El mensaje aparece en un <p class="lead text-muted"> dentro del modal de éxito
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "p.lead.text-muted")))
    mensaje_confirmacion = driver.find_element(By.CSS_SELECTOR, "p.lead.text-muted").text
    print(f"\n  → Confirmación recibida:\n{mensaje_confirmacion}")

    # 6. Click en "OK" para cerrar el modal de confirmación
    time.sleep(1) # Tiempo de espera para visualizacion de compra correcta
    ok_btn = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button.confirm.btn.btn-lg.btn-primary"))
    )
    ok_btn.click()
    print("  → Click en 'OK'")

    print("\n" + "=" * 50)
    print("✅ PASO 3 COMPLETADO: Compra finalizada exitosamente")
    print("=" * 50)

    return mensaje_confirmacion


def cerrar_driver(driver):
    try:
        # Limpiar cookies (API estándar de Selenium, funciona en cualquier navegador)
        driver.delete_all_cookies()

        # Limpiar localStorage y sessionStorage vía JS
        driver.execute_script("window.localStorage.clear();")
        driver.execute_script("window.sessionStorage.clear();")

        # Limpiar caché y cookies del navegador a nivel de red (solo Chrome/Chromium vía CDP)
        driver.execute_cdp_cmd("Network.clearBrowserCache", {})
        driver.execute_cdp_cmd("Network.clearBrowserCookies", {})

        print("🧹 Caché, cookies y storage limpiados.")
    except Exception as e:
        print(f"⚠️ No se pudo limpiar todo: {e}")
    finally:
        time.sleep(1)
        driver.quit()
        print("\n🔒 Navegador cerrado.")

# ============================================================
# EJECUCIÓN COMPLETA DEL FLUJO E2E
# ============================================================

if __name__ == "__main__":
    driver = crear_driver()
    wait = WebDriverWait(driver, 15)
    tiempo=2 #Delay para esperar calculos y carga de tablas
    try:
        # PASO 1: Agregar 2 productos
        agregar_dos_productos(driver, wait, product_ids=[2,6])

        # PASO 2: Visualizar carrito
        visualizar_carrito(driver, wait,tiempo)

        # PASO 3: Completar compra
        completar_formulario_compra(driver, wait)

        print("✅ FLUJO E2E COMPLETADO EXITOSAMENTE")
   

    finally:
        cerrar_driver(driver)