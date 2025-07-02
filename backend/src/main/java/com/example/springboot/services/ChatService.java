package com.example.springboot.services;

import com.example.springboot.models.Chat;
import com.example.springboot.models.Message;
import com.example.springboot.repositories.ChatRepository;
import com.example.springboot.repositories.MessageRepository;
import com.example.springboot.repositories.UserRepository;
import dev.langchain4j.model.chat.ChatLanguageModel;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service class that manages chat sessions, including chat creation, message
 * exchange,
 * prompt generation, and AI-driven interviewer logic.
 */
@Service
public class ChatService {

    private final UserRepository userRepository;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final ChatLanguageModel chatLanguageModel;

    /**
     * Constructs a ChatService with the necessary dependencies.
     */
    public ChatService(UserRepository userRepository,
            ChatRepository chatRepository,
            MessageRepository messageRepository,
            ChatLanguageModel chatLanguageModel) {
        this.userRepository = userRepository;
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.chatLanguageModel = chatLanguageModel;
    }

    /**
     * Checks if a chat name already exists for a specific user.
     *
     * @param email    the user's email
     * @param chatName the name of the chat
     * @return true if the chat name exists, false otherwise
     */
    public boolean chatNameExists(String email, String chatName) {
        return chatRepository.findByEmailAndChatName(email, chatName).isPresent();
    }

    /**
     * Creates a new chat session and generates the first interviewer message.
     *
     * @param email the user’s email
     * @param chat  the Chat object containing metadata
     * @return the saved Chat object
     */
    public Chat createChat(String email, Chat chat) {
        if (userRepository.findByEmail(email) == null) {
            throw new RuntimeException("User does not exist.");
        }

        chat.setEmail(email);
        if (chat.getContext() == null || chat.getContext().isBlank()) {
            chat.setContext("No additional context provided.");
        }

        String prompt = buildWelcomePrompt(chat);
        String llmResponse = chatLanguageModel.generate(prompt);

        Chat savedChat = chatRepository.save(chat);
        messageRepository.save(new Message(savedChat.getId(), email, llmResponse, "Interviewer", 1, false));

        return savedChat;
    }

    /**
     * Returns all chat sessions associated with a specific user.
     *
     * @param email the user’s email
     * @return list of Chat objects
     */
    public List<Chat> getUserChats(String email) {
        return chatRepository.findByEmail(email);
    }

    /**
     * Returns all messages from a specific chat, sorted by timestamp.
     *
     * @param chatId the chat ID
     * @return list of Message objects
     */
    public List<Message> getChatMessages(String chatId) {
        return messageRepository.findByChatIdOrderByCreatedDateAsc(chatId);
    }

    /**
     * Sends a user message and processes the AI response based on the conversation
     * context.
     * Also detects if the AI has concluded the interview via `isEnd = true` marker.
     *
     * @param message the user’s message
     * @return the AI’s textual response
     */
    public String sendMessage(Message message) {
        String chatId = message.getChatId();
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found."));

        int index = messageRepository.countByChatId(chatId) + 1;
        message.setIndex(index);
        messageRepository.save(message);

        String conversationContext = buildMessageHistory(chatId);
        String prompt = buildFollowUpPrompt(chat, index, conversationContext, message);
        String aiResponse = chatLanguageModel.generate(prompt);
        boolean isEnd = false;

        if (aiResponse.contains("isEnd = true")) {
            isEnd = true;
            aiResponse = aiResponse.replace("isEnd = true", "").trim();
        } else if (aiResponse.contains("isEnd = false")) {
            aiResponse = aiResponse.replace("isEnd = false", "").trim();
        }

        Message aiMessage = new Message(chatId, message.getEmail(), aiResponse, "Interviewer", index + 1, isEnd);
        messageRepository.save(aiMessage);

        return aiResponse;
    }

    /**
     * Updates the total elapsed time for a given chat session.
     *
     * @param chatId      the chat ID
     * @param elapsedTime the time in milliseconds
     */
    public void updateElapsedTime(String chatId, long elapsedTime) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found."));
        chat.setTimeElapsed(elapsedTime);
        chatRepository.save(chat);
    }

    // ==============
    // Helper Methods
    // ==============

    /**
     * Builds a string representation of previous messages for inclusion in the AI
     * prompt.
     *
     * @param chatId the chat session ID
     * @return formatted conversation history
     */
    private String buildMessageHistory(String chatId) {
        List<Message> messages = messageRepository.findByChatIdOrderByCreatedDateAsc(chatId);
        StringBuilder context = new StringBuilder();
        for (Message msg : messages) {
            context.append(msg.getRole()).append(": ").append(msg.getMessage()).append("\n");
        }
        return context.toString();
    }

    /**
     * Constructs the welcome message prompt to be sent to the LLM when a chat is
     * created.
     *
     * @param chat the chat context
     * @return the formatted LLM prompt string
     */
    private String buildWelcomePrompt(Chat chat) {
        return String.format(
                "You are a professional interviewer for the company described below.\n\n" +
                        "Based on the candidate's CV, the job description, and additional context, " +
                        "generate a structured and professional welcome message for the candidate, " +
                        "introducing yourself and setting the stage for the interview.\n\n" +
                        "Candidate's CV:\n%s\n\n" +
                        "Job Description:\n%s\n\n" +
                        "Company Context:\n%s\n\n" +
                        "Job Title:\n%s\n\n" +
                        "Company Name:\n%s\n\n" +
                        "Your response should:\n" +
                        "- Introduce yourself as a hiring manager from the given company.\n" +
                        "- Welcome the candidate in a friendly and professional manner.\n" +
                        "- Give a brief overview of the company and the role.\n" +
                        "- Set expectations for the interview process.\n" +
                        "- Keep the tone engaging and make the candidate feel comfortable.\n\n" +
                        "- Make sure to pretend to be face to face with the candidate in person\n\n" +
                        "- If no intervier name is given, create a random name for yourself and take on that persona\n\n"
                        +
                        "- Make sure to not add any metadata such as interviewer or other information, just give the exact response that the person would say\n\n"
                        +
                        "- Make sure to sound like a human as much as possible, don't be overly enthusiatic or sad, just sound as normal as possible, and also make sure to be respectful\n\n"
                        +
                        "Now, generate the interviewer’s welcome message:",
                chat.getCv(), chat.getJobDescription(), chat.getContext(), chat.getJobTitle(), chat.getCompanyName());
    }

    /**
     * Builds the prompt for the AI to continue the mock interview based on
     * conversation so far.
     *
     * @param chat             the current chat object
     * @param index            the index of the latest message
     * @param previousMessages compiled string of previous messages
     * @param message          the most recent user message
     * @return the formatted LLM prompt string
     */
    private String buildFollowUpPrompt(Chat chat, int index, String previousMessages, Message message) {
        return String.format(
                "You are a professional interviewer for the company described below.\n\n" +
                        "The candidate is applying for the role and you will conduct a **mock interview** based on the provided information.\n\n"
                        +
                        "**Candidate Information:**\n" +
                        "- CV:\n%s\n\n" +
                        "- Job Description:\n%s\n\n" +
                        "- Company Context:\n%s\n\n" +
                        "- Job Title:\n%s\n\n" +
                        "- Company Name:\n%s\n\n" +
                        "- Current number of messages in the chat: %d\n\n" +
                        "- Please limit the interview to around 8 questions unless the candidate gives unusually short answers or asks follow-up questions. \n"
                        +
                        "- If the interview feels complete, end the conversation with a polite closing message.\n" +
                        "### Previous Conversation Context:\n" +
                        "%s\n\n" +
                        "Now, the candidate has sent a new message:\n\n" +
                        "**Candidate:** %s\n\n" +
                        "Your task:\n" +
                        "- Respond naturally as an interviewer from the company.\n" +
                        "- Keep your responses professional, yet engaging.\n" +
                        "- Pretend this is an in-person interview.\n" +
                        "- If no interviewer name is given, create one and maintain that persona.\n\n" +
                        "- Make sure to not add any metadata such as interviewer or other information, just give the exact response that the person would say\n\n"
                        +
                        "- Make sure to sound like a human as much as possible, don't be overly enthusiatic or sad, just sound as normal as possible, and also make sure to be respectful\n\n"
                        +
                        "- Review the previous conversation carefully.\n" +
                        "- If the candidate has already given 2 or more irrelevant, incoherent, or unprofessional answers, **you must end the interview now**.\n"
                        +
                        "- Make sure to be strict on what is irrelevant, incoherent, or unprofessional, like in a real professional interview setting. Do not try to be kind \n"
                        +
                        "- Use a polite but clear final message like: 'Thanks for your time. Based on how this conversation has progressed, it seems this might not be the right fit. We’ll end the interview here. Best of luck with your future endeavors.'\n"
                        +
                        "- Do not continue the interview beyond that.\n\n" +
                        "**Important:** At the end of your response, write `isEnd = true` **if you believe the interview has concluded**, or `isEnd = false` otherwise.\n"
                        +
                        "Generate the interviewer's next response:",
                chat.getCv(), chat.getJobDescription(), chat.getContext(), chat.getJobTitle(), chat.getCompanyName(),
                index, previousMessages.toString(), message.getMessage());
    }
}