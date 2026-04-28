package org.example.chatgptwebcliente24a.dto;

import com.fasterxml.jackson.annotation.*;

import javax.annotation.processing.Generated;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// Fortæller Jackson at felter med null-værdier ikke må med i JSON
@JsonInclude(JsonInclude.Include.NON_NULL)
// Bestemmer rækkefølgen af felterne når de konverteres til JSON
@JsonPropertyOrder({
    "id",
    "object",
    "created",
    "model",
    "choices",
    "usage",
    "service_tier",
    "system_fingerprint"
})
// Denne klasse er auto-genereret fra Groq API's JSON-schema
@Generated("jsonschema2pojo")
// Repræsenterer det svar vi modtager tilbage fra Groq API
public class ChatResponseDTO {

    // Unikt ID for denne AI-request hos Groq
    @JsonProperty("id")
    private String id;

    // Typen af objekt Groq returnerer, fx "chat.completion"
    @JsonProperty("object")
    private String object;

    // Tidsstempel for hvornår svaret blev genereret
    @JsonProperty("created")
    private Integer created;

    // Navnet på den model der genererede svaret
    @JsonProperty("model")
    private String model;

    // Listen af svar fra AI'en — vi bruger altid det første (index 0)
    @JsonProperty("choices")
    private List<Choice> choices;

    // Token-forbrug for denne request (prompt + svar)
    @JsonProperty("usage")
    private Usage usage;

    // Hvilken service-tier der blev brugt hos Groq
    @JsonProperty("service_tier")
    private String serviceTier;

    // Fingerprint der identificerer Groq's system-konfiguration
    @JsonProperty("system_fingerprint")
    private Object systemFingerprint;

    // Gemmer eventuelle ekstra JSON-felter vi ikke har defineret
    @JsonIgnore
    private Map<String, Object> additionalProperties = new LinkedHashMap<String, Object>();

    // Returnerer request-ID'et
    @JsonProperty("id")
    public String getId() {
        return id;
    }

    // Sætter request-ID'et
    @JsonProperty("id")
    public void setId(String id) {
        this.id = id;
    }

    // Returnerer objekt-typen
    @JsonProperty("object")
    public String getObject() {
        return object;
    }

    // Sætter objekt-typen
    @JsonProperty("object")
    public void setObject(String object) {
        this.object = object;
    }

    // Returnerer tidsstemplet
    @JsonProperty("created")
    public Integer getCreated() {
        return created;
    }

    // Sætter tidsstemplet
    @JsonProperty("created")
    public void setCreated(Integer created) {
        this.created = created;
    }

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

    // Returnerer listen af AI-svar — vi kalder .get(0) for at få det første
    @JsonProperty("choices")
    public List<Choice> getChoices() {
        return choices;
    }

    // Sætter listen af AI-svar
    @JsonProperty("choices")
    public void setChoices(List<Choice> choices) {
        this.choices = choices;
    }

    // Returnerer token-forbruget
    @JsonProperty("usage")
    public Usage getUsage() {
        return usage;
    }

    // Sætter token-forbruget
    @JsonProperty("usage")
    public void setUsage(Usage usage) {
        this.usage = usage;
    }

    // Returnerer service-tier
    @JsonProperty("service_tier")
    public String getServiceTier() {
        return serviceTier;
    }

    // Sætter service-tier
    @JsonProperty("service_tier")
    public void setServiceTier(String serviceTier) {
        this.serviceTier = serviceTier;
    }

    // Returnerer system-fingerprint
    @JsonProperty("system_fingerprint")
    public Object getSystemFingerprint() {
        return systemFingerprint;
    }

    // Sætter system-fingerprint
    @JsonProperty("system_fingerprint")
    public void setSystemFingerprint(Object systemFingerprint) {
        this.systemFingerprint = systemFingerprint;
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
