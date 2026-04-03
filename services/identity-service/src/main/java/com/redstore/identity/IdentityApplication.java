package com.redstore.identity;

import com.redstore.common.utils.StartupValidator;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@SpringBootApplication
@RestController // This allows us to handle HTTP requests directly in this file
public class IdentityApplication {

    public static void main(String[] args) {
        // 1. Define what THIS service specifically needs
        List<String> identitySecrets = List.of(
                "JWT_KEY",
                "SPRING_DATASOURCE_URL",
                "SPRING_DATASOURCE_USERNAME",
                "SPRING_DATASOURCE_PASSWORD"
        );

        // 2. Call the common validator
        StartupValidator.validate("Identity-Service", identitySecrets);

        // 3. Start Spring
        SpringApplication.run(IdentityApplication.class, args);
    }
}