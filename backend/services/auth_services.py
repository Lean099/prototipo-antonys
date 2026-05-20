from fastapi import HTTPException
from sqlalchemy import or_
from models.user_model import User
from utils.hashPassword import hash_password, verify_password

def login_user(data, db):

    identifier = data.identifier.lower().strip()

    user = db.query(User).filter(
        or_(
            User.email == identifier,
            User.username == identifier
        )
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )
    
    is_valid_password = verify_password(data.password, user.password)
    
    if not is_valid_password:
        raise HTTPException(
            status_code=401,
            detail="Contraseña incorrecta"
        )

    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "phone": user.phone
    }

def register_user(data, db):

    # verificar username
    username_exists = db.query(User).filter(
        User.username == data.username
    ).first()

    if username_exists:
        raise HTTPException(
            status_code=400,
            detail="El username ya está en uso"
        )

    # verificar email
    email_exists = db.query(User).filter(
        User.email == data.email
    ).first()

    if email_exists:
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado"
        )
    
    print(data.password)
    print(type(data.password))
    print(len(data.password))

    new_user = User(
        username=data.username.lower(),
        email=data.email.lower(),
        password=data.password,  # después hash
        phone=data.phone
    )

    hashed_password = hash_password(data.password)

    new_user.password = hashed_password

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user