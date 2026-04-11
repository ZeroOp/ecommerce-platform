package com.redstore.identity.config;

import com.redstore.common.utils.CurrentUserInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Bean
    public CurrentUserInterceptor currentUserInterceptor() {
        return new CurrentUserInterceptor();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Register the CurrentUserInterceptor to apply to all endpoints
        registry.addInterceptor(currentUserInterceptor())
                .addPathPatterns("/api/**"); // Apply to all API endpoints
    }
}
