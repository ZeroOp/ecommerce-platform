package com.redstore.product.service;

import com.redstore.common.dto.UserPayload;
import com.redstore.common.exceptions.NotAuthorizedException;
import com.redstore.common.utils.UserContext;
import org.springframework.stereotype.Service;

@Service
public class AuthContextService {

    public UserPayload requireCurrentUser() {
        UserPayload currentUser = UserContext.getUser();
        if (currentUser == null) {
            throw new NotAuthorizedException();
        }
        return currentUser;
    }

    public String requireCurrentUserId() {
        return requireCurrentUser().getId();
    }
}
