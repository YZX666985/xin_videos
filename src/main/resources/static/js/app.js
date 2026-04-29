const channelList = document.getElementById("channel-list");
const channelCountEl = document.getElementById("channel-count");
const form = document.getElementById("parser-form");
const messageEl = document.getElementById("form-message");
const urlInput = document.getElementById("url");
const submitButton = document.getElementById("submit-button");

const MESSAGES = {
    channelLoadFailed: "\u7ebf\u8def\u52a0\u8f7d\u5931\u8d25",
    channelLoadRetry: "\u7ebf\u8def\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u8bf7\u5237\u65b0\u540e\u518d\u8bd5\u3002",
    redirecting: "\u9a6c\u4e0a\u4e3a\u4f60\u6253\u5f00...",
    missingUrl: "\u8bf7\u5148\u8f93\u5165\u94fe\u63a5\u3002",
    invalidScheme: "\u8bf7\u8f93\u5165\u5b8c\u6574\u94fe\u63a5\u3002",
    missingChannel: "\u8bf7\u5148\u9009\u4e00\u6761\u7ebf\u8def\u3002",
    channelSelected: "\u7ebf\u8def\u5df2\u5207\u6362\u3002"
};

document.addEventListener("DOMContentLoaded", async () => {
    if (typeof createUniverseStarfield === "function") {
        createUniverseStarfield("star-canvas");
    }

    bindEvents();
    await loadChannels();
});

async function loadChannels() {
    try {
        const response = await fetch("/api/parser/channels");
        if (!response.ok) {
            throw new Error(MESSAGES.channelLoadFailed);
        }

        const channels = await response.json();
        channelCountEl.textContent = `${channels.length} \u6761\u53ef\u7528`;
        renderChannels(channels);
    } catch (error) {
        channelCountEl.textContent = "\u52a0\u8f7d\u5931\u8d25";
        setMessage(error.message || MESSAGES.channelLoadRetry, "error");
    }
}

function renderChannels(channels) {
    channelList.innerHTML = channels.map((channel, index) => {
        const safeId = escapeHtml(channel.id);
        const safeName = escapeHtml(channel.name);
        const safeDescription = escapeHtml(channel.description || "");
        const badge = index === 0 ? "\u63a8\u8350" : "\u5907\u7528";

        return `
            <div class="channel-option ${index === 0 ? "is-recommended" : ""}">
                <input
                    id="channel-${safeId}"
                    type="radio"
                    name="jk"
                    value="${safeId}"
                    ${index === 0 ? "checked" : ""}
                />
                <label for="channel-${safeId}">
                    <strong data-badge="${badge}">${safeName}</strong>
                    <span>${safeDescription}</span>
                </label>
            </div>
        `;
    }).join("");
}

function bindEvents() {
    form.addEventListener("submit", handleFormSubmit);
    channelList.addEventListener("change", handleChannelChange);
}

function handleFormSubmit(event) {
    const payload = collectFormData();
    if (!payload) {
        event.preventDefault();
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "\u6253\u5f00\u4e2d...";
    setMessage(MESSAGES.redirecting, "success");
}

function handleChannelChange(event) {
    if (event.target && event.target.name === "jk") {
        setMessage(MESSAGES.channelSelected, "success");
    }
}

function collectFormData() {
    const url = urlInput.value.trim();
    const channel = document.querySelector('input[name="jk"]:checked');

    if (!url) {
        setMessage(MESSAGES.missingUrl, "error");
        return null;
    }

    if (!/^https?:\/\//i.test(url)) {
        setMessage(MESSAGES.invalidScheme, "error");
        return null;
    }

    if (!channel) {
        setMessage(MESSAGES.missingChannel, "error");
        return null;
    }

    return {
        url,
        channelId: channel.value
    };
}

function setMessage(message, type) {
    messageEl.textContent = message;
    messageEl.classList.remove("is-success", "is-error");

    if (type === "success") {
        messageEl.classList.add("is-success");
    } else if (type === "error") {
        messageEl.classList.add("is-error");
        submitButton.disabled = false;
        submitButton.textContent = "\u7acb\u5373\u6253\u5f00";
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}
