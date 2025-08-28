import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

async function main() {
  const server = new McpServer({ name: "test-server", version: "1.0.0" });

  // Register a tool using plain zod shape
  server.tool(
    "echo",
    { msg: z.string() },
    async (args) => ({ content: [{ type: "text", text: args.msg }] })
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Keep the process alive
  setInterval(() => {}, 1 << 30);
}

main();
