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

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(clientId))
                .build();

        GoogleIdToken idToken = verifier.verify(token);

        if (idToken != null) {
            return idToken.getPayload();
        }

        throw new RuntimeException("Invalid Google token");
    }
}