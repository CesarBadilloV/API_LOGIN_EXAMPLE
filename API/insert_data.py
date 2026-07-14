"""
Script para insertar datos de usuarios en la base de datos con contraseñas hasheadas
Uso: python insert_data.py
"""

from database import SessionLocal, UserDB, engine, Base
import bcrypt

def get_password_hash(password: str) -> str:
    """Hashea una contraseña usando bcrypt
    Nota: bcrypt tiene un límite de 72 bytes, por lo que truncamos si es necesario
    """
    # Truncar a 72 bytes si la contraseña es muy larga (limitación de bcrypt)
    password_truncated = password[:72]
    # Generar hash con salt de 12 rondas (por defecto)
    hashed = bcrypt.hashpw(password_truncated.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

def insert_users(users_data: list[dict]):
    """
    Inserta múltiples usuarios en la base de datos
    
    Args:
        users_data: Lista de diccionarios con estructura:
                   {'username': 'user', 'email': 'user@email.com', 'password': 'pass123'}
    """
    # Asegurar que las tablas existan
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        inserted_count = 0
        for user_data in users_data:
            username = user_data.get('username')
            email = user_data.get('email')
            password = user_data.get('password')
            disabled = user_data.get('disabled', False)
            
            # Validar datos requeridos
            if not all([username, email, password]):
                print(f"❌ Error: Falta data en el usuario. Requiere: username, email, password")
                print(f"   Datos recibidos: {user_data}")
                continue
            
            # Verificar si el usuario ya existe
            existing_user = db.query(UserDB).filter(UserDB.username == username).first()
            if existing_user:
                print(f"⚠️  El usuario '{username}' ya existe. Se omite.")
                continue
            
            # Verificar si el email ya está registrado
            existing_email = db.query(UserDB).filter(UserDB.email == email).first()
            if existing_email:
                print(f"⚠️  El email '{email}' ya está registrado. Se omite.")
                continue
            
            # Hashear la contraseña
            hashed_password = get_password_hash(password)
            
            # Crear el nuevo usuario
            new_user = UserDB(
                username=username,
                email=email,
                hashed_password=hashed_password,
                disabled=disabled
            )
            
            db.add(new_user)
            inserted_count += 1
            print(f"✅ Usuario '{username}' agregado (email: {email})")
        
        # Confirmar todos los cambios a la base de datos
        db.commit()
        print(f"\n✨ {inserted_count} usuario(s) insertado(s) correctamente en la base de datos.")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error al insertar datos: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    # Aquí defines los usuarios que quieres insertar
    # Puedes agregar más usuarios siguiendo el mismo formato
    users_to_insert = [
        {
            'username': 'juan_perez',
            'email': 'juan@example.com',
            'password': 'Password123!',
            'disabled': False
        },
        {
            'username': 'maria_garcia',
            'email': 'maria@example.com',
            'password': 'SecurePass456!',
            'disabled': False
        },
        {
            'username': 'admin_user',
            'email': 'admin@example.com',
            'password': 'AdminPassword789!',
            'disabled': False
        },
        {
            'username': 'test_user',
            'email': 'test@example.com',
            'password': 'TestPass999!',
            'disabled': False
        },
        {
            'username': 'BadilloC',
            'email': 'badilloc@gmail.com',
            'password': 'Miku2004!',
            'disabled': False
        },
        {
            'username': 'PrismaY',
            'email': 'prismay@gmail.com',
            'password': 'Brian2003!',
            'disabled': False
        }
    ]
    
    print("🚀 Iniciando inserción de usuarios...\n")
    insert_users(users_to_insert)
