from sqlalchemy import create_engine, Column, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import urllib

# 1. Define tus credenciales de SQL Server
DATABASE_USER = "app_login"
DATABASE_PASSWORD = "NuevaContraseña123!"
DATABASE_SERVER = "localhost"  # O la IP de tu servidor, ej. "127.0.0.1" o "INSTANCIA_SQL"
DATABASE_NAME = "DB_LOGIN_EXAMPLE"  # Asegúrate de que la base de datos exista en tu SQL Server
# Asegúrate de poner el nombre exacto del driver que instalaste
DRIVER = "ODBC Driver 17 for SQL Server" 

# 2. Construir la URL de conexión compatible con SQLAlchemy y pyodbc
params = urllib.parse.quote_plus(
    f"DRIVER={{{DRIVER}}};"
    f"SERVER={DATABASE_SERVER};"
    f"DATABASE={DATABASE_NAME};"
    f"UID={DATABASE_USER};"
    f"PWD={DATABASE_PASSWORD};"
    f"Encrypt=yes;"  # Cambia a 'no' si tienes problemas de certificados locales en desarrollo
    f"TrustServerCertificate=yes;"
)
DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"

# 3. Crear el motor de SQLAlchemy
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 4. Definir la estructura de la tabla 'usuarios'
# Nota: En SQL Server es fundamental especificar longitudes (NVARCHAR/VARCHAR) mediante String(X)
class UserDB(Base):
    __tablename__ = "usuarios"

    username = Column(String(50), primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False) # El hash de bcrypt mide unos 60 caracteres, 255 está perfecto
    disabled = Column(Boolean, default=False)

# Dependencia para abrir/cerrar conexiones limpiamente por cada endpoint
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()