#!/usr/bin/env bash
# Render Build Script for Django Backend
# Exit immediately if a command exits with a non-zero status
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Collect static files with WhiteNoise compression
python manage.py collectstatic --no-input

# Apply database migrations on PostgreSQL
python manage.py migrate
