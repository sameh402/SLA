#!/bin/bash
set -e

echo "🔧 Running migrations..."
python manage.py migrate --noinput

echo "👤 Creating admin user..."
python manage.py create_admin

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Build complete!"
