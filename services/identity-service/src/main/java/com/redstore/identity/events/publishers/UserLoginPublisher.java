package com.redstore.identity.events.publishers;

import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import com.redstore.common.dto.UserLoginEventData; // The DTO we created earlier
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class UserLoginPublisher extends BasePublisher<UserLoginEventData> {

    public UserLoginPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.USER_LOGIN;
    }
}