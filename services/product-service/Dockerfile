# 1. Use the Maven image to build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# 2. Copy the root POM and the common POM
COPY pom.xml .
COPY common/pom.xml common/

# 3. Copy ALL poms from the services directory
# We copy the whole services folder but then quickly clean out
# everything that isn't a pom.xml to keep the layer small.
COPY services/ services/
RUN find services -type f ! -name "pom.xml" -delete

# 4. Resolve dependencies
# Now Maven sees the folder structure:
# /app/pom.xml
# /app/common/pom.xml
# /app/services/product-service/pom.xml
# /app/services/identity-service/pom.xml
# /app/services/archive-service/pom.xml
RUN mvn dependency:go-offline -B -pl services/product-service -am

# 5. Now copy the actual source code
COPY common/src common/src
COPY services/product-service/src services/product-service/src

# 6. Build the JAR
RUN mvn clean package -DskipTests -pl services/product-service -am

# 7. Final Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/services/product-service/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
