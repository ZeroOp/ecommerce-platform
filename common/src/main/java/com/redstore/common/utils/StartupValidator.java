package com.redstore.common.utils;

import java.util.List;

public class StartupValidator {

    public static void validate(String serviceName, List<String> requiredVars) {
        System.out.println("--- Starting Validation for: " + serviceName + " ---");

        for (String var : requiredVars) {
            String value = System.getenv(var);
            if (value == null || value.trim().isEmpty()) {
                // Use a standard Error format so your logs are easy to search
                throw new IllegalStateException(
                        String.format("[%s] FATAL: Missing Environment Variable: %s", serviceName, var)
                );
            }
        }
        System.out.println("--- All " + requiredVars.size() + " secrets verified. ---");
    }
}