package com.yzx.controller;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import com.yzx.dto.ParserChannelDto;
import com.yzx.dto.ParserRequest;
import com.yzx.dto.ParserResponse;
import com.yzx.service.ParserService;

@RestController
@RequestMapping
public class ParserController {

    private final ParserService parserService;

    public ParserController(ParserService parserService) {
        this.parserService = parserService;
    }

    @GetMapping("/api/parser/channels")
    public List<ParserChannelDto> channels() {
        return parserService.getChannels();
    }

    @PostMapping("/api/parser/resolve")
    public ParserResponse resolve(@Valid @RequestBody ParserRequest request) {
        return parserService.resolve(request);
    }

    @PostMapping("/m")
    public RedirectView redirectByForm(
            @RequestParam("url") String url,
            @RequestParam(value = "jk", required = false) String channelId
    ) {
        ParserResponse response = parserService.resolve(buildRequest(url, channelId));

        RedirectView redirectView = new RedirectView();
        redirectView.setUrl(response.getRedirectUrl());
        redirectView.setStatusCode(HttpStatus.FOUND);
        return redirectView;
    }

    @GetMapping("/m")
    public ResponseEntity<Void> redirectByQuery(
            @RequestParam("url") String url,
            @RequestParam(value = "jk", required = false) String channelId
    ) {
        ParserResponse response = parserService.resolve(buildRequest(url, channelId));

        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, response.getRedirectUrl())
                .build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        FieldError fieldError = ex.getBindingResult().getFieldError();
        String message = fieldError != null
                ? fieldError.getDefaultMessage()
                : "\u8bf7\u6c42\u53c2\u6570\u4e0d\u5408\u6cd5";
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    private ParserRequest buildRequest(String url, String channelId) {
        ParserRequest request = new ParserRequest();
        request.setUrl(url);
        request.setChannelId(channelId);
        return request;
    }
}
