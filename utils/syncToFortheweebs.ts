import axios from "axios";

export async function syncToFortheweebs(artifact: any) {
  await axios.post("https://fortheweebs.app/api/sync-artifact", {
    origin: "vanguard",
    artifact
  });
}