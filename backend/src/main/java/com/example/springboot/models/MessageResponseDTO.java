package com.example.springboot.models;

import java.util.List;

/**
 * Data Transfer Object (DTO) used to encapsulate the response for a chat's messages.
 * It includes the list of messages and the total count of those messages.
 */
public class MessageResponseDTO {

    private List<Message> messages;
    private int count;

    /**
     * Constructs a new MessageResponseDTO instance.
     * 
     * @param messages the list of messages to be included in the response
     */
    public MessageResponseDTO(List<Message> messages) {
        this.messages = messages;
        this.count = messages.size();
    }

    /**
     * Gets the list of messages.
     * 
     * @return a list of Message objects
     */
    public List<Message> getMessages() {
        return messages;
    }

    /**
     * Gets the total number of messages in the response.
     * 
     * @return the count of messages
     */
    public int getCount() {
        return count;
    }
}
