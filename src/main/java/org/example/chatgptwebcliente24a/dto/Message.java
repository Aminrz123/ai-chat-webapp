package org.example.chatgptwebcliente24a.dto;

import com.fasterxml.jackson.annotation.*;

import javax.annotation.processing.Generated;
import java.util.LinkedHashMap;
import java.util.Map;

// Fortæller Jackson at felter med null-værdier ikke må med i JSON
@JsonInclude(JsonInclude.Include.NON_NULL)
// Bestemmer rækkefølgen af felterne i JSON
@JsonPropertyOrder({
    "role",
    "content"
})
// Denne klasse er auto-genereret fra Groq API's JSON-schema
@Generated("jsonschema2pojo")
// Repræsenterer én enkelt besked i en samtale med AI'en
public class Message {

    // Rollen for denne besked — enten "system" (instruktioner til AI) eller "user" (brugerens besked)
    @JsonProperty("role")
    private String role;

    // Selve teksten i beskeden
    @JsonProperty("content")
    private String content;

    // Gemmer eventuelle ekstra JSON-felter vi ikke har defineret
    @JsonIgnore
    private Map<String, Object> additionalProperties = new LinkedHashMap<String, Object>();

    // Konstruktør — bruges i controlleren til at oprette beskeder direkte med rolle og indhold
    public Message(String role, String content) {
        this.role = role;
        this.content = content;
    }

    // Returnerer rollen ("system" eller "user")
    @JsonProperty("role")
    public String getRole() {
        return role;
    }

    // Sætter rollen
    @JsonProperty("role")
    public void setRole(String role) {
        this.role = role;
    }

    // Returnerer beskedens tekst
    @JsonProperty("content")
    public String getContent() {
        return content;
    }

    // Sætter beskedens tekst
    @JsonProperty("content")
    public void setContent(String content) {
        this.content = content;
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
