"""
Script de pruebas automatizadas para la API de Login
Requiere: pip install pytest requests

Uso: pytest test_api.py -v
     o
     python test_api.py
"""

import requests
import pytest
from typing import Dict
import time

BASE_URL = "http://127.0.0.1:8000"

# Timestamp para generar datos únicos en cada ejecución
TIMESTAMP = str(int(time.time() * 1000))[-6:]

# Variables globales para almacenar datos de prueba
test_user = {}
token_response = {}

# Contador para generar emails únicos
test_counter = 0

def get_unique_email(base_email="test_unique"):
    """Genera un email único para cada test usando timestamp"""
    global test_counter
    test_counter += 1
    return f"{base_email}_{TIMESTAMP}_{test_counter}@example.com"

def get_unique_username(base_user="test_user"):
    """Genera un username único para cada test usando timestamp"""
    global test_counter
    test_counter += 1
    return f"{base_user}_{TIMESTAMP}_{test_counter}"


class TestRegistro:
    """Suite de pruebas para el endpoint de registro"""
    
    def test_01_registro_exitoso(self):
        """Prueba registro de usuario nuevo"""
        payload = {
            "username": test_user["username"],
            "email": test_user["email"],
            "password": test_user["password"]
        }
        response = requests.post(f"{BASE_URL}/register", json=payload)
        
        assert response.status_code == 201, f"Error: {response.text}"
        data = response.json()
        assert data["username"] == test_user["username"]
        assert data["email"] == test_user["email"]
        assert data["disabled"] == False
        print(" Registro exitoso")
    
    def test_02_registro_usuario_duplicado(self):
        """Prueba que no permite registrar usuario duplicado"""
        payload = {
            "username": test_user["username"],
            "email": "otro@example.com",
            "password": "AnotherPass123!"
        }
        response = requests.post(f"{BASE_URL}/register", json=payload)
        
        assert response.status_code == 400
        assert "ya está registrado" in response.json()["detail"]
        print(" Validación de usuario duplicado correcta")
    
    def test_03_registro_email_duplicado(self):
        """Prueba que no permite registrar email duplicado"""
        payload = {
            "username": get_unique_username(),  # Username único
            "email": test_user["email"],  # Mismo email del usuario registrado en test_01
            "password": "AnotherPass123!"
        }
        response = requests.post(f"{BASE_URL}/register", json=payload)
        
        assert response.status_code == 400
        assert "correo" in response.json()["detail"]
        print(" Validación de email duplicado correcta")
    
    def test_04_registro_datos_incompletos(self):
        """Prueba que rechaza datos incompletos"""
        payload = {
            "username": get_unique_username(),
            "email": get_unique_email()
            # Falta password
        }
        response = requests.post(f"{BASE_URL}/register", json=payload)
        
        assert response.status_code == 422  # Validation error
        print(" Validación de datos incompletos correcta")


class TestLogin:
    """Suite de pruebas para el endpoint de login"""
    
    def test_05_login_exitoso(self):
        """Prueba login con credenciales correctas"""
        payload = {
            "username": test_user["username"],
            "password": test_user["password"]
        }
        response = requests.post(f"{BASE_URL}/token", data=payload)
        
        assert response.status_code == 200, f"Error: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        
        # Guardar token para pruebas posteriores
        token_response["access_token"] = data["access_token"]
        print(" Login exitoso")
        print(f"   Token obtenido: {data['access_token'][:50]}...")
    
    def test_06_login_password_incorrecto(self):
        """Prueba login con contraseña incorrecta"""
        payload = {
            "username": test_user["username"],
            "password": "PasswordIncorrecto123!"
        }
        response = requests.post(f"{BASE_URL}/token", data=payload)
        
        assert response.status_code == 401
        assert "incorrectos" in response.json()["detail"]
        print(" Validación de contraseña incorrecta correcta")
    
    def test_07_login_usuario_inexistente(self):
        """Prueba login con usuario que no existe"""
        payload = {
            "username": "usuario_fantasma_xyz",
            "password": "AnyPassword123!"
        }
        response = requests.post(f"{BASE_URL}/token", data=payload)
        
        assert response.status_code == 401
        assert "incorrectos" in response.json()["detail"]
        print(" Validación de usuario inexistente correcta")


class TestProtegido:
    """Suite de pruebas para endpoints protegidos"""
    
    def test_08_acceso_protegido_sin_token(self):
        """Prueba que endpoint protegido rechaza sin token"""
        response = requests.get(f"{BASE_URL}/users/me")
        
        assert response.status_code == 401  # Sin token devuelve 401
        print("✅ Rechazo de acceso sin token correcto")
    
    def test_09_acceso_protegido_con_token_invalido(self):
        """Prueba que endpoint protegido rechaza token inválido"""
        headers = {"Authorization": "Bearer token_falso_xyz123"}
        response = requests.get(f"{BASE_URL}/users/me", headers=headers)
        
        assert response.status_code == 401  # Unauthorized
        print(" Rechazo de token inválido correcto")
    
    def test_10_acceso_protegido_con_token_valido(self):
        """Prueba acceso a endpoint protegido con token válido"""
        if not token_response.get("access_token"):
            pytest.skip("Token no disponible, ejecuta test_05 primero")
        
        headers = {"Authorization": f"Bearer {token_response['access_token']}"}
        response = requests.get(f"{BASE_URL}/users/me", headers=headers)
        
        assert response.status_code == 200, f"Error: {response.text}"
        data = response.json()
        assert data["username"] == test_user["username"]
        assert data["email"] == test_user["email"]
        print(" Acceso protegido exitoso")
        print(f"   Usuario: {data['username']}")


def run_all_tests():
    """Ejecuta todas las pruebas de forma manual"""
    print("\n" + "="*60)
    print(" INICIANDO PRUEBAS AUTOMATIZADAS DE LA API")
    print("="*60 + "\n")
    
    try:
        # Verificar que la API está ejecutándose
        response = requests.get(f"{BASE_URL}/docs", timeout=2)
        print(f" API disponible en {BASE_URL}\n")
    except requests.ConnectionError:
        print(f" ERROR: No se puede conectar a {BASE_URL}")
        print("   Asegúrate de que la API está corriendo:")
        print("   python -m uvicorn main:app --reload\n")
        return False    
    # Generar usuario único para esta ejecución de pruebas
    global test_user
    test_user = {
        "username": get_unique_username("test_automation"),
        "email": get_unique_email("test_automation"),
        "password": "TestAutomation123!"
    }
    print(f"📝 Usuario de prueba: {test_user['username']} / {test_user['email']}\n")    
    # Ejecutar pruebas de Registro
    print("[1/3] Pruebas de REGISTRO")
    print("-" * 60)
    test_registro = TestRegistro()
    try:
        test_registro.test_01_registro_exitoso()
        test_registro.test_02_registro_usuario_duplicado()
        test_registro.test_03_registro_email_duplicado()
        test_registro.test_04_registro_datos_incompletos()
    except AssertionError as e:
        print(f" Error en registro: {e}")
        return False
    print()
    
    # Ejecutar pruebas de Login
    print("[2/3] Pruebas de LOGIN")
    print("-" * 60)
    test_login = TestLogin()
    try:
        test_login.test_05_login_exitoso()
        test_login.test_06_login_password_incorrecto()
        test_login.test_07_login_usuario_inexistente()
    except AssertionError as e:
        print(f" Error en login: {e}")
        return False
    print()
    
    # Ejecutar pruebas de Endpoints Protegidos
    print("[3/3] Pruebas de ENDPOINTS PROTEGIDOS")
    print("-" * 60)
    test_protegido = TestProtegido()
    try:
        test_protegido.test_08_acceso_protegido_sin_token()
        test_protegido.test_09_acceso_protegido_con_token_invalido()
        test_protegido.test_10_acceso_protegido_con_token_valido()
    except AssertionError as e:
        print(f" Error en endpoints protegidos: {e}")
        return False
    print()
    
    print("="*60)
    print(" TODAS LAS PRUEBAS PASARON EXITOSAMENTE")
    print("="*60 + "\n")
    return True


if __name__ == "__main__":
    import sys
    success = run_all_tests()
    sys.exit(0 if success else 1)
