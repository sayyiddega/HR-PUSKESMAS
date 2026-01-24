# Base image Java
FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Copy jar ke container
COPY target/*.jar app.jar

# Expose port aplikasi
EXPOSE 8080

# Jalankan aplikasi
ENTRYPOINT ["java","-jar","app.jar"]
