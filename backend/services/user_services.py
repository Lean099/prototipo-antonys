from fastapi import HTTPException
from models.user_model import User
from utils.hashPassword import hash_password, verify_password
from services.auth_services import register_user

def createUser(data, db):
    # Verificar si el username o email ya existen
    username_exists = db.query(User).filter(
        User.username == data.username
    ).first()

    if username_exists:
        raise HTTPException(
            status_code=400,
            detail="El username ya está en uso"
        )

    # Validar email único
    email_exists = db.query(User).filter(
        User.email == data.email
    ).first()

    if email_exists:
        raise HTTPException(
            status_code=400,
            detail="El email ya está en uso"
        )

    new_user = User(
        username=data.username,
        email=data.email,
        password=data.password,
        phone=data.phone,
        role=data.role,
        is_active=data.is_active
    )

    hashed_password = hash_password(data.password)

    new_user.password = hashed_password

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Usuario creado correctamente",
        "user": new_user
    }


def getOneUser(idUser, db):
    user = db.query(User).get(idUser)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "is_active": user.is_active
    }


def getAllUsers(
    db,
    page=1,
    limit=20,
    search=None,
    role=None,
    is_active=None,
    sort_order="desc"
):

    # Evitar valores inválidos
    if page < 1:
        page = 1

    if limit < 1:
        limit = 20

    if limit > 100:
        limit = 100

    query = db.query(User)

    # Búsqueda
    if search:
        search = search.strip().lower()

        if search:

            role_aliases = {
                "administrador": "admin",
                "empleado": "employee",
                "cliente": "customer",
            }

            search_role = role_aliases.get(search)

            search_term = f"%{search}%"

            if search_role:
                query = query.filter(
                    (User.username.ilike(search_term)) |
                    (User.email.ilike(search_term)) |
                    (User.phone.ilike(search_term)) |
                    (User.role == search_role)
                )
            else:
                query = query.filter(
                    (User.username.ilike(search_term)) |
                    (User.email.ilike(search_term)) |
                    (User.phone.ilike(search_term))
                )

    # Filtro por rol
    if role:
        query = query.filter(User.role == role.value)

    # Filtro por disponibilidad
    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    # Cantidad total de resultados
    total = query.count()

    # Orden por fecha de creación
    if sort_order == "asc":
        query = query.order_by(User.created_at.asc())
    else:
        query = query.order_by(User.created_at.desc())

    # Calcular desplazamiento
    offset = (page - 1) * limit

    # Obtener usuarios de esta página
    users = (
        query
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Calcular cantidad de páginas
    total_pages = (total + limit - 1) // limit

    return {
        "items": [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "is_active": user.is_active
            }
            for user in users
        ],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }


def updateData(idUser, data, db):
    user = db.query(User).get(idUser)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    # Actualizar username
    if data.username is not None:

        username_exists = db.query(User).filter(
            User.username == data.username,
            User.id != idUser
        ).first()

        if username_exists:
            raise HTTPException(
                status_code=400,
                detail="El username ya está en uso"
            )

        user.username = data.username

    # Actualizar email
    if data.email is not None:

        email_exists = db.query(User).filter(
            User.email == data.email,
            User.id != idUser
        ).first()

        if email_exists:
            raise HTTPException(
                status_code=400,
                detail="El email ya está en uso"
            )

        user.email = data.email

    # Actualizar teléfono
    if data.phone is not None:
        user.phone = data.phone

    # Actualizar rol
    if data.role is not None:
        user.role = data.role

    # Actualizar estado
    if data.is_active is not None:
        user.is_active = data.is_active

    # Actualizar contraseña
    if data.password:
        user.password = data.password

    db.commit()
    db.refresh(user)

    return {
        "message": "Usuario actualizado correctamente",
        "user": user
    }


def deleteUser(idUser, db):
    user = db.query(User).get(idUser)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    # Las direcciones asociadas se eliminan automáticamente
    # por la relación de cascada definida en el modelo.
    db.delete(user)
    db.commit()

    return {
        "details": "Usuario eliminado correctamente"
    }