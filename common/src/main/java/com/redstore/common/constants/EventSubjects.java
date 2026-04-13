package com.redstore.common.constants;

public class EventSubjects {
    
    // User identity events
    public static final String USER_CREATED = "identity.user.created";
    public static final String USER_LOGIN = "identity.user.login";
    public static final String USER_LOGOUT = "identity.user.logout";
    
    // Seller specific events
    public static final String SELLER_REGISTERED = "identity.seller.registered";
    public static final String SELLER_APPROVED = "identity.seller.approved";
    public static final String SELLER_REJECTED = "identity.seller.rejected";
    public static final String SELLER_LOGIN = "identity.seller.login";
    
    // Admin specific events
    public static final String ADMIN_LOGIN = "identity.admin.login";
    
    // Authentication events
    public static final String AUTH_SUCCESS = "identity.auth.success";
    public static final String AUTH_FAILURE = "identity.auth.failure";
}
