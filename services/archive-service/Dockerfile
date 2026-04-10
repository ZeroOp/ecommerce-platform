FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY pom.xml .
COPY common/pom.xml common/
COPY services/archive-service/pom.xml services/archive-service/

RUN mvn dependency:go-offline -B -pl services/archive-service -am

COPY common/src common/src
COPY services/archive-service/src services/archive-service/src

RUN mvn clean package -DskipTests -pl services/archive-service -am

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/services/archive-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]