package com.example.springboot.repositories;

import com.example.springboot.models.Chat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for performing CRUD operations on the Chat collection in MongoDB.
 * Extends MongoRepository to provide basic CRUD functionality, along with custom queries.
 */
@Repository
public interface ChatRepository extends MongoRepository<Chat, String> {

    /**
     * Finds a chat by its name.
     *
     * @param chatName The name of the chat.
     * @return The Chat object corresponding to the given chat name.
     */
    Chat findByChatName(String chatName);

    /**
     * Finds all chats associated with a specific email.
     *
     * @param email The email of the user.
     * @return A list of chats associated with the given email.
     */
    List<Chat> findByEmail(String email);

    /**
     * Finds a chat by its name and the email of the user.
     *
     * @param email    The email of the user.
     * @param chatName The name of the chat.
     * @return An Optional containing the Chat object if found, or empty if not.
     */
    Optional<Chat> findByEmailAndChatName(String email, String chatName);

    /**
     * Deletes a chat by its ID and the email of the user.
     *
     * @param id    The ID of the chat.
     * @param email The email of the user.
     */
    void deleteByIdAndEmail(String id, String email);
}
