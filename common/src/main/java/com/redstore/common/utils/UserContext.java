package com.redstore.common.utils;

import com.redstore.common.dto.UserPayload;

public class UserContext {
    private static final ThreadLocal<UserPayload> currentUser = new ThreadLocal<>();

    public static void setUser(UserPayload user) {
        currentUser.set(user);
    }

    public static UserPayload getUser() {
        return currentUser.get();
    }

    public static void clear() {
        currentUser.remove(); // Crucial to prevent memory leaks!
    }
}