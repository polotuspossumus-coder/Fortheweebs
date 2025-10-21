import axios from "axios";
export async function sendMessage(from, to, payload) {
    await axios.post("https://shared-api.vanguard.app/message", {
        from,
        to,
        payload
    });
}
//# sourceMappingURL=sendMessage.js.map