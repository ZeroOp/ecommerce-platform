package com.redstore.common.events;

import com.redstore.common.dto.TokenRefreshedEventData;
import com.redstore.common.enums.Subjects;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class TokenRefreshedEvent implements Event<TokenRefreshedEventData> {

    @Override
    public Subjects getSubject() {
        return Subjects.TOKEN_REFRESHED;
    }

    @Override
    public TokenRefreshedEventData getData() {
        // In this pattern, the 'data' is passed during instantiation
        return this.data;
    }

    private final TokenRefreshedEventData data;
}