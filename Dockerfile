# Use the official PHP image with Apache
FROM php:8.2-apache

# Install mysqli extension for database connectivity
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

# Copy application source code to the Apache web root directory
COPY . /var/www/html/

# Expose port 80 for the Apache server
EXPOSE 80