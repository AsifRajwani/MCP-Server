import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";

const app = express();
app.use(bodyParser.json());

const PORT = 3001;
const DATA_FILE = path.join(path.dirname(__dirname)+"/data", "sales.csv");
console.log (DATA_FILE);
console.log(__dirname);

interface Sale {
  date: string;
  region: string;
  product: string;
  revenue: number;
}

// Utility to read CSV
function readSales(): Promise<Sale[]> {
  return new Promise((resolve, reject) => {
    const results: Sale[] = [];
    fs.createReadStream(DATA_FILE)
      .pipe(csvParser())
      .on("data", (row) => {
        results.push({
          date: row.date,
          region: row.region,
          product: row.product,
          revenue: Number(row.revenue),
        });
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

// Endpoint: get summary by region
app.get("/summary", async (_, res) => {
  const sales = await readSales();
  const summary: Record<string, number> = {};
  for (const s of sales) {
    summary[s.region] = (summary[s.region] || 0) + s.revenue;
  }
  res.json(summary);
});

// Endpoint: get top products
app.get("/top-products", async (_, res) => {
  const sales = await readSales();
  const summary: Record<string, number> = {};
  for (const s of sales) {
    summary[s.product] = (summary[s.product] || 0) + s.revenue;
  }
  const sorted = Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  res.json(sorted);
});

app.listen(PORT, () => {
  console.log(`MCP server running on http://localhost:${PORT}`);
});
