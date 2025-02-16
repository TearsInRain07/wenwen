# 问问D老师

一个基于React和Express的智能问答系统。

## 功能特点

- 美观的用户界面
- 实时对话功能
- 智能问答系统
- 响应式设计

## 技术栈

- 前端：React + Vite
- 后端：Express.js
- API集成：OpenAI API

## 本地开发

1. 克隆仓库
```bash
git clone [your-repository-url]
cd wenwen
```

2. 安装依赖
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
```

3. 配置环境变量
- 在项目根目录创建 `.env` 文件
- 添加必要的环境变量

4. 启动开发服务器
```bash
# 启动后端服务器
npm start

# 在另一个终端启动前端开发服务器
cd client
npm run dev
```

## 部署

本项目使用 Vercel 进行部署。

1. 在 Vercel 上导入项目
2. 配置环境变量
   - 添加 `COZE_API_KEY` 环境变量
3. 部署项目
   - Vercel 会自动检测项目配置并进行构建部署
   - 构建命令和输出目录已在 `vercel.json` 中配置

## 许可证

MIT