package com.example.springboot.repositories;

import com.example.springboot.models.Summary;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Repository interface for accessing and managing Summary documents in MongoDB.
 * Extends MongoRepository to provide standard CRUD operations along with custom queries.
 */
public interface SummaryRepository extends MongoRepository<Summary, String> {

    /**
     * Finds the summary associated with a specific chat.
     *
     * @param chatId The ID of the chat session.
     * @return The Summary document for the given chat ID, or null if not found.
     */
    Summary findByChatId(String chatId);

    /**
     * Deletes a summary based on chat ID and user email.
     *
     * @param chatId The ID of the chat session.
     * @param email  The email of the user who owns the summary.
     */
    void deleteByChatIdAndEmail(String chatId, String email);

}