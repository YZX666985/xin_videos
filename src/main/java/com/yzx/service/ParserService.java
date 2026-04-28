package com.yzx.service;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.yzx.config.ParserProperties;
import com.yzx.dto.ParserChannelDto;
import com.yzx.dto.ParserRequest;
import com.yzx.dto.ParserResponse;

@Service
public class ParserService {

    private final ParserProperties parserProperties;

    public ParserService(ParserProperties parserProperties) {
        this.parserProperties = parserProperties;
    }

    public List<ParserChannelDto> getChannels() {
        return parserProperties.getChannels().stream()
                .map(channel -> new ParserChannelDto(channel.getId(), channel.getName(), channel.getDescription()))
                .toList();
    }

    public ParserResponse resolve(ParserRequest request) {
        String normalizedUrl = normalizeUrl(request.getUrl());
        ParserProperties.Channel channel = findChannel(request.getChannelId());
        String encodedUrl = URLEncoder.encode(normalizedUrl, StandardCharsets.UTF_8);
        String redirectUrl = channel.getTarget().formatted(encodedUrl);

        return new ParserResponse(
                normalizedUrl,
                channel.getId(),
                channel.getName(),
                redirectUrl,
                "\u89e3\u6790\u5730\u5740\u5df2\u751f\u6210\uff0c\u53ef\u4ee5\u76f4\u63a5\u8df3\u8f6c\u3002"
        );
    }

    private ParserProperties.Channel findChannel(String channelId) {
        String resolvedChannelId = StringUtils.hasText(channelId) ? channelId : defaultChannelId();
        return parserProperties.getChannels().stream()
                .filter(channel -> resolvedChannelId.equals(channel.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "\u65e0\u6548\u7684\u89e3\u6790\u901a\u9053\uff0c\u8bf7\u91cd\u65b0\u9009\u62e9\u3002"
                ));
    }

    private String defaultChannelId() {
        return parserProperties.getChannels().stream()
                .findFirst()
                .map(ParserProperties.Channel::getId)
                .orElseThrow(() -> new IllegalStateException(
                        "\u672a\u914d\u7f6e\u4efb\u4f55\u89e3\u6790\u901a\u9053\u3002"
                ));
    }

    private String normalizeUrl(String url) {
        if (!StringUtils.hasText(url)) {
            throw new IllegalArgumentException(
                    "\u8bf7\u8f93\u5165\u9700\u8981\u89e3\u6790\u7684\u5b8c\u6574\u89c6\u9891\u5730\u5740\u3002"
            );
        }

        String trimmed = url.trim();
        try {
            URI uri = new URI(trimmed);
            String scheme = uri.getScheme();
            if (!StringUtils.hasText(scheme) || !(scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))) {
                throw new IllegalArgumentException(
                        "\u8bf7\u8f93\u5165\u4ee5 http:// \u6216 https:// \u5f00\u5934\u7684\u5730\u5740\u3002"
                );
            }
            if (!StringUtils.hasText(uri.getHost())) {
                throw new IllegalArgumentException(
                        "\u8bf7\u8f93\u5165\u6709\u6548\u7684\u7ad9\u70b9\u5730\u5740\u3002"
                );
            }
            return trimmed;
        } catch (URISyntaxException ex) {
            throw new IllegalArgumentException(
                    "\u94fe\u63a5\u683c\u5f0f\u4e0d\u6b63\u786e\uff0c\u8bf7\u68c0\u67e5\u540e\u91cd\u8bd5\u3002"
            );
        }
    }
}
