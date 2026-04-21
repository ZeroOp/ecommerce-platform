FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY pom.xml .
COPY common/pom.xml common/

# 3. Copy ALL poms explicitly to preserve Docker cache
COPY services/identity-service/pom.xml services/identity-service/
COPY services/archive-service/pom.xml services/archive-service/
COPY services/product-service/pom.xml services/product-service/
COPY services/inventory-service/pom.xml services/inventory-service/
COPY services/cart-service/pom.xml services/cart-service/
COPY services/search-service/pom.xml services/search-service/
COPY services/order-service/pom.xml services/order-service/
COPY services/expiration-service/pom.xml services/expiration-service/
COPY services/deal-service/pom.xml services/deal-service/

RUN sh -c 'for i in 1 2 3 4 5; do \
  mvn -B -U -Dmaven.wagon.http.retryHandler.count=5 dependency:go-offline -pl services/inventory-service -am && exit 0; \
  echo "Retrying Maven dependency download ($i/5)..." && sleep 5; \
done; \
echo "Maven dependency resolution failed after retries." && exit 1'

COPY common/src common/src
COPY services/inventory-service/src services/inventory-service/src

RUN sh -c 'for i in 1 2 3 4 5; do \
  mvn -B -U clean package -DskipTests -pl services/inventory-service -am && exit 0; \
  echo "Retrying Maven package build ($i/5)..." && sleep 5; \
done; \
echo "Maven package build failed after retries." && exit 1'

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/services/inventory-service/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
