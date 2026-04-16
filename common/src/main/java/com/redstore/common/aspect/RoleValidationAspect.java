package com.redstore.common.aspect;

import com.redstore.common.annotations.RequireAdmin;
import com.redstore.common.annotations.RequireSeller;
import com.redstore.common.annotations.RequireUser;
import com.redstore.common.dto.UserPayload;
import com.redstore.common.enums.UserRole;
import com.redstore.common.exceptions.ForbiddenException;
import com.redstore.common.exceptions.NotAuthorizedException;
import com.redstore.common.utils.UserContext;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

/**
 * Aspect to handle role-based access control annotations
 */
@Aspect
@Component
@Slf4j
public class RoleValidationAspect {

    @Before("@annotation(requireAdmin)")
    public void validateAdminRole(JoinPoint joinPoint, RequireAdmin requireAdmin) {
        log.debug("Validating ADMIN role for method: {}", joinPoint.getSignature().getName());
        validateUserRole(UserRole.ADMIN);
    }

    @Before("@annotation(requireSeller)")
    public void validateSellerRole(JoinPoint joinPoint, RequireSeller requireSeller) {
        log.debug("Validating SELLER role for method: {}", joinPoint.getSignature().getName());
        validateUserRole(UserRole.SELLER);
    }

    @Before("@annotation(requireUser)")
    public void validateUserRole(JoinPoint joinPoint, RequireUser requireUser) {
        log.debug("Validating USER (BUYER) role for method: {}", joinPoint.getSignature().getName());
        validateUserRole(UserRole.BUYER);
    }

    /**
     * Validate that the current user has the required role
     */
    private void validateUserRole(UserRole requiredRole) {
        try {
            // Get user context from UserContext (set by CurrentUserInterceptor)
            UserPayload currentUser = UserContext.getUser();
            
            if (currentUser == null) {
                log.warn("No user context found in UserContext");
                throw new NotAuthorizedException();
            }

            // Validate user has required role
            if (currentUser.getRoles() == null || currentUser.getRoles().isEmpty()) {
                throw new ForbiddenException("User has no roles assigned");
            }

            boolean hasRequiredRole = currentUser.getRoles().stream()
                    .anyMatch(role -> role == requiredRole);

            if (!hasRequiredRole) {
                log.warn("User {} with roles {} attempted to access {} required resource", 
                        currentUser.getEmail(), 
                        currentUser.getRoles(), 
                        requiredRole);
                
                throw new ForbiddenException(requiredRole + " role is required to access this resource");
            }

            log.debug("User {} validated successfully for role {}", currentUser.getEmail(), requiredRole);

        } catch (NotAuthorizedException | ForbiddenException e) {
            // Re-throw our custom exceptions
            throw e;
        } catch (Exception e) {
            log.error("Error during role validation: {}", e.getMessage(), e);
            throw new NotAuthorizedException();
        }
    }
}
