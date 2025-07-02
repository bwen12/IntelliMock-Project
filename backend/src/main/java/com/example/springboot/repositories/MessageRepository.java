package com.example.springboot.repositories;

import com.example.springboot.models.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for performing CRUD operations on the Message collection in MongoDB.
 * Extends MongoRepository to provide basic CRUD functionality, along with custom queries.
 */
@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    /**
     * Finds all messages for a specific chat, ordered by creation date in ascending order.
     *
     * @param chatId The ID of the chat.
     * @return A list of messages for the given chat, ordered by creation date ascending.
     */
    List<Message> findByChatIdOrderByCreatedDateAsc(String chatId);

    /**
     * Finds all messages for a specific chat, ordered by creation date in descending order.
     *
     * @param chatId The ID of the chat.
     * @return A list of messages for the given chat, ordered by creation date descending.
     */
    List<Message> findByChatIdOrderByCreatedDateDesc(String chatId);

    /**
     * Counts the total number of messages for a specific chat.
     *
     * @param chatId The ID of the chat.
     * @return The number of messages associated with the given chat.
     */
    Integer countByChatId(String chatId);

    /**
     * Deletes all messages associated with a specific chat and email.
     *
     * @param chatId The ID of the chat.
     * @param email  The email of the user.
     */
    void deleteByChatIdAndEmail(String chatId, String email);
}