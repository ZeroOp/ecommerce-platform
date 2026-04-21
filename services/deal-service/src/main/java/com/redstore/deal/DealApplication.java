package com.redstore.deal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {"com.redstore.deal", "com.redstore.common"})
@EnableScheduling
public class DealApplication {
    public static void main(String[] args) {
        SpringApplication.run(DealApplication.class, args);
    }
}
