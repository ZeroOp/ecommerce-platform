# 1. Use the Maven image to build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# 2. Copy the root POM and the common POM
COPY pom.xml .
COPY common/pom.xml common/

# 3. Copy ALL poms from the services directory
# This satisfies Maven's module check for the entire project
COPY services/ services/
RUN find services -type f ! -name "pom.xml" -delete

# 4. Resolve dependencies
# We target the archive-service here
RUN sh -c 'for i in 1 2 3 4 5; do \
  mvn -B -U -Dmaven.wagon.http.retryHandler.count=5 dependency:go-offline -pl services/archive-service -am && exit 0; \
  echo "Retrying Maven dependency download ($i/5)..." && sleep 5; \
done; \
echo "Maven dependency resolution failed after retries." && exit 1'

# 5. Copy the actual source code needed for this build
COPY common/src common/src
COPY services/archive-service/src services/archive-service/src

# 6. Build the JAR
RUN sh -c 'for i in 1 2 3 4 5; do \
  mvn -B -U clean package -DskipTests -pl services/archive-service -am && exit 0; \
  echo "Retrying Maven package build ($i/5)..." && sleep 5; \
done; \
echo "Maven package build failed after retries." && exit 1'

# 7. Final Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar specifically from the archive-service target folder
COPY --from=build /app/services/archive-service/target/*.jar app.jar

# Adjust the port if your archive-service runs on a different one (e.g., 8082)
EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]