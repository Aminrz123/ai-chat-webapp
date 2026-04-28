package org.example.chatgptwebcliente24a.dto;

import com.fasterxml.jackson.annotation.*;

import javax.annotation.processing.Generated;
import java.util.LinkedHashMap;
import java.util.Map;

// Fortæller Jackson at felter med null-værdier ikke må med i JSON
@JsonInclude(JsonInclude.Include.NON_NULL)
// Bestemmer rækkefølgen af felterne i JSON
@JsonPropertyOrder({
    "cached_tokens",
    "audio_tokens"
})
// Denne klasse er auto-genereret fra Groq API's JSON-schema
@Generated("jsonschema2pojo")
// Nedbryder token-forbruget på vores prompt i detaljer — sendt fra Groq, bruges ikke aktivt i vores app
public class PromptTokensDetails {

    // Tokens der blev hentet fra cache (hurtigere og billigere)
    @JsonProperty("cached_tokens")
    private Integer cachedTokens;

    // Tokens brugt til lyd i prompten (bruges ikke i vores app)
    @JsonProperty("audio_tokens")
    private Integer audioTokens;

    // Gemmer eventuelle ekstra JSON-felter vi ikke har defineret
    @JsonIgnore
    private Map<String, Object> additionalProperties = new LinkedHashMap<String, Object>();

    // Returnerer antal cached tokens
    @JsonProperty("cached_tokens")
    public Integer getCachedTokens() {
        return cachedTokens;
    }

    // Sætter antal cached tokens
    @JsonProperty("cached_tokens")
    public void setCachedTokens(Integer cachedTokens) {
        this.cachedTokens = cachedTokens;
    }

    // Returnerer antal audio-tokens
    @JsonProperty("audio_tokens")
    public Integer getAudioTokens() {
        return audioTokens;
    }

    // Sætter antal audio-tokens
    @JsonProperty("audio_tokens")
    public void setAudioTokens(Integer audioTokens) {
        this.audioTokens = audioTokens;
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
