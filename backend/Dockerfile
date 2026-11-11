FROM php:8.1-apache

# Instalar dependencias del sistema y extensiones PHP
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo pdo_mysql mysqli gd mbstring curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Habilitar mod_rewrite de Apache
RUN a2enmod rewrite headers

# Configurar DocumentRoot apuntando a /var/www/html/public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Configuración personalizada de PHP
RUN echo "upload_max_filesize = 50M\n\
post_max_size = 50M\n\
memory_limit = 256M\n\
max_execution_time = 300\n\
date.timezone = America/Lima" > /usr/local/etc/php/conf.d/custom.ini

WORKDIR /var/www/html

EXPOSE 80
CMD ["apache2-foreground"]

