package com.redstore.product.controller;

import com.redstore.product.util.TestJwtUtils;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=none",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
@Import(com.redstore.product.config.TestConfig.class)
class BrandControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void shouldReturn200ForGetAllBrands() throws Exception {
        mockMvc.perform(get("/brands"))
                .andExpect(status().isOk());
    }

    @Test
    public void shouldReturn401WhenCreatingBrandWithoutSellerCookie() throws Exception {
        String brandJson = "{\"name\":\"Test Brand\",\"description\":\"Test Description\"}";
        
        // Test without any authentication cookie - should return 401
        mockMvc.perform(post("/brands")
                .contentType(MediaType.APPLICATION_JSON)
                .content(brandJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void shouldReturn200WhenCreatingBrandWithSellerCookie() throws Exception {
        String brandJson = "{\"name\":\"Test Brand\",\"description\":\"Test Description\"}";
        
        // Test with seller authentication cookie - should return 200
        Cookie sellerCookie = TestJwtUtils.createSellerCookie();
        
        mockMvc.perform(post("/brands")
                .cookie(sellerCookie)
                .contentType(MediaType.APPLICATION_JSON)
                .content(brandJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Brand created successfully"))
                .andExpect(jsonPath("$.status").value("success"));
    }
}
