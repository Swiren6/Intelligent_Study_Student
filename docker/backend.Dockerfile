FROM python:3.11-slim

# Définir le mainteneur
LABEL maintainer="sirine.abdelkhalek@test.com"

# Définir les variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Créer le répertoire de travail
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    postgresql-client \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p uploads logs && \
    chmod 755 uploads logs

# Exposer le port
EXPOSE 5000

# Script de démarrage avec healthcheck
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Point d'entrée
ENTRYPOINT ["docker-entrypoint.sh"]

# Commande par défaut
CMD ["python", "run.py"]
