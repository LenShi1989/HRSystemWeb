# HRSystemWeb

人資管理系統前端，使用 Vue 3、TypeScript、Pinia、Vue Router、Element Plus 與 ECharts。後端為 ASP.NET Core 8 Web API，資料庫使用 SQL Server。

## 技術架構

| 類別   | 技術                                                              |
| ------ | ----------------------------------------------------------------- |
| 前端   | Vue 3、TypeScript、Vite、Element Plus、Pinia、Vue Router、ECharts |
| 後端   | ASP.NET Core 8 Web API、Entity Framework Core 8、AutoMapper       |
| 資料庫 | SQL Server                                                        |
| 驗證   | JWT Bearer Token、角色權限                                        |

## 目前功能

- 登入驗證：JWT 登入、登入狀態保存、登出。
- 儀表板：員工統計、部門人數圖表、請假摘要。
- 員工管理：員工列表、篩選、新增、編輯、標記離職。
- 員工詳情：基本資料、任職資料、緊急聯絡人、備註、建立/更新時間。
- 部門管理：部門列表、新增、編輯、主管設定。
- 考勤管理：考勤列表、日期/員工篩選、新增/更新打卡紀錄。
- 請假管理：請假列表、新增請假、核准/拒絕。
- 薪資管理：薪資列表、新增薪資、標記發放。
- 帳號管理：帳號列表、新增、編輯角色/員工綁定/啟用狀態、重設密碼。

## 角色權限

後端角色以數字儲存於 `Users.Role`：

| Role | 說明       |
| ---- | ---------- |
| 1    | 一般使用者 |
| 2    | HR         |
| 3    | 主管       |
| 4    | 管理員     |

前端會依角色顯示導覽項目；`帳號管理` 僅管理員可見。後端 `UsersController` 使用 `[Authorize(Roles = "4")]` 限制管理員存取。

## 專案結構

```text
HRSystemWeb/
  src/
    layouts/          # 主版型與側邊欄
    router/           # Vue Router
    services/         # Axios API service
    stores/           # Pinia stores
    views/            # 功能頁面

HRSystem.Api/
  database/
    schema.sql        # SQL Server schema
  HRSystem.Api/
    Controllers/      # Web API controllers
    Models/
      DTOs/           # DTOs
      Entities/       # EF Core entities
    Program.cs
```

## 前端啟動

```bash
npm install
npm run dev
```

預設網址：

```text
http://localhost:5173
```

API base URL 預設為：

```text
http://localhost:5000/api
```

可透過 `.env` 設定：

```env
VITE_API_URL=http://localhost:5000/api
```

## 後端啟動

後端專案位於相鄰目錄：

```bash
cd ../HRSystem.Api/HRSystem.Api
dotnet restore
dotnet run
```

Swagger：

```text
http://localhost:5000/swagger
```

資料庫初始化可使用：

```bash
sqlcmd -S localhost -i ../database/schema.sql
```

或依後端 EF Core migration 流程：

```bash
dotnet ef database update
```

## 初始管理員密碼

`schema.sql` 內的 admin 密碼 hash 是 placeholder。第一次使用前需產生 BCrypt hash 並更新資料庫：

```csharp
string hash = BCrypt.Net.BCrypt.HashPassword("Admin@1234");
```

```sql
UPDATE Users
SET PasswordHash = '<generated_hash>'
WHERE Username = 'admin';
```

## 主要 API

| Method | Endpoint                          | 說明           |
| ------ | --------------------------------- | -------------- |
| POST   | `/api/auth/login`                 | 登入並取得 JWT |
| GET    | `/api/employees`                  | 員工列表       |
| GET    | `/api/employees/{id}`             | 員工詳情       |
| POST   | `/api/employees`                  | 新增員工       |
| PUT    | `/api/employees/{id}`             | 更新員工       |
| DELETE | `/api/employees/{id}`             | 標記員工離職   |
| GET    | `/api/employees/stats`            | 員工統計       |
| GET    | `/api/departments`                | 部門列表       |
| GET    | `/api/departments/{id}`           | 部門詳情       |
| POST   | `/api/departments`                | 新增部門       |
| PUT    | `/api/departments/{id}`           | 更新部門       |
| GET    | `/api/positions`                  | 職位列表       |
| POST   | `/api/positions`                  | 新增職位       |
| PUT    | `/api/positions/{id}`             | 更新職位       |
| GET    | `/api/attendances`                | 考勤列表       |
| POST   | `/api/attendances`                | 新增或更新考勤 |
| GET    | `/api/leaverequests`              | 請假列表       |
| POST   | `/api/leaverequests`              | 新增請假       |
| PATCH  | `/api/leaverequests/{id}/approve` | 審核請假       |
| GET    | `/api/payrolls`                   | 薪資列表       |
| POST   | `/api/payrolls`                   | 新增薪資       |
| PATCH  | `/api/payrolls/{id}/pay`          | 標記薪資已發放 |
| GET    | `/api/users`                      | 帳號列表       |
| GET    | `/api/users/{id}`                 | 帳號詳情       |
| POST   | `/api/users`                      | 新增帳號       |
| PUT    | `/api/users/{id}`                 | 更新帳號       |
| PATCH  | `/api/users/{id}/password`        | 重設密碼       |

## 資料表摘要

- `Departments`：部門資料與主管。
- `Positions`：職位、職級與薪資範圍。
- `Employees`：員工基本資料、任職資料、薪資、緊急聯絡人。
- `Attendances`：員工每日考勤紀錄。
- `LeaveRequests`：請假申請與審核紀錄。
- `Payrolls`：薪資計算與發放狀態。
- `Users`：登入帳號、密碼 hash、角色與員工綁定。

## 建置

```bash
npm run build
```

若本機 PowerShell 因執行原則擋住 `npm.ps1`，可改用：

```bash
npm.cmd run build
```

目前也可用 Vite 打包檢查：

```bash
npx.cmd vite build
```
