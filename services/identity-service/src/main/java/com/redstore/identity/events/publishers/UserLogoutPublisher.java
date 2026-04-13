package com.redstore.identity.events.publishers;

import com.redstore.common.enums.Subjects;
import com.redstore.common.events.BasePublisher;
import com.redstore.common.dto.UserLogoutEventData;
import io.nats.client.JetStream;
import org.springframework.stereotype.Component;

@Component
public class UserLogoutPublisher extends BasePublisher<UserLogoutEventData> {

    public UserLogoutPublisher(JetStream js) {
        super(js);
    }

    @Override
    protected Subjects getSubject() {
        return Subjects.USER_LOGOUT;
    }
}
