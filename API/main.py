from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Importamos la configuración de SQL Server
from database import Base, engine, get_db, UserDB

# --- CONFIGURACIÓN SEGURIDAD ---
SECRET_KEY = "MomokoOkazaki(21)20030303/Brian Gutiérrez(23)20030617"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI(title="FastAPI con SQL Server y Login Seguro")

# Crear tablas en SQL Server si no existen
Base.metadata.create_all(bind=engine)

# --- MODELOS DE VALIDACIÓN (Pydantic) ---
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    disabled: bool
    class Config:
        from_attributes = True  # Permite mapear directamente objetos de SQLAlchemy

class Token(BaseModel):
    access_token: str
    token_type: str

# --- FUNCIONES AUXILIARES ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña contra su hash bcrypt"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    """Hashea una contraseña usando bcrypt (truncada a 72 bytes)"""
    password_truncated = password[:72]
    hashed = bcrypt.hashpw(password_truncated.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Consulta a SQL Server por Llave Primaria
    user = db.query(UserDB).filter(UserDB.username == username).first()
    if user is None:
        raise credentials_exception
    return user


# --- ENDPOINTS ---

# 1. Registro de Nuevos Usuarios (Guarda el Hash en SQL Server)
@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # Validar si ya existe el usuario en la DB
    existing_user = db.query(UserDB).filter(UserDB.username == user_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado.")
    
    # Validar si ya existe el email en la DB
    existing_email = db.query(UserDB).filter(UserDB.email == user_in.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado.")
    
    # Encriptamos el password antes de meterlo a SQL Server
    hashed_password = get_password_hash(user_in.password)
    
    db_user = UserDB(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password,
        disabled=False
    )
    db.add(db_user)
    db.commit()  # Ejecuta el INSERT en SQL Server de forma persistente
    db.refresh(db_user)
    return db_user

# 2. Login - Genera el JWT si las credenciales coinciden con SQL Server
@app.post("/token", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    # Buscar el usuario en la tabla
    db_user = db.query(UserDB).filter(UserDB.username == form_data.username).first()
    
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# 3. Endpoint protegido (Solo con Token válido)
@app.get("/users/me", response_model=UserResponse)
async def get_me(current_user: Annotated[UserDB, Depends(get_current_user)]):
    return current_user