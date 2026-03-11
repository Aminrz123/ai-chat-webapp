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

@RestController
public class ChatGPTController {


    @Value("${groq.api.key}")
    private String openapikey;

    private final WebClient webClient;

    public ChatGPTController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.groq.com/openai/v1/chat/completions").build();
    }

    @GetMapping("/chad")
    public String chatTest(@RequestParam String message) {
        return message;
    }

    @GetMapping("/key")
    public String getKey() {
        return openapikey;
    }


    @GetMapping("/chat")
    public Map<String, Object> chatWithGPT(@RequestParam String message) {
        ChatRequestDTO chatRequest = new ChatRequestDTO();
        chatRequest.setModel("llama-3.3-70b-versatile");
        List<Message> lstMessages = new ArrayList<>();
        lstMessages.add(new Message("system", "You are a helpful assistant."));
        lstMessages.add(new Message("user", "Where is " + message));
        chatRequest.setMessages(lstMessages);
        chatRequest.setN(3);
        chatRequest.setTemperature(1);
        chatRequest.setMaxTokens(30);
        chatRequest.setStream(false);
        chatRequest.setPresencePenalty(1);

        ChatResponseDTO response = webClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> h.setBearerAuth(openapikey))
                .bodyValue(chatRequest)
                .retrieve()
                .bodyToMono(ChatResponseDTO.class)
                .block();

        List<Choice> lst = response.getChoices();
        Usage usg = response.getUsage();

        Map<String, Object> map = new HashMap<>();
        map.put("Usage", usg);
        map.put("Choices", lst);

        return map;
    }

    @PostMapping("/api/chat")
    @ResponseBody
    public Map<String, String> chat(@RequestBody Map<String, String> body) {
        String message = body.get("message");

        ChatRequestDTO chatRequest = new ChatRequestDTO();
        chatRequest.setModel("llama-3.3-70b-versatile");
        List<Message> lstMessages = new ArrayList<>();
        lstMessages.add(new Message("system", "You are a helpful assistant."));
        lstMessages.add(new Message("user", message));
        chatRequest.setMessages(lstMessages);
        chatRequest.setMaxTokens(500);

        ChatResponseDTO response = webClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> h.setBearerAuth(openapikey))
                .bodyValue(chatRequest)
                .retrieve()
                .onStatus(status -> status.isError(), clientResponse ->
                        clientResponse.bodyToMono(String.class).map(errorBody -> {


                            System.err.println("Groq fejl: " + errorBody);
                            return new RuntimeException("Groq fejl: " + errorBody);
                        })
                )
                .bodyToMono(ChatResponseDTO.class)
                .block();

        String reply = response.getChoices().get(0).getMessage().getContent();
        Map<String, String> result = new HashMap<>();
        result.put("reply", reply);
        return result;
    }



}
