package com.example.springboot.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.chat.request.ChatRequestParameters;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for setting up LangChain4j's integration with OpenAI.
 * 
 * <p>This class reads the OpenAI API key from the environment using a .env file,
 * and configures a {@link ChatLanguageModel} bean using the GPT-4o-mini model.</p>
 */
@Configuration
public class LangChainConfig {
    
    private final String openAiApiKey;

    /**
     * Loads the OpenAI API key from the environment using the dotenv library.
     * 
     * <p>If the API key is not found, a default fallback key is used (not recommended for production).</p>
     */
      public LangChainConfig(@Value("${openai.api.key}") String openAiApiKey) {
        this.openAiApiKey = openAiApiKey;
    }

    /**
     * Defines a {@link ChatLanguageModel} bean configured to use OpenAI's GPT-4o-mini model.
     * 
     * <p>The model is configured with a temperature of 0.7 for balanced creativity and coherence.</p>
     *
     * @return a configured instance of {@link ChatLanguageModel}
     */
    @Bean
    public ChatLanguageModel chatLanguageModel() {
        return OpenAiChatModel.builder()
                .apiKey(openAiApiKey)
                .defaultRequestParameters(ChatRequestParameters.builder()
                        .modelName("gpt-4o-mini")
                        .temperature(0.7)
                        .build())
                .build();
    }
}
