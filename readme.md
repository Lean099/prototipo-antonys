# Como probar el prototipo:

Dentro de nuestro proyecto hay dos carpetas:
- **antonys (principal-proyecto)**
	- **learn-tailwindcss (frontend)** :fa-desktop:
	- **backend (servidor-backend)** :fa-server:

# FRONTEND

Para probar el frontend primero tenemos que tener obviamente instalado nodejs en la computadora para poder instalar las librerias que se usan.

Para esto nos dirigimos dentro de la carpeta learn-tailwindcss desde nuestra terminal, ubicar la carpeta del proyecto donde mas comodo nos parezca.

Ejemplo si esta guardada en el escritorio deberiamos acceder de esta manera:

**cd ~/desktop/antonys/learn-tailwindcss**

Si estamos en W11 aveces la carpeta Desktop de nuestro escritorio esta dentro de la carpeta OneDrive entonces seria de esta manera:

**cd ~/OneDrive/Desktop/antonys/learn-tailwindcss**

Una vez dentro ya podemos ejecutar el siguiente comando para que se nos instalen las dependencias:

**npm install**

Una vez terminen de instalarse las dependencias ya podemos correr el frontend con el siguiente comando:

**npm run dev**


# BACKEND

**ACLARACION: Dentro de la carpeta backend ya viene con un archivo app.db que es la base de datos SQLite para probar el prototipo, pero se puede borrar y se genera automaticamente, si queremos ver los datos dentro de este archivo necesitariamos el programa DB Browser (SQLite), abririamos el programa y luego abrimos el archivo, luego mostramos los datos de cada tabla.**

Para el backend hacemos lo mismo como en el frontend, ponemos la direccion donde esta nuestra carpeta backend:

**cd ~/desktop/antonys/backend**

Si estamos en W11 aveces la carpeta Desktop de nuestro escritorio esta dentro de la carpeta OneDrive entonces seria de esta manera:

**cd ~/OneDrive/Desktop/antonys/backend**

Una vez dentro de la carpeta ya podemos ejecutar los siguientes comandos para crear un entorno virtual, activarlo, instalar dependencias y luego levantar el servidor:

Primero creamos el entorno virtual, al ejecutar demora unos segundos porque debe generar la carpeta venv:

**python -m venv venv**

Activamos el entorno virtual luego de haberse generado:

**source venv\Scripts\activate**

Una vez activado el entorno ya podemos instalar las dependencias:

**pip install -r requirements.txt**

Cuando se terminen de instalar las dependencias ya podemos levantar nuestro servidor con el siguiente comando:

```bash
uvicorn main:app --reload --port 8000
```



