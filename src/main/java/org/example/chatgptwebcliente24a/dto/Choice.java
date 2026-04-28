package org.example.chatgptwebcliente24a.dto;

import com.fasterxml.jackson.annotation.*;

import javax.annotation.processing.Generated;
import java.util.LinkedHashMap;
import java.util.Map;

// Fortæller Jackson at felter med null-værdier ikke må med i JSON
@JsonInclude(JsonInclude.Include.NON_NULL)
// Bestemmer rækkefølgen af felterne i JSON
@JsonPropertyOrder({
    "index",
    "message",
    "logprobs",
    "finish_reason"
})
// Denne klasse er auto-genereret fra Groq API's JSON-schema
@Generated("jsonschema2pojo")
// Repræsenterer ét enkelt svar fra AI'en — Groq kan sende flere svar, vi bruger index 0
public class Choice {

    // Nummeret på dette svar (starter fra 0)
    @JsonProperty("index")
    private Integer index;

    // Selve AI-svaret som et Message-objekt med role og content
    @JsonProperty("message")
    private Message message;

    // Log-sandsynligheder for tokens — bruges ikke i vores app
    @JsonProperty("logprobs")
    private Object logprobs;

    // Årsagen til at AI'en stoppede med at generere — fx "stop" eller "length"
    @JsonProperty("finish_reason")
    private String finishReason;

    // Gemmer eventuelle ekstra JSON-felter vi ikke har defineret
    @JsonIgnore
    private Map<String, Object> additionalProperties = new LinkedHashMap<String, Object>();

    // Returnerer index-nummeret
    @JsonProperty("index")
    public Integer getIndex() {
        return index;
    }

    // Sætter index-nummeret
    @JsonProperty("index")
    public void setIndex(Integer index) {
        this.index = index;
    }

    // Returnerer AI-svaret som Message-objekt
    @JsonProperty("message")
    public Message getMessage() {
        return message;
    }

    // Sætter AI-svaret
    @JsonProperty("message")
    public void setMessage(Message message) {
        this.message = message;
    }

    // Returnerer log-sandsynligheder (bruges ikke)
    @JsonProperty("logprobs")
    public Object getLogprobs() {
        return logprobs;
    }

    // Sætter log-sandsynligheder
    @JsonProperty("logprobs")
    public void setLogprobs(Object logprobs) {
        this.logprobs = logprobs;
    }

    // Returnerer årsagen til at genereringen stoppede
    @JsonProperty("finish_reason")
    public String getFinishReason() {
        return finishReason;
    }

    // Sætter årsagen til at genereringen stoppede
    @JsonProperty("finish_reason")
    public void setFinishReason(String finishReason) {
        this.finishReason = finishReason;
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
