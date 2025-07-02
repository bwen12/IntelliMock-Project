package com.example.springboot.services;

import com.example.springboot.models.Chat;
import com.example.springboot.models.Message;
import com.example.springboot.models.Review;
import com.example.springboot.models.Summary;
import com.example.springboot.repositories.ChatRepository;
import com.example.springboot.repositories.MessageRepository;
import com.example.springboot.repositories.SummaryRepository;
import com.example.springboot.repositories.ReviewRepository;
import dev.langchain4j.model.chat.ChatLanguageModel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service responsible for generating AI-driven summaries and detailed reviews
 * for mock interview sessions using a language model.
 */
@Service
public class ReviewService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final SummaryRepository summaryRepository;
    private final ReviewRepository reviewRepository;
    private final ChatLanguageModel llm;

    /**
     * Constructs a new ReviewService with all required dependencies.
     */
    public ReviewService(ChatRepository chatRepository,
            MessageRepository messageRepository,
            SummaryRepository summaryRepository,
            ReviewRepository reviewRepository,
            ChatLanguageModel llm) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.summaryRepository = summaryRepository;
        this.reviewRepository = reviewRepository;
        this.llm = llm;
    }

    /**
     * Generates and saves a summary of the candidate's interview performance.
     *
     * @param token  JWT token of the user (not currently used).
     * @param chatId ID of the chat session.
     * @return the saved Summary object.
     */
    public Summary createSummary(String token, String chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        String interviewContext = buildChatTranscript(chatId);
        int count = messageRepository.countByChatId(chatId);

        if (count <= 1) {
            Summary summary = new Summary();
            summary.setChatId(chat.getId());
            summary.setEmail(chat.getEmail());
            summary.setSummary(
                    "The candidate did not provide any responses in the interview, so no evaluation can be made.");
            summary.setScore(0);
            return summaryRepository.save(summary);
        }

        String prompt = buildSummaryPrompt(chat, interviewContext);
        String response = llm.generate(prompt);

        String[] parts = response.split("(?i)Score:\\s*");
        String summaryText = parts[0].trim();
        int score = extractScoreFrom(parts);

        Summary summary = new Summary();
        summary.setChatId(chat.getId());
        summary.setEmail(chat.getEmail());
        summary.setSummary(summaryText);
        summary.setScore(score);

        return summaryRepository.save(summary);
    }

    /**
     * Generates a question-by-question review of the candidate's interview.
     *
     * @param email  the user's email.
     * @param chatId ID of the chat session.
     * @return the saved Review object.
     */
    public Review createReview(String email, String chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        List<Message> messages = messageRepository.findByChatIdOrderByCreatedDateAsc(chatId);
        List<Review.QuestionReview> reviews = new ArrayList<>();
        Message lastQuestion = null;

        for (int i = 0; i < messages.size(); i++) {
            Message currentMessage = messages.get(i);

            if ("Interviewer".equalsIgnoreCase(currentMessage.getRole())) {
                lastQuestion = currentMessage;
            }

            if ("User".equalsIgnoreCase(currentMessage.getRole())) {
                String question = lastQuestion != null ? lastQuestion.getMessage() : "";
                String answer = currentMessage.getMessage();
                String contextSoFar = buildPartialTranscript(messages, i);

                String prompt = buildReviewPrompt(chat, contextSoFar, question, answer);
                String reviewText = llm.generate(prompt);
                System.out.println("ReviewText: " + reviewText);

                Review.QuestionReview qr = extractReviewSections(reviewText, question, answer);
                reviews.add(qr);
            }
        }

        Review review = new Review();
        review.setChatId(chatId);
        review.setEmail(email);
        review.setReviews(reviews);
        return reviewRepository.save(review);
    }

    /**
     * Fetches the summary for a given chat session.
     *
     * @param chatId the chat ID.
     * @return the Summary object.
     * @throws RuntimeException if not found.
     */
    public Summary getSummary(String chatId) {
        Summary summary = summaryRepository.findByChatId(chatId);
        if (summary == null)
            throw new RuntimeException("Summary not found");
        return summary;
    }

    /**
     * Fetches the review for a given chat session.
     *
     * @param chatId the chat ID.
     * @return the Review object.
     * @throws RuntimeException if not found.
     */
    public Review getReview(String chatId) {
        Review review = reviewRepository.findByChatId(chatId);
        if (review == null)
            throw new RuntimeException("Review not found");
        return review;
    }

    /**
     * Deletes all data associated with an interview session.
     *
     * @param email  the user's email.
     * @param chatId the chat ID.
     */
    public void deleteInterviewSession(String email, String chatId) {
        summaryRepository.deleteByChatIdAndEmail(chatId, email);
        reviewRepository.deleteByChatIdAndEmail(chatId, email);
        chatRepository.deleteByIdAndEmail(chatId, email);
        messageRepository.deleteByChatIdAndEmail(chatId, email);
    }

    // --------------
    // Helper Methods
    // --------------

    /**
     * Builds the full transcript of messages for a given chat session.
     */
    private String buildChatTranscript(String chatId) {
        List<Message> messages = messageRepository.findByChatIdOrderByCreatedDateAsc(chatId);
        StringBuilder context = new StringBuilder();
        for (Message m : messages) {
            context.append(m.getRole()).append(": ").append(m.getMessage()).append("\n");
        }
        return context.toString();
    }

    /**
     * Builds the transcript leading up to a specific message index.
     */
    private String buildPartialTranscript(List<Message> messages, int upToIndex) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < upToIndex; i++) {
            Message m = messages.get(i);
            sb.append(m.getRole()).append(": ").append(m.getMessage()).append("\n");
        }
        return sb.toString();
    }

    /**
     * Parses the score section from the LLM response.
     */
    private int extractScoreFrom(String[] parts) {
        try {
            return parts.length > 1 ? Integer.parseInt(parts[1].trim().split("\\s+")[0]) : 0;
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    /**
     * Builds the prompt used to generate a summary from the language model.
     */
    private String buildSummaryPrompt(Chat chat, String context) {
        return String.format(
                "You are summarizing a **mock interview** for a candidate based on the following:\n\n" +
                        "**CV:**\n%s\n\n" +
                        "**Job Description:**\n%s\n\n" +
                        "**Company Context:**\n%s\n\n" +
                        "**Job Title:**\n%s\n\n" +
                        "**Company Name:**\n%s\n\n" +
                        "**Interview Transcript:**\n%s\n\n" +
                        "Provide a professional summary of the candidate's performance. Your summary must include:\n" +
                        "- Overall performance\n" +
                        "- Communication strengths\n" +
                        "- Areas for improvement\n" +
                        "- Observations about tone and confidence\n\n" +
                        "Then, assign an overall **performance score from 1 to 10**, where:\n" +
                        "- 1–2: Poor – Very unprepared, unprofessional, or incoherent\n" +
                        "- 3–4: Below Average – Weak or unclear answers, lacks engagement\n" +
                        "- 5–6: Good – Reasonable responses but needs polish\n" +
                        "- 7–8: Very Good – Strong answers with good structure and confidence\n" +
                        "- 9–10: Exceptional – Outstanding clarity, confidence, and relevance throughout\n\n" +
                        "Format your output like this:\n\n" +
                        "Summary:\n[your written summary here]\n\n" +
                        "Score: [a number from 1 to 10]",
                chat.getCv(),
                chat.getJobDescription(),
                chat.getContext(),
                chat.getJobTitle(),
                chat.getCompanyName(),
                context);
    }

    /**
     * Builds the prompt used to request detailed feedback on a specific question
     * and answer.
     */
    private String buildReviewPrompt(Chat chat, String context, String question, String answer) {
        return String.format(
                "You are an expert technical interview coach. The interview is for a candidate applying to the following:\n\n"
                        +
                        "**Job Description:**\n%s\n\n" +
                        "**Company Context:**\n%s\n\n" +
                        "**CV:**\n%s\n\n" +
                        "### Context so far (earlier messages):\n%s\n\n" +
                        "Now analyse the following:\n\n" +
                        "**Question:** %s\n" +
                        "**Answer:** %s\n\n" +
                        "Respond in exactly the following format — all 4 sections must be present:\n\n" +
                        "STRENGTHS:\n[your analysis here]\n\n" +
                        "WEAKNESSES:\n[your analysis here]\n\n" +
                        "EXEMPLAR:\n[your improved answer here]\n\n" +
                        "RATING:\n[A number between 1-10.]\n\n" +
                        "Here is an example format:\n\n" +
                        "STRENGTHS:\n- Shows enthusiasm and confidence.\n\n" +
                        "WEAKNESSES:\n- Lacks detail on experience.\n\n" +
                        "EXEMPLAR:\n\"Thank you for the warm welcome. I’m very excited for this opportunity and to demonstrate how my experience can align with your needs.\"\n\n"
                        +
                        "RATING:\n7\n\n" +
                        "---\nNow apply this format to the following question and answer:\n\n",
                chat.getJobDescription(),
                chat.getContext(),
                chat.getCv(),
                context,
                question,
                answer);
    }

    /**
     * Extracts each section (strengths, weaknesses, exemplar, rating) from the
     * review output.
     */
    private Review.QuestionReview extractReviewSections(String text, String question, String answer) {
        String[] sections = text.split("(?i)STRENGTHS:|WEAKNESSES:|EXEMPLAR:|RATING:");

        Review.QuestionReview qr = new Review.QuestionReview();
        qr.setQuestion(question);
        qr.setAnswer(answer);
        qr.setStrengths(sections.length > 1 ? sections[1].trim() : "");
        qr.setWeaknesses(sections.length > 2 ? sections[2].trim() : "");
        qr.setExemplar(sections.length > 3 ? sections[3].trim() : "");
        qr.setRating(sections.length > 4 ? sections[4].trim() : "");

        return qr;
    }
}