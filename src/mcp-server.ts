import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import fs from "fs";
import path from "path";
import csvParser from "csv-parser";

import { z } from "zod";

const DATA_FILE = path.join(path.dirname(__dirname) + "/data", "sales.csv");

interface Sale {
  date: string;
  region: string;
  product: string;
  revenue: number;
}

function readSales(): Promise<Sale[]> {
  return new Promise((resolve, reject) => {
    const rows: Sale[] = [];
    fs.createReadStream(DATA_FILE)
      .pipe(csvParser())
      .on("data", (row) => {
        rows.push({
          date: String(row.date),
          region: String(row.region),
          product: String(row.product),
          revenue: Number(row.revenue),
        });
      })
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

async function start() {
  const server = new McpServer({
    name: "sales-mcp-server",
    version: "1.0.0",
  });

  // 1) get_total_sales (optional region filter)
  server.tool(
    "get_total_sales",
    { region: z.string().optional() }, // Zod schema shape
    async ({ region }) => {
      console.error(`DEBUG: Destructured region parameter:`, region);

      const data = await readSales();
      console.error(`DEBUG: Loaded ${data.length} sales records`);

      const filtered = data.filter((s) => (region ? s.region === region : true));
      console.error(`DEBUG: Filtered to ${filtered.length} records for region:`, region);

      const total = filtered.reduce((sum, s) => sum + s.revenue, 0);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { region: region ?? "ALL", totalRevenue: total },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // get_sales_by_all_regions (no input parameters)
  server.tool(
    "get_sales_by_all_regions",
    {}, // no input expected
    async () => {
      const data = await readSales();
      const byRegion: Record<string, number> = {};

      for (const s of data) {
        byRegion[s.region] = (byRegion[s.region] || 0) + s.revenue;
      }

      const total = Object.values(byRegion).reduce((sum, val) => sum + val, 0);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                regions: byRegion,
                total: total,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 2) get_top_products (limit)
  server.tool(
    "get_top_products",
    { limit: z.number().min(1).max(50).optional() },
    async (args) => {
      const limit = typeof args.limit === "number" ? args.limit : 5;

      const data = await readSales();
      const byProduct: Record<string, number> = {};
      for (const s of data) {
        byProduct[s.product] = (byProduct[s.product] || 0) + s.revenue;
      }

      const top = Object.entries(byProduct)
        .sort((a, b) => b[1] - a[1]) // sort by revenue descending
        .slice(0, limit)
        .map(([product, revenue]) => ({ product, revenue }));

      return {
        content: [{ type: "text", text: JSON.stringify({ top }, null, 2) }],
      };
    }
  );

  // -----------------------
  // RESOURCES (readable data)
  // -----------------------

  server.resource(
    "sales_summary",
    "sales://summary/regions",
    async () => {
      const data = await readSales();
      const byRegion: Record<string, number> = {};
      for (const s of data) {
        byRegion[s.region] = (byRegion[s.region] || 0) + s.revenue;
      }
      return {
        contents: [
          {
            uri: "sales://summary/regions",
            mimeType: "application/json",
            text: JSON.stringify(byRegion, null, 2),
          },
        ],
      };
    }
  );

  server.resource(
    "top_products",
    "sales://top/products",
    async () => {
      const data = await readSales();
      const byProduct: Record<string, number> = {};
      for (const s of data) {
        byProduct[s.product] = (byProduct[s.product] || 0) + s.revenue;
      }
      const top = Object.entries(byProduct)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([product, revenue]) => ({ product, revenue }));

      return {
        contents: [
          {
            uri: "sales://top/products",
            mimeType: "application/json",
            text: JSON.stringify({ top }, null, 2),
          },
        ],
      };
    }
  );

  // -----------------------
  // Transport (stdio for MCP)
  // -----------------------

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Sales MCP server running via MCP (stdio)");
}

start().catch((err) => {
  console.error("MCP server failed to start:", err);
  process.exit(1);
});
