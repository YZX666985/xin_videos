package com.yzx.dto;

public class ParserResponse {

    private String originalUrl;
    private String channelId;
    private String channelName;
    private String redirectUrl;
    private String message;

    public ParserResponse() {
    }

    public ParserResponse(String originalUrl, String channelId, String channelName, String redirectUrl, String message) {
        this.originalUrl = originalUrl;
        this.channelId = channelId;
        this.channelName = channelName;
        this.redirectUrl = redirectUrl;
        this.message = message;
    }

    public String getOriginalUrl() {
        return originalUrl;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    public String getChannelId() {
        return channelId;
    }

    public void setChannelId(String channelId) {
        this.channelId = channelId;
    }

    public String getChannelName() {
        return channelName;
    }

    public void setChannelName(String channelName) {
        this.channelName = channelName;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
