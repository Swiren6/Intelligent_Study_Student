#!/bin/bash
set -e

echo "🚀 Starting Intelligent Study Assistant Backend..."

# Attendre que PostgreSQL soit prêt
echo "⏳ Waiting for PostgreSQL..."
while ! pg_isready -h db -U study_user -d study_assistant_db > /dev/null 2>&1; do
    echo "   PostgreSQL is unavailable - sleeping"
    sleep 1
done
echo "✅ PostgreSQL is ready!"

# Vérifier si la base de données est initialisée
echo "🔍 Checking database..."
if ! python init_db.py check > /dev/null 2>&1; then
    echo "📊 Initializing database..."
    python init_db.py init
    
    # Demander si on veut seed (seulement en dev)
    if [ "$FLASK_ENV" = "development" ]; then
        echo "🌱 Seeding database with test data..."
        python seed_data.py || echo "⚠️  Seeding failed (might already exist)"
    fi
fi

echo "✅ Database ready!"

# Lancer l'application
echo "🎓 Starting Flask application..."
exec "$@"
