FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY pom.xml .
COPY common/pom.xml common/
COPY services/ services/
RUN find services -type f ! -name 'pom.xml' -delete

RUN sh -c 'for i in 1 2 3 4 5; do \
  mvn -B -U -Dmaven.wagon.http.retryHandler.count=5 dependency:go-offline -pl services/order-service -am && exit 0; \
  echo "Retrying Maven dependency download ($i/5)..." && sleep 5; \
done; \
echo "Maven dependency resolution failed after retries." && exit 1'

COPY common/src common/src
COPY services/order-service/src services/order-service/src

RUN sh -c 'for i in 1 2 3 4 5; do \
  mvn -B -U clean package -DskipTests -pl services/order-service -am && exit 0; \
  echo "Retrying Maven package build ($i/5)..." && sleep 5; \
done; \
echo "Maven package build failed after retries." && exit 1'

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/services/order-service/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
