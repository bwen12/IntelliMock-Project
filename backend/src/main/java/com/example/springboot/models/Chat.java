package com.example.springboot.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

/**
 * Represents a chat session in the application.
 * This class is mapped to the "chats" collection in MongoDB.
 */
@Getter
@Setter
@Document(collection = "chats")
public class Chat {

    @Id
    private String id;

    private String chatName;
    private String companyName;
    private String email;
    private String jobTitle;
    private String cv;
    private String jobDescription;
    private String context;
    private long timeElapsed;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Date createdDate;

    /**
     * Constructs a new Chat instance with all fields provided.
     * 
     * @param chatName the name of the chat session
     * @param companyName the company name associated with the chat
     * @param email the email of the user initiating the chat
     * @param jobTitle the job title for the chat context
     * @param cv the CV text associated with the chat
     * @param jobDescription the job description related to the chat
     * @param context optional additional context for the chat
     */
    public Chat(String chatName, String companyName, String email, String jobTitle, String cv, String jobDescription, String context) {
        this.chatName = chatName;
        this.companyName = companyName;
        this.email = email;
        this.jobTitle = jobTitle;
        this.cv = cv;
        this.jobDescription = jobDescription;
        this.context = context;
        this.timeElapsed = 0L;
        this.createdDate = new Date();
    }

    /**
     * Constructs a new Chat instance without the optional context field.
     * 
     * @param chatName the name of the chat session
     * @param companyName the company name associated with the chat
     * @param email the email of the user initiating the chat
     * @param jobTitle the job title for the chat context
     * @param cv the CV text associated with the chat
     * @param jobDescription the job description related to the chat
     */
    public Chat(String chatName, String companyName, String email, String jobTitle, String cv, String jobDescription) {
        this(chatName, companyName, email, jobTitle, cv, jobDescription, null);
    }

    /**
     * Default constructor for creating a new Chat instance with the current date.
     */
    public Chat() {
        this.createdDate = new Date();
    }
}
