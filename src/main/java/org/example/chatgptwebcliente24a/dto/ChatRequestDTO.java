package org.example.chatgptwebcliente24a.dto;

// Importerer Jackson-annotations til at styre JSON-konvertering
import com.fasterxml.jackson.annotation.*;

import javax.annotation.processing.Generated;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// Fortæller Jackson at felter med null-værdier ikke må med i JSON
@JsonInclude(JsonInclude.Include.NON_NULL)
// Bestemmer rækkefølgen af felterne i JSON-outputtet
@JsonPropertyOrder({
    "model",
    "messages",
    "n",
    "temperature",
    "max_tokens",
    "stream",
    "presence_penalty"
})
// Denne klasse er auto-genereret fra Groq API's JSON-schema
@Generated("jsonschema2pojo")
// Repræsenterer den request vi sender til Groq API
public class ChatRequestDTO {

    // Hvilken AI-model der skal bruges, fx "llama-3.3-70b-versatile"
    @JsonProperty("model")
    private String model;

    // Listen af beskeder i samtalen (system + bruger)
    @JsonProperty("messages")
    private List<Message> messages;

    // Antal svar AI'en skal generere (vi bruger ikke dette aktivt)
    @JsonProperty("n")
    private Integer n;

    // Styrer kreativiteten i svaret — 0 = præcist, 1 = kreativt
    @JsonProperty("temperature")
    private Integer temperature;

    // Maks antal tokens i svaret
    @JsonProperty("max_tokens")
    private Integer maxTokens;

    // Om svaret skal streames løbende eller sendes samlet
    @JsonProperty("stream")
    private Boolean stream;

    // Straffer AI'en for at gentage emner der allerede er nævnt
    @JsonProperty("presence_penalty")
    private Integer presencePenalty;

    // Gemmer eventuelle ekstra JSON-felter som ikke er defineret herover
    @JsonIgnore
    private Map<String, Object> additionalProperties = new LinkedHashMap<String, Object>();

    // Returnerer model-navnet
    @JsonProperty("model")
    public String getModel() {
        return model;
    }

    // Sætter model-navnet
    @JsonProperty("model")
    public void setModel(String model) {
        this.model = model;
    }

    // Returnerer beskedlisten
    @JsonProperty("messages")
    public List<Message> getMessages() {
        return messages;
    }

    // Sætter beskedlisten
    @JsonProperty("messages")
    public void setMessages(List<Message> messages) {
        this.messages = messages;
    }

    // Returnerer antal ønskede svar
    @JsonProperty("n")
    public Integer getN() {
        return n;
    }

    // Sætter antal ønskede svar
    @JsonProperty("n")
    public void setN(Integer n) {
        this.n = n;
    }

    // Returnerer temperature-værdien
    @JsonProperty("temperature")
    public Integer getTemperature() {
        return temperature;
    }

    // Sætter temperature-værdien
    @JsonProperty("temperature")
    public void setTemperature(Integer temperature) {
        this.temperature = temperature;
    }

    // Returnerer max tokens
    @JsonProperty("max_tokens")
    public Integer getMaxTokens() {
        return maxTokens;
    }

    // Sætter max tokens
    @JsonProperty("max_tokens")
    public void setMaxTokens(Integer maxTokens) {
        this.maxTokens = maxTokens;
    }

    // Returnerer om streaming er aktiveret
    @JsonProperty("stream")
    public Boolean getStream() {
        return stream;
    }

    // Sætter om streaming er aktiveret
    @JsonProperty("stream")
    public void setStream(Boolean stream) {
        this.stream = stream;
    }

    // Returnerer presence penalty-værdien
    @JsonProperty("presence_penalty")
    public Integer getPresencePenalty() {
        return presencePenalty;
    }

    // Sætter presence penalty-værdien
    @JsonProperty("presence_penalty")
    public void setPresencePenalty(Integer presencePenalty) {
        this.presencePenalty = presencePenalty;
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
