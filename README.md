# How to Run and Test the MCP Server

## Setup and Installation

1.  **Clone the repository:** Clone the GitHub repository to your local machine using the command:

    ```bash
    git clone https://github.com/AsifRajwani/MCP-Server.git
    ```

2.  **Navigate to the directory:** Change your current directory to the project folder:

    ```bash
    cd MCP-Server
    ```

3.  **Install dependencies:** Install all the required packages by running:

    ```bash
    npm install
    ```

    This command will create a `node_modules` directory in your project.

---

## Compiling and Running the Server

1.  **Compile the code:** Build the project by running the following command and ensure there are no errors:

    ```bash
    npm run build
    ```

2.  **Start the server:** Run the server with this command. The server uses `StdioServerTransport`, so there won't be much interactive output in the terminal.

    ```bash
    npm run start
    ```

---

## Testing with the Inspector

To properly test your code, use the **MCP Inspector**. It will start the server in its own subprocess and provide a robust web interface for testing all the available methods.

- **Run the Inspector:** From your terminal, execute the following command:

  ```bash
  npx @modelcontextprotocol/inspector node dist/mcp-server.js
  ```

The inspector will launch a web UI in your browser, allowing you to interact with and debug the server.

## Data

Data used is stored in the csv file **data/sales.csv**
