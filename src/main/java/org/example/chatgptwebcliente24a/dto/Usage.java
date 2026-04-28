package org.example.chatgptwebcliente24a.dto;

import com.fasterxml.jackson.annotation.*;

import javax.annotation.processing.Generated;
import java.util.LinkedHashMap;
import java.util.Map;

// Fortæller Jackson at felter med null-værdier ikke må med i JSON
@JsonInclude(JsonInclude.Include.NON_NULL)
// Bestemmer rækkefølgen af felterne i JSON
@JsonPropertyOrder({
    "prompt_tokens",
    "completion_tokens",
    "total_tokens",
    "prompt_tokens_details",
    "completion_tokens_details"
})
// Denne klasse er auto-genereret fra Groq API's JSON-schema
@Generated("jsonschema2pojo")
// Viser hvor mange tokens der blev brugt på denne request — bruges til at holde styr på API-forbrug
public class Usage {

    // Antal tokens brugt på vores prompt (spørgsmålet vi sendte)
    @JsonProperty("prompt_tokens")
    private Integer promptTokens;

    // Antal tokens brugt på AI'ens svar
    @JsonProperty("completion_tokens")
    private Integer completionTokens;

    // Det samlede antal tokens (prompt + svar)
    @JsonProperty("total_tokens")
    private Integer totalTokens;

    // Detaljerede oplysninger om prompt-tokens
    @JsonProperty("prompt_tokens_details")
    private PromptTokensDetails promptTokensDetails;

    // Detaljerede oplysninger om completion-tokens
    @JsonProperty("completion_tokens_details")
    private CompletionTokensDetails completionTokensDetails;

    // Gemmer eventuelle ekstra JSON-felter vi ikke har defineret
    @JsonIgnore
    private Map<String, Object> additionalProperties = new LinkedHashMap<String, Object>();

    // Returnerer antal prompt-tokens
    @JsonProperty("prompt_tokens")
    public Integer getPromptTokens() {
        return promptTokens;
    }

    // Sætter antal prompt-tokens
    @JsonProperty("prompt_tokens")
    public void setPromptTokens(Integer promptTokens) {
        this.promptTokens = promptTokens;
    }

    // Returnerer antal completion-tokens
    @JsonProperty("completion_tokens")
    public Integer getCompletionTokens() {
        return completionTokens;
    }

    // Sætter antal completion-tokens
    @JsonProperty("completion_tokens")
    public void setCompletionTokens(Integer completionTokens) {
        this.completionTokens = completionTokens;
    }

    // Returnerer det samlede token-forbrug
    @JsonProperty("total_tokens")
    public Integer getTotalTokens() {
        return totalTokens;
    }

    // Sætter det samlede token-forbrug
    @JsonProperty("total_tokens")
    public void setTotalTokens(Integer totalTokens) {
        this.totalTokens = totalTokens;
    }

    // Returnerer detaljerne om prompt-tokens
    @JsonProperty("prompt_tokens_details")
    public PromptTokensDetails getPromptTokensDetails() {
        return promptTokensDetails;
    }

    // Sætter detaljerne om prompt-tokens
    @JsonProperty("prompt_tokens_details")
    public void setPromptTokensDetails(PromptTokensDetails promptTokensDetails) {
        this.promptTokensDetails = promptTokensDetails;
    }

    // Returnerer detaljerne om completion-tokens
    @JsonProperty("completion_tokens_details")
    public CompletionTokensDetails getCompletionTokensDetails() {
        return completionTokensDetails;
    }

    // Sætter detaljerne om completion-tokens
    @JsonProperty("completion_tokens_details")
    public void setCompletionTokensDetails(CompletionTokensDetails completionTokensDetails) {
        this.completionTokensDetails = completionTokensDetails;
    }

    // Returnerer eventuelle ekstra JSON-felter
    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    // Gemmer ukendte JSON-felter fra Groq's svar
    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

}
