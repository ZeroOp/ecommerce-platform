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
RUN sh -c 'for i in 1 2 3 4 5; do \
  mvn -B -U -Dmaven.wagon.http.retryHandler.count=5 dependency:go-offline -pl services/product-service -am && exit 0; \
  echo "Retrying Maven dependency download ($i/5)..." && sleep 5; \
done; \
echo "Maven dependency resolution failed after retries." && exit 1'

# 5. Now copy the actual source code
COPY common/src common/src
COPY services/product-service/src services/product-service/src

# 6. Build the JAR
RUN sh -c 'for i in 1 2 3 4 5; do \
  mvn -B -U clean package -DskipTests -pl services/product-service -am && exit 0; \
  echo "Retrying Maven package build ($i/5)..." && sleep 5; \
done; \
echo "Maven package build failed after retries." && exit 1'

# 7. Final Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/services/product-service/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
