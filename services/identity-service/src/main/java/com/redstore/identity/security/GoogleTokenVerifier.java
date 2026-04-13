package com.redstore.identity.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.http.javanet.NetHttpTransport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class GoogleTokenVerifier {

    private final String clientId;

    public GoogleTokenVerifier(
            @Value("${GOOGLE_CLIENT_ID}") String clientId
    ) {
        this.clientId = clientId;
    }

    public GoogleIdToken.Payload verify(String token) throws Exception {
        // Debug logging
        System.out.println("Google Client ID loaded: " + clientId);

        // Use hardcoded client ID for development
        String fallbackClientId = "854136327852-v48sbh7hbb3145dmaq0kjt6aknpv6oms.apps.googleusercontent.com";
        System.out.println("Using Google Client ID: " + fallbackClientId);

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(fallbackClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(token);

        if (idToken != null) {
            return idToken.getPayload();
        }

        throw new RuntimeException("Invalid Google token");
    }
}