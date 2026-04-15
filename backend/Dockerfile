FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /build

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests && \
    artifact="$(find target -maxdepth 1 \( -name '*.jar' -o -name '*.war' \) | head -n 1)" && \
    test -n "$artifact" && \
    cp "$artifact" /build/app.jar

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /build/app.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
