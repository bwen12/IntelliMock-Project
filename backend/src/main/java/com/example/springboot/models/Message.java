package com.example.springboot.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.format.annotation.DateTimeFormat;
import java.util.Date;

/**
 * Represents a message within a chat session.
 * This class is mapped to the "messages" collection in MongoDB.
 */
@Getter
@Setter
@Document(collection = "messages")
public class Message {

    @Id
    private String id;
    private String chatId;
    private String email;
    private String message;
    private String role;
    private Integer index;
    private Boolean isEnd;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Date createdDate;

    /**
     * Constructs a new Message instance with all fields provided.
     * 
     * @param chatId the ID of the chat this message belongs to
     * @param email the email of the user who sent the message
     * @param message the content of the message
     * @param role the role of the sender (e.g., "user" or "AI")
     * @param index the index of the message in the chat, used to order messages
     */
    public Message(String chatId, String email, String message, String role, Integer index, Boolean isEnd) {
        this.chatId = chatId;
        this.email = email;
        this.message = message;
        this.role = role;
        this.index = index;
        this.createdDate = new Date();
        this.isEnd = isEnd;
    }
}
