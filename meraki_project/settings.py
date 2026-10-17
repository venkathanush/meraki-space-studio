import os
from pathlib import Path
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# Read SECRET_KEY from environment or fallback for local dev
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-meraki-space-studio-key')[cite: 2]

# Read DEBUG status from environment (defaults to True locally, set to False in Render)
DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 't')[cite: 2]

# Read ALLOWED_HOSTS from environment
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')[cite: 2]

# Application definition
INSTALLED_APPS = [
    'unfold',  # Must be before django.contrib.admin
    'unfold.contrib.filters',
    'unfold.contrib.forms',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'cloudinary_storage',
    'django.contrib.staticfiles',
    'cloudinary',
    'core',
][cite: 2]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # REMOVED WhiteNoise middleware here because you are using Cloudinary for static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
][cite: 2]

ROOT_URLCONF = 'meraki_project.urls'[cite: 2]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
][cite: 2]

WSGI_APPLICATION = 'meraki_project.wsgi.application'[cite: 2]

# Database Configuration (Supabase PostgreSQL via Render env or SQLite locally)
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', 'sqlite:///db.sqlite3'),
        conn_max_age=600,
        ssl_require=True
    )
}[cite: 2]

# Cloudinary Media & Static Storage Settings (Pulls keys from Render environment variables)
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME', ''),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY', ''),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET', ''),
}[cite: 2]

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'[cite: 2]
STATICFILES_STORAGE = 'cloudinary_storage.storage.StaticHashedCloudinaryStorage'[cite: 2]

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # Added so collectstatic has a local staging directory
MEDIA_URL = '/media/'[cite: 2]

# Django Unfold Dark Theme Configuration
UNFOLD = {
    "SITE_TITLE": "Meraki Space Studio Admin",
    "SITE_HEADER": "Meraki Space Studio",
    "SITE_URL": "/admin/",
    "THEME": "dark",
    "COLORS": {
        "primary": {
            "50": "250 245 235",
            "100": "240 230 210",
            "500": "193 154 107",  # Elegant warm gold accent
            "600": "168 130 85",
            "700": "142 107 67",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": True,
        "navigation": [
            {
                "title": "Portfolio Management",
                "items": [
                    {"title": "Projects", "icon": "photo_library", "link": "/admin/core/project/"},
                    {"title": "Services", "icon": "design_services", "link": "/admin/core/service/"},
                ],
            },
            {
                "title": "Client Relations",
                "items": [
                    {"title": "Inquiries", "icon": "mail", "link": "/admin/core/inquiry/"},
                    {"title": "Testimonials", "icon": "rate_review", "link": "/admin/core/testimonial/"},
                ],
            },
        ],
    },
}[cite: 2]

LANGUAGE_CODE = 'en-us'[cite: 2]
TIME_ZONE = 'UTC'[cite: 2]
USE_I18N = True[cite: 2]
USE_TZ = True[cite: 2]
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'[cite: 2]