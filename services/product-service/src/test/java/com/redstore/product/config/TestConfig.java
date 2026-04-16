package com.redstore.product.config;

import com.redstore.common.aspect.RoleValidationAspect;
import com.redstore.common.utils.CurrentUserInterceptor;
import com.redstore.common.utils.JwtUtils;
import com.redstore.common.utils.UserContext;
import com.redstore.common.dto.UserPayload;
import com.redstore.common.enums.UserRole;
import com.redstore.product.util.TestJwtUtilsForTesting;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.http.Cookie;
import java.util.List;
import java.util.Set;

/**
 * Test configuration for mocking authorization components
 */
@TestConfiguration
@EnableAspectJAutoProxy
@Import({RoleValidationAspect.class, com.redstore.common.exceptions.GlobalExceptionHandler.class})
public class TestConfig implements WebMvcConfigurer {
    
    @Override
    public void configureMessageConverters(List<org.springframework.http.converter.HttpMessageConverter<?>> converters) {
        converters.add(new MappingJackson2HttpMessageConverter());
    }
    
    @Override
    public void addInterceptors(org.springframework.web.servlet.config.annotation.InterceptorRegistry registry) {
        registry.addInterceptor(currentUserInterceptor());
    }
    
    @Bean
    @Primary
    public RoleValidationAspect roleValidationAspect() {
        return new RoleValidationAspect();
    }
    
    @Bean
    @Primary
    public CurrentUserInterceptor currentUserInterceptor() {
        return new CurrentUserInterceptor();
    }
}
