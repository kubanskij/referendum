const API = "https://voting-worker.wop099map.workers.dev";

const loading = document.getElementById("loading");
const poll = document.getElementById("poll");
const noPoll = document.getElementById("no-poll");
const title = document.getElementById("poll-title");
const description = document.getElementById("poll-description");
const options = document.getElementById("options");
const form = document.getElementById("vote-form");
const nickname = document.getElementById("nickname");
const message = document.getElementById("message");

let currentPoll = null;

async function loadPoll() {
    try {
        const response = await fetch(`${API}/api/poll`);
        const data = await response.json();

        loading.hidden = true;

        if (!data.poll) {
            noPoll.hidden = false;
            return;
        }

        currentPoll = data.poll;
        title.textContent = data.poll.title;
        description.textContent = data.poll.description || "";
        options.innerHTML = "";

        for (const option of data.poll.options) {
            const label = document.createElement("label");
            label.className = "option";
            label.innerHTML = `
                <input type="radio" name="option" value="${option.id}" required>
                <span>${escapeHtml(option.text)}</span>
            `;
            options.appendChild(label);
        }

        poll.hidden = false;
    } catch {
        loading.textContent = "Не удалось загрузить голосование.";
    }
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    message.textContent = "Отправка...";

    const selected = document.querySelector('input[name="option"]:checked');
    if (!selected) return;

    try {
        const response = await fetch(`${API}/api/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                poll_id: currentPoll.id,
                option_id: Number(selected.value),
                nickname: nickname.value.trim()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.error || "Не удалось проголосовать.";
            return;
        }

        message.textContent = "Голос принят!";
        form.reset();
    } catch {
        message.textContent = "Ошибка соединения с сервером.";
    }
});

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadPoll();
