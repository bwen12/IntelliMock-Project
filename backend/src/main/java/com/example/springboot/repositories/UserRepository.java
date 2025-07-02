package com.example.springboot.repositories;

import com.example.springboot.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User documents stored in MongoDB.
 * Provides basic CRUD and custom query operations on the User collection.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Retrieves a user by their email address.
     *
     * @param email The unique email of the user.
     * @return An Optional containing the User if found, or empty otherwise.
     */
    Optional<User> findByEmail(String email);

}
