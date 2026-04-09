package com.redstore.common.events;

import com.redstore.common.enums.Subjects;

public interface Event<T> {
    Subjects getSubject();
    T getData();
}