# 1. Use the Maven image to build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# 2. Copy ONLY the POM files first.
# Do NOT use 'COPY . .' yet. This is the secret to fixing the duplicate error.
COPY pom.xml .
COPY common/pom.xml common/
COPY services/archive-service/pom.xml services/archive-service/

# 3. Resolve dependencies.
# This command only looks at the POMs we just copied.
# It won't see any "ghost" target folders from your Windows machine.
RUN mvn dependency:go-offline -B -pl services/archive-service -am

# 4. Now copy the actual source code
COPY common/src common/src
COPY services/archive-service/src services/archive-service/src

# 5. Build the JAR
RUN mvn clean package -DskipTests -pl services/archive-service -am

# 6. Final Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/services/archive-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]