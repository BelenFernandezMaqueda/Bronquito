# Imagen de desarrollo: corre uvicorn con --reload (recarga en caliente al
# guardar un archivo), igual que el Dockerfile del frontend con Vite.
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
