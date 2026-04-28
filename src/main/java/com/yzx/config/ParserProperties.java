package com.yzx.config;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.parser")
public class ParserProperties {

    @Valid
    @NotEmpty(message = "\u81f3\u5c11\u9700\u8981\u914d\u7f6e\u4e00\u4e2a\u89e3\u6790\u901a\u9053")
    private List<Channel> channels = new ArrayList<>();

    public List<Channel> getChannels() {
        return channels;
    }

    public void setChannels(List<Channel> channels) {
        this.channels = channels;
    }

    public static class Channel {
        @NotBlank(message = "\u89e3\u6790\u901a\u9053 id \u4e0d\u80fd\u4e3a\u7a7a")
        private String id;

        @NotBlank(message = "\u89e3\u6790\u901a\u9053\u540d\u79f0\u4e0d\u80fd\u4e3a\u7a7a")
        private String name;

        @NotBlank(message = "\u89e3\u6790\u901a\u9053\u63cf\u8ff0\u4e0d\u80fd\u4e3a\u7a7a")
        private String description;

        @NotBlank(message = "\u89e3\u6790\u901a\u9053\u76ee\u6807\u5730\u5740\u4e0d\u80fd\u4e3a\u7a7a")
        private String target;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getTarget() {
            return target;
        }

        public void setTarget(String target) {
            this.target = target;
        }
    }
}
