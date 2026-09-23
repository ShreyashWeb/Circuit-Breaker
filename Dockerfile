FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY pom.xml mvnw mvnw.cmd ./
COPY .mvn .mvn
COPY src src

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

EXPOSE 8083

CMD ["sh", "-c", "java -jar target/*.jar"]
