package com.yzx.dto;

import jakarta.validation.constraints.NotBlank;

public class ParserRequest {

    @NotBlank(message = "\u8bf7\u8f93\u5165\u9700\u8981\u89e3\u6790\u7684\u89c6\u9891\u94fe\u63a5")
    private String url;
    private String channelId;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getChannelId() {
        return channelId;
    }

    public void setChannelId(String channelId) {
        this.channelId = channelId;
    }

}
