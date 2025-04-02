# Finance Tracker App 🚀

![App Screenshot](/screenshot.png) <!-- Add an image of your app here -->

Web application for personal financial management with integrated artificial intelligence for automatic expense categorization.

## ✨ Main Features

- 📊 Interactive financial dashboard
- 💰 Income and expense tracking
- 🏷️ Automatic categorization using Gemini AI
- 📈 Data visualization with charts
- 🤖 Smart financial assistant
- 🔄 Real-time synchronization with Firestore
- 💬 Chatbot with Gemini AI for financial queries

## 🛠️ Technologies Used

- **Frontend**: Next.js, Tailwind CSS, TypeScript
- **Backend**: Firebase Firestore
- **AI**: Google Gemini API
- **Charts**: Chart.js
- **Icons**: React Icons

## 🔧 Prerequisites

- Node.js v16+
- npm or yarn
- Firebase account
- Google Gemini API Key

## 🚀 How to Start the Project

### Install dependencies

```bash
npm install
# or
yarn install
```

### Configure environment variables

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### Start the application

```bash
npm run dev
# or
yarn dev
```

The application will be available at: [http://localhost:3000](http://localhost:3000)

## 🧠 Technical Explanation

### Project Architecture

```bash
finance-tracker/
├── components/       # Reusable components
├── lib/              # Utility functions
├── types/            # TypeScript types
├── firebase/         # Firebase configuration
├── pages/            # Application routes
└── styles/           # Global styles
```

### Categorization Flow with Gemini AI

1. The user enters a new expense.
2. The description is sent to Gemini API.
3. Gemini returns the category, icon, and color.
4. The app automatically displays the categorized expense.

```typescript
// Example classification function
async function classifyExpense(description: string) {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`
    },
    body: JSON.stringify({ description })
  });
  return response.json();
}
```

### Firebase Integration

- **Firestore**: Stores income and expenses.
