import axios from "axios";
export async function syncToFortheweebs(artifact) {
    await axios.post("https://fortheweebs.app/api/sync-artifact", {
        origin: "vanguard",
        artifact
    });
}
//# sourceMappingURL=syncToFortheweebs.js.map