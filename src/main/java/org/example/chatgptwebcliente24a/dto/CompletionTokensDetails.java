package org.example.chatgptwebcliente24a.dto;

import com.fasterxml.jackson.annotation.*;

import javax.annotation.processing.Generated;
import java.util.LinkedHashMap;
import java.util.Map;

// Fortæller Jackson at felter med null-værdier ikke må med i JSON
@JsonInclude(JsonInclude.Include.NON_NULL)
// Bestemmer rækkefølgen af felterne i JSON
@JsonPropertyOrder({
    "reasoning_tokens",
    "audio_tokens",
    "accepted_prediction_tokens",
    "rejected_prediction_tokens"
})
// Denne klasse er auto-genereret fra Groq API's JSON-schema
@Generated("jsonschema2pojo")
// Nedbryder token-forbruget på AI'ens svar i detaljer — sendt fra Groq, bruges ikke aktivt i vores app
public class CompletionTokensDetails {

    // Tokens brugt til intern reasoning/tænkning hos AI'en
    @JsonProperty("reasoning_tokens")
    private Integer reasoningTokens;

    // Tokens brugt til lyd (bruges ikke i vores app)
    @JsonProperty("audio_tokens")
    private Integer audioTokens;

    // Tokens fra forudsigelser som AI'en accepterede
    @JsonProperty("accepted_prediction_tokens")
    private Integer acceptedPredictionTokens;

    // Tokens fra forudsigelser som AI'en afviste
    @JsonProperty("rejected_prediction_tokens")
    private Integer rejectedPredictionTokens;

    // Gemmer eventuelle ekstra JSON-felter vi ikke har defineret
    @JsonIgnore
    private Map<String, Object> additionalProperties = new LinkedHashMap<String, Object>();

    // Returnerer reasoning-tokens
    @JsonProperty("reasoning_tokens")
    public Integer getReasoningTokens() {
        return reasoningTokens;
    }

    // Sætter reasoning-tokens
    @JsonProperty("reasoning_tokens")
    public void setReasoningTokens(Integer reasoningTokens) {
        this.reasoningTokens = reasoningTokens;
    }

    // Returnerer audio-tokens
    @JsonProperty("audio_tokens")
    public Integer getAudioTokens() {
        return audioTokens;
    }

    // Sætter audio-tokens
    @JsonProperty("audio_tokens")
    public void setAudioTokens(Integer audioTokens) {
        this.audioTokens = audioTokens;
    }

    // Returnerer antal accepterede prediction-tokens
    @JsonProperty("accepted_prediction_tokens")
    public Integer getAcceptedPredictionTokens() {
        return acceptedPredictionTokens;
    }

    // Sætter antal accepterede prediction-tokens
    @JsonProperty("accepted_prediction_tokens")
    public void setAcceptedPredictionTokens(Integer acceptedPredictionTokens) {
        this.acceptedPredictionTokens = acceptedPredictionTokens;
    }

    // Returnerer antal afviste prediction-tokens
    @JsonProperty("rejected_prediction_tokens")
    public Integer getRejectedPredictionTokens() {
        return rejectedPredictionTokens;
    }

    // Sætter antal afviste prediction-tokens
    @JsonProperty("rejected_prediction_tokens")
    public void setRejectedPredictionTokens(Integer rejectedPredictionTokens) {
        this.rejectedPredictionTokens = rejectedPredictionTokens;
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
