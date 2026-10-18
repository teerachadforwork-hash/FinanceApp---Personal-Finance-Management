เว็บจัดการการเงินส่วนบุคคล

# Personal Finance Management Web Application

This project is a comprehensive web application for personal finance management, allowing users to track income, expenses, manage budgets, and analyze their financial health.

## Features

- **Dashboard**: Overview of financial status with charts and key metrics
- **Transactions**: Record and manage income and expenses
- **Budgets**: Create and track budgets for different categories
- **Reports**: Generate financial reports and insights
- **User Management**: Secure authentication and user profiles

## Tech Stack

- **Frontend**: React, Redux Toolkit, Tailwind CSS
- **Backend**: Node.js, Express.js, PostgreSQL
- **Authentication**: JWT, bcrypt
- **Charts**: Chart.js, react-chartjs-2

## Installation

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory with the following configuration:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/finance_db
   JWT_SECRET=your_jwt_secret_key
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Register for a new account or log in with existing credentials
3. Explore the dashboard, add transactions, and manage your finances

## Project Structure

```
personal-finance-app/
├── backend/                # Node.js backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── models/         # Database models
│   ├── migrations/         # Database migrations
│   └── .env                # Environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── features/       # Feature modules
│   │   ├── store/          # Redux store
│   │   ├── services/       # API services
│   │   └── pages/          # Page components
│   └── public/
└── README.md               # Project documentation
```

## Development

### Adding New Features

1. Create a new feature module in `frontend/src/features/`
2. Add corresponding API routes in `backend/src/routes/`
3. Update database models and migrations if needed
4. Test thoroughly before deploying

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Deploy backend
cd backend
npm start
```

### Environment Variables

Ensure all environment variables in `.env` are set correctly for production:

- `PORT`: Server port (e.g., 5000)
- `DATABASE_URL`: Production database connection string
- `JWT_SECRET`: Strong secret key for JWT signing

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For issues or questions, please open an issue in the [Issues](issues) section.

1.1 การจัดการเงินตั้งต้นต่อวัน
	•	ผู้ใช้สามารถกำหนดจำนวนเงินเริ่มต้นได้
	•	ระบบสามารถแสดงเงินคงเหลือจากการคำนวณได้
1.2 การบันทึกรายจ่าย
	•	ผู้ใช้สามารถเพิ่มข้อมูลรายจ่ายได้
	•	ผู้ใช้สามารถแก้ไขข้อมูลรายจ่ายได้
	•	ผู้ใช้สามารถลบข้อมูลรายจ่ายได้
	•	ระบบสามารถแสดงรายการรายจ่ายทั้งหมดได้
1.3 การจัดการหมวดหมู่
	•	ผู้ใช้สามารถเพิ่มหมวดหมู่ได้
	•	ผู้ใช้สามารถแก้ไขหมวดหมู่ได้
	•	ผู้ใช้สามารถลบหมวดหมู่ได้
	•	ระบบสามารถแสดงรายการตามหมวดหมู่ได้
1.4 การสรุปข้อมูล
	•	ระบบสามารถสรุปรายจ่ายรายวันได้
	•	ระบบสามารถสรุปรายจ่ายรายเดือนได้
	•	ระบบสามารถแสดงยอดรวมรายจ่ายทั้งหมดได้
1.5 การแสดงข้อมูลตามหมวดหมู่
	•	ผู้ใช้สามารถเลือกดูข้อมูลรายจ่ายตามหมวดหมู่ได้
	•	ระบบจะแสดง:
	•	วันที่
	•	จำนวนเงิน
	•	รายละเอียด (note)
1.6 การจัดการงบประมาณ
	•	ผู้ใช้สามารถตั้งงบประมาณรายหมวดหมู่ได้	
	•	ระบบสามารถคำนวณการใช้จ่ายเทียบกับงบประมาบได้	
	•	ระบบสามารถแจ้งเตือนเมื่อใช้จ่ายเกิน