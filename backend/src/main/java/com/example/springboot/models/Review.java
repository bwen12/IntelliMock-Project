package com.example.springboot.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * Represents a review for a chat session.
 * This includes the chat ID, the user's email, and a list of individual question reviews.
 */
@Getter
@Setter
@Document(collection = "reviews")
public class Review {

    @Id
    private String id;
    
    private String chatId;
    private String email;
    private List<QuestionReview> reviews;

    /**
     * Represents a single review for a specific question.
     * Includes details such as the answer, strengths, weaknesses, exemplar, and rating.
     */
    @Getter
    @Setter
    public static class QuestionReview {
        private String question;    
        private String answer;     
        private String strengths; 
        private String weaknesses;
        private String exemplar;    
        private String rating;
    }
}
