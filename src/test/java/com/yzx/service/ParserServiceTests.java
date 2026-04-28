package com.yzx.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.yzx.config.ParserProperties;
import com.yzx.dto.ParserRequest;
import com.yzx.dto.ParserResponse;

class ParserServiceTests {

    private ParserService parserService;

    @BeforeEach
    void setUp() {
        ParserProperties properties = new ParserProperties();

        ParserProperties.Channel primary = new ParserProperties.Channel();
        primary.setId("1");
        primary.setName("primary");
        primary.setDescription("default");
        primary.setTarget("https://example.com/?url=%s");

        ParserProperties.Channel backup = new ParserProperties.Channel();
        backup.setId("2");
        backup.setName("backup");
        backup.setDescription("secondary");
        backup.setTarget("https://backup.example.com/?url=%s");

        properties.setChannels(List.of(primary, backup));
        parserService = new ParserService(properties);
    }

    @Test
    void shouldUseDefaultChannelWhenChannelIdMissing() {
        ParserRequest request = new ParserRequest();
        request.setUrl("https://video.example.com/watch?v=1");

        ParserResponse response = parserService.resolve(request);

        assertEquals("1", response.getChannelId());
        assertEquals(
                "https://example.com/?url=https%3A%2F%2Fvideo.example.com%2Fwatch%3Fv%3D1",
                response.getRedirectUrl()
        );
    }

    @Test
    void shouldRejectInvalidChannelId() {
        ParserRequest request = new ParserRequest();
        request.setUrl("https://video.example.com/watch?v=1");
        request.setChannelId("404");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> parserService.resolve(request));

        assertEquals("\u65e0\u6548\u7684\u89e3\u6790\u901a\u9053\uff0c\u8bf7\u91cd\u65b0\u9009\u62e9\u3002", ex.getMessage());
    }

    @Test
    void shouldRejectNonHttpUrl() {
        ParserRequest request = new ParserRequest();
        request.setUrl("ftp://video.example.com/test");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> parserService.resolve(request));

        assertEquals("\u8bf7\u8f93\u5165\u4ee5 http:// \u6216 https:// \u5f00\u5934\u7684\u5730\u5740\u3002", ex.getMessage());
    }
}
