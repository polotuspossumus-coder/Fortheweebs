import axios from "axios";

export async function syncToVanguard(artifact: any) {
  await axios.post("https://vanguard.app/api/sync-artifact", {
    origin: "fortheweebs",
    artifact
  });
}