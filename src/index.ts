//! This syntax will not work with npx as that way you are running tsc with default tsconfig options and that does not respect esModuleInterop which is set to true. THIS IS A MAJOR POINT OF DIFFERENCE AND CAUSE OF ERROR AND CONFUSION

//! When you use TSC inside package.json the TypeScript version that exists inside your NodeJS modules using package.json is automatically pixked by npm
import express, { Express, Request, Response } from "express";

const app: Express = express();
const port = 3002;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
