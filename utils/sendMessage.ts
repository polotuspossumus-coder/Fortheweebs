import axios from "axios";

export async function sendMessage(from: string, to: string, payload: any) {
  await axios.post("https://shared-api.vanguard.app/message", {
    from,
    to,
    payload
  });
}