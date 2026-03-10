
package org.example.chatgptwebcliente24a.dto;

import com.fasterxml.jackson.annotation.*;

import javax.annotation.processing.Generated;
import java.util.LinkedHashMap;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "cached_tokens",
    "audio_tokens"
})
@Generated("jsonschema2pojo")
public class PromptTokensDetails {

    @JsonProperty("cached_tokens")
    private Integer cachedTokens;
    @JsonProperty("audio_tokens")
    private Integer audioTokens;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new LinkedHashMap<String, Object>();

    @JsonProperty("cached_tokens")
    public Integer getCachedTokens() {
        return cachedTokens;
    }

    @JsonProperty("cached_tokens")
    public void setCachedTokens(Integer cachedTokens) {
        this.cachedTokens = cachedTokens;
    }

    @JsonProperty("audio_tokens")
    public Integer getAudioTokens() {
        return audioTokens;
    }

    @JsonProperty("audio_tokens")
    public void setAudioTokens(Integer audioTokens) {
        this.audioTokens = audioTokens;
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

}
