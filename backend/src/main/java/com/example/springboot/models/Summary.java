package com.example.springboot.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a summary for a chat session.
 * This includes the chat ID, the user's email, the summary text, and a score associated with the summary.
 */
@Getter
@Setter
@Document(collection = "summaries")
public class Summary {

    @Id
    private String id;
    private String chatId;
    private String email; 
    private String summary; 
    private Integer score;  
}