package org.example.chatgptwebcliente24a.controller;

import org.example.chatgptwebcliente24a.dto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Fortæller Spring at denne klasse håndterer HTTP-requests og returnerer JSON
@RestController
public class ChatGPTController {

    // Henter Groq API-nøglen fra application.properties
    @Value("${groq.api.key}")
    private String openapikey;

    // WebClient bruges til at kommunikere med Groq API
    private final WebClient webClient;

    // Konstruktør — sætter basis-URL for alle requests til Groq
    public ChatGPTController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.groq.com/openai/v1/chat/completions").build();
    }

    // Modtager POST-requests fra frontend på adressen /api/chat
    @PostMapping("/api/chat")
    @ResponseBody
    public Map<String, String> chat(@RequestBody Map<String, String> body) {

        // Henter beskeden som frontend har sendt (inkl. al budget-kontekst)
        String message = body.get("message");

        // Opretter et nyt request-objekt som skal sendes til Groq
        ChatRequestDTO chatRequest = new ChatRequestDTO();

        // Angiver hvilken AI-model vi vil bruge
        chatRequest.setModel("llama-3.3-70b-versatile");

        // Opretter en liste til at holde samtalens beskeder
        List<Message> lstMessages = new ArrayList<>();

        // Tilføjer en system-besked der definerer AI'ens rolle
        lstMessages.add(new Message("system", "You are a helpful assistant."));

        // Tilføjer brugerens besked (med al budget-kontekst fra budget.js)
        lstMessages.add(new Message("user", message));

        chatRequest.setMessages(lstMessages);

        chatRequest.setMaxTokens(500);

        chatRequest.setTemperature(0);

        // Sender requestet til Groq API og venter på svar
        ChatResponseDTO response = webClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> h.setBearerAuth(openapikey))
                // Pakker request-objektet som JSON i body
                .bodyValue(chatRequest)
                // Henter svaret
                .retrieve()
                // Håndterer fejl fra Groq API — printer fejlen i konsollen
                .onStatus(status -> status.isError(), clientResponse ->
                        clientResponse.bodyToMono(String.class).map(errorBody -> {
                            System.err.println("Groq fejl: " + errorBody);
                            return new RuntimeException("Groq fejl: " + errorBody);
                        })
                )
                // Konverterer JSON-svaret til et ChatResponseDTO objekt
                .bodyToMono(ChatResponseDTO.class)
                // Venter på svaret (gør det synkront)
                .block();

        // Henter det første svar fra AI'en (index 0)
        String reply = response.getChoices().get(0).getMessage().getContent();

        // Bygger et simpelt map med svaret og returnerer det som JSON til frontend
        Map<String, String> result = new HashMap<>();
        result.put("reply", reply);
        return result;
    }

}