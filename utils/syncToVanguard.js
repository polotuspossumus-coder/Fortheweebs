import axios from "axios";
export async function syncToVanguard(artifact) {
    await axios.post("https://vanguard.app/api/sync-artifact", {
        origin: "fortheweebs",
        artifact
    });
}
//# sourceMappingURL=syncToVanguard.js.map