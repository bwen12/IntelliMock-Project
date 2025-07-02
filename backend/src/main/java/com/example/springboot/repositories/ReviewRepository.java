package com.example.springboot.repositories;

import com.example.springboot.models.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Repository interface for performing CRUD operations on the Review collection in MongoDB.
 * Extends MongoRepository to provide basic CRUD functionality, along with custom queries.
 */
public interface ReviewRepository extends MongoRepository<Review, String> {

    /**
     * Finds the review associated with a specific chat.
     *
     * @param chatId The ID of the chat.
     * @return The review associated with the given chat ID.
     */
    Review findByChatId(String chatId);

    /**
     * Deletes a review associated with a specific chat and email.
     *
     * @param chatId The ID of the chat.
     * @param email  The email of the user.
     */
    void deleteByChatIdAndEmail(String chatId, String email);
}