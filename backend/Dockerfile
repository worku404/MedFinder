FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /code/medfinder

# Install system dependencies for psycopg and PostGIS
RUN apt-get update && apt-get install -y \
    gcc libpq-dev gdal-bin libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN sed -i 's/\r$//' ./wait-for-it.sh && chmod +x ./wait-for-it.sh