import React from "react";

// Type definition
export type UploadStats = {
  date: string; // e.g., "2025-10-21"
  rating: "PG-13" | "M";
  count: number;
  topTags: string[];
};

export const MatureContentAnalytics = ({ data }: { data: UploadStats[] }) => (
  <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-6 rounded mb-6">
    <h3 className="text-xl font-bold mb-4">📊 PG-13 & M Upload Analytics</h3>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-blue-100">
          <th className="p-2 border">Date</th>
          <th className="p-2 border">Rating</th>
          <th className="p-2 border">Count</th>
          <th className="p-2 border">Top Tags</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr key={index} className="border-t">
            <td className="p-2 border">{entry.date}</td>
            <td className="p-2 border">{entry.rating}</td>
            <td className="p-2 border">{entry.count}</td>
            <td className="p-2 border">{entry.topTags.join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
