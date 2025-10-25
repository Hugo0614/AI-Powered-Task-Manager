# AI-Powered Task Manager (English)

## 1. Project Description

This is a modern, full-stack to-do list application designed to showcase the integration of Artificial Intelligence into a daily productivity tool. It provides not only standard task management features but also leverages a powerful language model (GPT-3.5-Turbo) to offer intelligent capabilities like task decomposition and automated daily report generation. The application is built with a high-performance Python backend (FastAPI) and a responsive, modern frontend (React + Vite).

The project emphasizes robustness, data persistence, and a seamless user experience, complete with multi-language support for both Simplified and Traditional Chinese.

## 2. Detailed Features

This application is packed with a rich set of features to enhance productivity:

-   **Full CRUD Operations**: Create, Read, Update, and Delete tasks with an intuitive user interface.
-   **Persistent Storage**: Utilizes an SQLite database to ensure that your tasks are saved permanently, even after closing the browser or restarting the server.
-   **Double-Click to Edit**: Quickly edit any task's text by simply double-clicking on it.
-   **Advanced Filtering**: Easily filter tasks with three views: "All", "Pending", and "Completed".
-   **"NEW" Tag for Recent Tasks**: Automatically tags tasks created within the last hour with a "NEW" badge, helping you track recent additions.
-   **Bulk Deletion**: A "Delete All" button allows for clearing the entire task list with a confirmation step to prevent accidental data loss.
-   **Dynamic Date Display**: The current date is always displayed in the UI, formatted for readability.

### 🤖 AI-Powered Features

-   **AI Task Decomposition**: For any complex task (e.g., "Plan a vacation"), click the "🪄 AI-Decompose" button. The AI will break it down into smaller, actionable sub-tasks and add them to your list.
-   **AI Daily Report Generation**:
    -   **Streaming Output**: Click "Generate Report" to have the AI create a professional daily work summary based on your completed and pending tasks. The report is streamed word-by-word for a dynamic, real-time experience.
    -   **Multi-Language Support**: The application supports both Simplified and Traditional Chinese.
    -   **Intelligent Translation**: If you select the "Traditional Chinese" mode, the AI will automatically translate any tasks written in Simplified Chinese into Traditional Chinese within the final report, ensuring linguistic consistency.

## 3. Technology Stack & Implementation

This project uses a carefully selected stack of modern technologies to achieve its goals of performance, developer experience, and intelligent functionality.

### Backend

-   **FastAPI (Python)**
    -   **Why?**: Chosen for its incredible performance, asynchronous capabilities (which are perfect for handling I/O-bound operations like API calls), and automatic generation of interactive API documentation (via Swagger UI).
    -   **How?**: It serves as the core of our RESTful API. We define Pydantic models for data validation and create endpoints for all CRUD and AI operations. The `async` nature of FastAPI is fully utilized when making calls to the external AI API.

-   **SQLite**
    -   **Why?**: As a serverless, file-based database, SQLite is extremely lightweight and requires zero configuration, making it ideal for a self-contained project like this. It eliminates the complexity of setting up and managing a separate database server (like PostgreSQL or MySQL), allowing for a quick and easy setup. Its data is stored in a single file (`todos.db`), which makes the entire application highly portable.
    -   **How?**: The standard `sqlite3` Python module is used in `backend/database.py`. To ensure data integrity and prevent corruption, all database connections are managed using a `with` statement (`with sqlite3.connect(DATABASE) as conn:`). This acts as a context manager that automatically handles committing transactions upon success or rolling them back if an error occurs. It also ensures the connection is properly closed. All database logic (e.g., creating tables, inserting, updating, deleting records) is encapsulated in this module, providing a clean separation of concerns.

-   **Uvicorn**
    -   **Why?**: It is a lightning-fast ASGI (Asynchronous Server Gateway Interface) server, required to run our `async` FastAPI application.
    -   **How?**: It's the web server that runs the FastAPI application, handling incoming HTTP requests.

### Frontend

-   **React**
    -   **Why?**: Its component-based architecture makes it easy to build a modular and maintainable UI. The use of Hooks (`useState`, `useEffect`) provides powerful and intuitive state management.
    -   **How?**: The entire UI is built as a set of React components. `useState` manages the application's state (e.g., the list of todos, filter status, language), and `useEffect` handles side effects like fetching data from the backend API when the application loads.

-   **Vite**
    -   **Why?**: Vite offers a significantly faster development experience compared to older tools. It provides near-instant Hot Module Replacement (HMR) and optimized builds for production.
    -   **How?**: It serves our React application during development and bundles all the assets (JavaScript, CSS) for production.

-   **Tailwind CSS**
    -   **Why?**: It's a utility-first CSS framework that allows for rapid UI development directly within the HTML/JSX, without writing custom CSS files.
    -   **How?**: We use Tailwind's utility classes (e.g., `flex`, `p-4`, `rounded-lg`) directly on our JSX elements to style the application.

### AI Integration & Task Decomposition

-   **Technology**: GPT-3.5-Turbo (via Zhizengzeng API)
-   **Implementation**: The AI integration is handled in `backend/main.py`.
    -   **Task Decomposition (`/todos/{id}/breakdown` endpoint)**: This is the core of the "split the task" feature.
        1.  When the user clicks the "🪄 AI-Decompose" button, a `POST` request is sent to this endpoint with the ID of the complex task.
        2.  The backend retrieves the text of the task from the database.
        3.  A highly specific prompt is engineered and sent to the GPT model. The prompt instructs the AI to act as a project management expert and break the given task into 3-5 smaller, actionable steps, formatted as a numbered list.
        4.  The backend receives the plain text response from the AI.
        5.  It then parses this response, splitting the text by newlines and filtering for lines that start with a number (e.g., "1.", "2."). These are the sub-tasks.
        6.  For each extracted sub-task, the backend calls the `database.add_todo()` function to save it as a new item in the database.
        7.  Finally, the original complex task is deleted, leaving only the newly created sub-tasks.
    -   **Report Generation**: For report generation, a similar process is followed, where a prompt containing the lists of completed and pending tasks is sent to the AI with instructions to generate a formatted, analytical summary.

## 4. Project Structure

```
AI-Powered-Task-Manager/
├── backend/
│   ├── database.py          # SQLite database operations module
│   ├── main.py              # FastAPI routes and business logic
│   ├── requirements.txt     # Python dependencies
│   ├── .venv/               # Python virtual environment
│   └── todos.db             # SQLite database file (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── TodoItem.jsx # Single todo item component
│   │   ├── translations.js  # Language translation module
│   │   ├── App.jsx          # Main application component
│   │   └── ...
│   ├── package.json
│   └── ...
├── .gitignore
├── README.md                # This file
└── start.sh                 # One-click start script
```

## 5. How to Run the Project

The easiest way to run the project is using the provided one-click start script.

### Prerequisites
-   Python 3.8+
-   Node.js 16+ & npm

### One-Click Launch
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Hugo0614/AI-Powered-Task-Manager.git
    cd AI-Powered-Task-Manager
    ```

2.  **Set up the Environment (First time only):**
    ```bash
    # Create Python virtual environment
    python3 -m venv .venv

    # Install frontend dependencies
    cd frontend
    npm install
    cd ..
    ```

3.  **Run the start script:**
    ```bash
    # Make the script executable (if needed)
    chmod +x start.sh

    # Execute the script
    ./start.sh
    ```
    The script will automatically:
    -   Set a default `AI_API_KEY` if you haven't set one.
    -   Start the backend server on `http://localhost:8001`.
    -   Start the frontend server on `http://localhost:5173`.

4.  **Open your browser** and navigate to `http://localhost:5173` to use the application!

---
<br>

# AI 智能任务管理器 (简体中文)

## 1. 项目简介

这是一个现代化的全栈待办事项（To-do List）应用，旨在展示人工智能在日常生产力工具中的集成。它不仅提供标准的任务管理功能，还利用强大的语言模型（GPT-3.5-Turbo）来实现智能任务分解和自动化日报生成等高级功能。该应用采用高性能的 Python 后端（FastAPI）和响应迅速的现代化前端（React + Vite）构建。

项目重点在于其健壮性、数据持久化能力以及无缝的用户体验，并提供简体中文和繁体中文的双语支持。

## 2. 功能详解

该应用包含一系列丰富的功能以提升您的生产力：

-   **完整的 CRUD 操作**：通过直观的用户界面，轻松创建、读取、更新和删除任务。
-   **数据持久化存储**：使用 SQLite 数据库确保您的任务被永久保存，即使关闭浏览器或重启服务器也不会丢失。
-   **双击编辑**：只需双击任务文本，即可快速修改其内容。
-   **高级筛选**：提供“全部”、“待办”和“已完成”三种视图，方便您筛选任务。
-   **“新任务”标签**：自动为一小时内创建的任务添加“NEW”标记，帮助您追踪最新添加的项目。
-   **批量删除**：通过“删除全部”按钮一键清空所有任务，并有确认步骤防止误操作。
-   **动态日期显示**：界面上始终显示当前日期，并已进行格式化以提高可读性。

### 🤖 AI 驱动的功能

-   **AI 任务分解**：对于任何复杂任务（例如“策划一次家庭聚餐”），点击“🪄 AI 分解”按钮，AI 会将其分解为更小、可执行的子任务，并自动添加到您的任务列表中。
-   **AI 生成日报**：
    -   **流式输出**：点击“生成日报”，AI 会根据您已完成和待处理的任务，生成一份专业的工作总结。报告内容会以逐字输出的形式动态展示，提供实时体验。
    -   **多语言支持**：应用支持简体中文和繁体中文。
    -   **智能翻译**：当您选择“繁体中文”模式时，AI 会自动将任务列表中所有用简体中文书写的任务翻译成繁体中文，确保最终报告的语言一致性。

## 3. 技术栈及实现细节

本项目选用了一系列精心挑选的现代技术，以实现其在性能、开发体验和智能功能上的目标。

### 后端

-   **FastAPI (Python)**
    -   **为何选择?**: 因其卓越的性能、强大的异步能力（非常适合处理 API 调用等 I/O 密集型操作）以及能够自动生成交互式 API 文档（通过 Swagger UI）而被选用。
    -   **如何实现?**: FastAPI 是我们 RESTful API 的核心。我们使用 Pydantic 模型进行数据验证，并为所有 CRUD 和 AI 操作创建了 API 端点。在调用外部 AI API 时，我们充分利用了 FastAPI 的 `async` 异步特性。

-   **SQLite**
    -   **为何选择?**: 作为一个无服务器、基于文件的数据库，SQLite 极其轻量且无需任何配置，是此类独立项目的理想选择。它免去了安装和管理独立数据库服务器（如 PostgreSQL 或 MySQL）的复杂性，使项目设置变得简单快捷。其数据存储在单个文件（`todos.db`）中，使得整个应用具有高度的可移植性。
    -   **如何实现?**: 我们在 `backend/database.py` 中使用了 Python 的标准 `sqlite3` 模块。为了确保数据完整性和防止损坏，所有的数据库连接都通过 `with` 语句（`with sqlite3.connect(DATABASE) as conn:`）进行管理。这作为一个上下文管理器，能够自动处理事务的提交（成功时）或回滚（出错时），并确保连接被正确关闭。所有数据库逻辑（如建表、增删改查）都被封装在该模块中，实现了清晰的关注点分离。

-   **Uvicorn**
    -   **为何选择?**: 它是一个速度极快的 ASGI（异步服务器网关接口）服务器，是运行我们 `async` FastAPI 应用所必需的。
    -   **如何实现?**: 它作为 Web 服务器来运行 FastAPI 应用，处理传入的 HTTP 请求。

### 前端

-   **React**
    -   **为何选择?**: 其基于组件的架构使得构建模块化、可维护的用户界面变得容易。Hooks（`useState`, `useEffect`）的使用提供了强大而直观的状态管理方式。
    -   **如何实现?**: 整个 UI 由一系列 React 组件构成。`useState` 用于管理应用的状态（如任务列表、筛选状态、语言），`useEffect` 用于处理副作用，例如在应用加载时从后端 API 获取数据。

-   **Vite**
    -   **为何选择?**: 与传统工具相比，Vite 提供了显著更快的开发体验。它支持近乎即时的热模块替换（HMR）和优化的生产环境构建。
    -   **如何实现?**: 它在开发期间为我们的 React 应用提供服务，并为生产环境打包所有静态资源（JavaScript, CSS）。

-   **Tailwind CSS**
    -   **为何选择?**: 这是一个“功能优先”的 CSS 框架，允许我们直接在 HTML/JSX 中快速构建界面，而无需编写自定义 CSS 文件。
    -   **如何实现?**: 我们直接在 JSX 元素上使用 Tailwind 的功能类（如 `flex`, `p-4`, `rounded-lg`）来设计应用样式。

### AI 集成与任务分解

-   **技术**: GPT-3.5-Turbo (通过智增增 API)
-   **实现细节**: AI 的集成逻辑在 `backend/main.py` 中处理。
    -   **任务分解 (`/todos/{id}/breakdown` 端点)**: 这是“拆分任务”功能的核心。
        1.  当用户点击“🪄 AI 分解”按钮时，前端会向此端点发送一个 `POST` 请求，并附上复杂任务的 ID。
        2.  后端从数据库中检索该任务的文本。
        3.  后端构建一个高度定制化的提示（Prompt），并发送给 GPT 模型。该提示指示 AI 扮演项目管理专家的角色，将给定任务分解为 3-5 个更小、可执行的步骤，并以数字列表的格式返回。
        4.  后端接收到 AI 返回的纯文本响应。
        5.  接着，后端解析此响应，通过换行符分割文本，并筛选出以数字开头的行（例如“1.”，“2.”），这些就是子任务。
        6.  对于每个提取出的子任务，后端调用 `database.add_todo()` 函数，将其作为新项目存入数据库。
        7.  最后，删除原始的复杂任务，只保留新创建的子任务。
    -   **日报生成**: 日报生成遵循类似流程，后端将包含已完成和待办任务列表的提示发送给 AI，并指示其生成格式化、具有分析性的总结。

## 4. 项目结构

```
AI-Powered-Task-Manager/
├── backend/
│   ├── database.py          # SQLite 数据库操作模块
│   ├── main.py              # FastAPI 路由和业务逻辑
│   ├── requirements.txt     # Python 依赖
│   ├── .venv/               # Python 虚拟环境
│   └── todos.db             # SQLite 数据库文件 (自动生成)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── TodoItem.jsx # 单个待办事项组件
│   │   ├── translations.js  # 语言翻译模块
│   │   ├── App.jsx          # 主应用组件
│   │   └── ...
│   ├── package.json
│   └── ...
├── .gitignore
├── README.md                # 本文件
└── start.sh                 # 一键启动脚本
```

## 5. 如何运行项目

运行本项目的最简单方式是使用提供的一键启动脚本。

### 环境要求
-   Python 3.8+
-   Node.js 16+ 及 npm

### 一键启动
1.  **克隆仓库:**
    ```bash
    git clone https://github.com/Hugo0614/AI-Powered-Task-Manager.git
    cd AI-Powered-Task-Manager
    ```

2.  **环境设置 (仅首次需要):**
    ```bash
    # 创建 Python 虚拟环境
    python3 -m venv .venv

    # 安装前端依赖
    cd frontend
    npm install
    cd ..
    ```

3.  **运行启动脚本:**
    ```bash
    # 赋予脚本执行权限 (如果需要)
    chmod +x start.sh

    # 执行脚本
    ./start.sh
    ```
    该脚本会自动完成以下操作：
    -   如果您没有设置 `AI_API_KEY`，脚本会设置一个默认值。
    -   在 `http://localhost:8001` 启动后端服务器。
    -   在 `http://localhost:5173` 启动前端服务器。

4.  **打开浏览器** 并访问 `http://localhost:5173` 即可开始使用！
