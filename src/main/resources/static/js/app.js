const channelList = document.getElementById("channel-list");
const channelCountEl = document.getElementById("channel-count");
const form = document.getElementById("parser-form");
const messageEl = document.getElementById("form-message");
const urlInput = document.getElementById("url");
const submitButton = document.getElementById("submit-button");
const fillDemoButton = document.getElementById("fill-demo");
const quickTipButtons = Array.from(document.querySelectorAll(".quick-tips__item"));

const MESSAGES = {
    channelLoadFailed: "线路加载失败",
    channelLoadRetry: "线路暂时不可用，请刷新后再试。",
    redirecting: "马上为你打开...",
    missingUrl: "请先输入链接。",
    invalidScheme: "请输入完整链接。",
    missingChannel: "请先选一条线路。",
    filledDemo: "已填入示例链接。",
    channelSelected: "线路已切换。"
};

const DEFAULT_DEMO_URL = "https://www.iqiyi.com/v_19rr1skq2c.html";

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
        channelCountEl.textContent = `${channels.length} 条可用`;
        renderChannels(channels);
    } catch (error) {
        channelCountEl.textContent = "加载失败";
        setMessage(error.message || MESSAGES.channelLoadRetry, "error");
    }
}

function renderChannels(channels) {
    channelList.innerHTML = channels.map((channel, index) => {
        const safeId = escapeHtml(channel.id);
        const safeName = escapeHtml(channel.name);
        const safeDescription = escapeHtml(channel.description || "");
        const badge = index === 0 ? "推荐" : "备用";

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
    fillDemoButton.addEventListener("click", () => applyDemoUrl(DEFAULT_DEMO_URL));

    quickTipButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const demoUrl = button.dataset.url || DEFAULT_DEMO_URL;
            applyDemoUrl(demoUrl);
        });
    });
}

function handleFormSubmit(event) {
    const payload = collectFormData();
    if (!payload) {
        event.preventDefault();
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "打开中...";
    setMessage(MESSAGES.redirecting, "success");
}

function handleChannelChange(event) {
    if (event.target && event.target.name === "jk") {
        setMessage(MESSAGES.channelSelected, "success");
    }
}

function applyDemoUrl(url) {
    urlInput.value = url;
    urlInput.focus();
    urlInput.setSelectionRange(url.length, url.length);
    setMessage(MESSAGES.filledDemo, "success");
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
        submitButton.textContent = "立即打开";
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
