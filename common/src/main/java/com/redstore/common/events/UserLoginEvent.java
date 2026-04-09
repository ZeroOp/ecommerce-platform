package com.redstore.common.events;

import com.redstore.common.dto.UserLoginEventData;
import com.redstore.common.enums.Subjects;

public class UserLoginEvent implements Event<UserLoginEventData> {

    private final UserLoginEventData data;

    public UserLoginEvent(UserLoginEventData data) {
        this.data = data;
    }

    @Override
    public Subjects getSubject() {
        return Subjects.USER_LOGIN;
    }

    @Override
    public UserLoginEventData getData() {
        return this.data;
    }
}