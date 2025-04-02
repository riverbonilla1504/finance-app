"use client";

import { useState, useRef, useEffect } from "react";

import { currencyFormatter } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { classifyExpense } from "@/lib/classifyExpense";
import { getCategoryIcon } from "@/lib/Icons";
import FinancialChatbot from "@/components/FinancialChatBot";
import { Income, Expense } from "@/lib/types/financial";

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { FaRegTrashAlt } from "react-icons/fa";

import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Home() {
  const [income, setIncome] = useState<Income[]>([]);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const expenseAmountRef = useRef<HTMLInputElement>(null);
  const expenseDescriptionRef = useRef<HTMLInputElement>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Chart display state
  const [activeChart, setActiveChart] = useState<'expense' | 'income' | 'both'>('both');

  const addIncomeHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const amount = Number(amountRef.current?.value);
    const description = descriptionRef.current?.value;

    if (!amount || !description) return;

    const newIncome: Omit<Income, "id"> = {
      amount,
      description,
      createAt: new Date(),
    };

    try {
      const docSnap = await addDoc(collection(db, "income"), newIncome);

      setIncome((prevState) => [
        ...prevState,
        { id: docSnap.id, ...newIncome },
      ]);

      descriptionRef.current!.value = "";
      amountRef.current!.value = "";
      setShowAddIncomeModal(false);
    } catch (error) {
      console.error("Error adding income:", error);
    }
  };

  const deleteIncomeEntryHandler = async (id: string) => {
    try {
      await deleteDoc(doc(db, "income", id));
      setIncome((prevState) => prevState.filter((income) => income.id !== id));
    } catch (error) {
      console.error("Error deleting income:", error);
    }
  };

  useEffect(() => {
    const getIncomeData = async () => {
      const collectionRef = collection(db, "income");
      const docSnap = await getDocs(collectionRef);
      const data = docSnap.docs.map((doc) => ({
        id: doc.id,
        amount: doc.data().amount as number,
        description: doc.data().description as string,
        createAt: new Date(doc.data().createAt.toMillis()),
      }));
      setIncome(data);
    };
    getIncomeData();
  }, []);

  const addExpenseHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const amount = Number(expenseAmountRef.current?.value);
    const description = expenseDescriptionRef.current?.value;

    if (!description || !amount) return;

    const categoryData = await classifyExpense(description);

    const newExpense: Omit<Expense, "id"> = {
      amount,
      description,
      category: categoryData.category,
      icon: String(categoryData.icon),
      color: categoryData.color,
      createAt: new Date(),
    };

    try {
      const docRef = await addDoc(collection(db, "expenses"), newExpense);

      setExpenses((prev) => [...prev, { id: docRef.id, ...newExpense }]);

      expenseDescriptionRef.current!.value = "";
      expenseAmountRef.current!.value = "";
      setShowAddExpenseModal(false);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const deleteExpenseEntryHandler = async (id: string) => {
    try {
      await deleteDoc(doc(db, "expenses", id));
      setExpenses((prevState) => prevState.filter((expense) => expense.id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  useEffect(() => {
    const getExpenseData = async () => {
      const collectionRef = collection(db, "expenses");
      const docSnap = await getDocs(collectionRef);
      const data = docSnap.docs.map((doc) => ({
        id: doc.id,
        amount: doc.data().amount as number,
        description: doc.data().description as string,
        category: doc.data().category as string,
        icon: doc.data().icon as string,
        color: doc.data().color as string,
        createAt: new Date(doc.data().createAt.toMillis()),
      }));
      setExpenses(data);
    };
    getExpenseData();
  }, []);

  // Prepare data for expense chart by category
  const prepareExpenseChartData = () => {
    // Group expenses by category
    const categoryMap = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = {
          total: 0,
          color: expense.color
        };
      }
      acc[expense.category].total += expense.amount;
      return acc;
    }, {} as Record<string, { total: number, color: string }>);

    const labels = Object.keys(categoryMap);
    const data = labels.map(category => categoryMap[category].total);
    const backgroundColor = labels.map(category => categoryMap[category].color);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for monthly income vs expense comparison
  const prepareMonthlyComparisonData = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize data structure for the current year
    const currentYear = new Date().getFullYear();
    const monthlyData = monthNames.reduce((acc, month, index) => {
      acc[index] = { income: 0, expense: 0 };
      return acc;
    }, {} as Record<number, { income: number, expense: number }>);

    // Fill in income data
    income.forEach(inc => {
      const month = inc.createAt.getMonth();
      if (inc.createAt.getFullYear() === currentYear) {
        monthlyData[month].income += inc.amount;
      }
    });

    // Fill in expense data
    expenses.forEach(exp => {
      const month = exp.createAt.getMonth();
      if (exp.createAt.getFullYear() === currentYear) {
        monthlyData[month].expense += exp.amount;
      }
    });

    return {
      labels: monthNames,
      datasets: [
        {
          label: 'Income',
          data: Object.values(monthlyData).map(d => d.income),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        },
        {
          label: 'Expenses',
          data: Object.values(monthlyData).map(d => d.expense),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
        }
      ]
    };
  };

  // Chart options
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Expenses by Category',
        color: '#e5e7eb',
        font: {
          size: 16
        }
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Income vs Expenses',
        color: '#e5e7eb',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#e5e7eb',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        }
      },
      x: {
        ticks: {
          color: '#e5e7eb',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        }
      }
    }
  };

  return (
    <>
      <Modal show={showAddIncomeModal} onClose={setShowAddIncomeModal}>
        <form onSubmit={addIncomeHandler} className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <label htmlFor="amount">Income Amount</label>
            <input
              className="px-4 py-2 rounded-md bg-slate-700 text-slate-200"
              id="amount"
              name="amount"
              type="number"
              ref={amountRef}
              placeholder="Enter income amount"
              required
            />
          </section>
          <section className="flex flex-col gap-4">
            <label htmlFor="description">Description</label>
            <input
              className="px-4 py-2 rounded-md bg-slate-700 text-slate-200"
              id="description"
              type="text"
              name="description"
              ref={descriptionRef}
              placeholder="Enter a description"
              required
            />
          </section>
          <button type="submit" className="btn self-center text-lime-600">
            Add Income
          </button>

          {/* Income History */}
          {income.length > 0 && (
            <section className="mt-4">
              <h3 className="text-lg font-semibold">Income History</h3>
              <ul className="mt-2 max-h-40 overflow-y-auto">
                {income.map((inc) => (
                  <li key={inc.id} className="flex justify-between items-center">
                    <span>{inc.description}</span>
                    <div className="flex items-center">
                      <span>{currencyFormatter(inc.amount)}</span>
                      <button
                        className="ml-2 text-red-600"
                        onClick={() => deleteIncomeEntryHandler(inc.id)}
                      >
                        <FaRegTrashAlt />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </form>
      </Modal>
      <Modal show={showAddExpenseModal} onClose={setShowAddExpenseModal}>
        <form onSubmit={addExpenseHandler} className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <label htmlFor="expenseAmount">Expense Amount</label>
            <input
              className="px-4 py-2 rounded-md bg-slate-700 text-slate-200"
              id="expenseAmount"
              name="expenseAmount"
              type="number"
              ref={expenseAmountRef}
              placeholder="Enter expense amount"
              required
            />
          </section>
          <section className="flex flex-col gap-4">
            <label htmlFor="expenseDescription">Description</label>
            <input
              className="px-4 py-2 rounded-md bg-slate-700 text-slate-200"
              id="expenseDescription"
              type="text"
              name="expenseDescription"
              ref={expenseDescriptionRef}
              placeholder="Enter a description"
              required
            />
          </section>
          <button type="submit" className="btn self-center text-red-600">
            Add Expense
          </button>
        </form>
      </Modal>
      <main className="relative min-h-screen container max-w-2xl p-6 mx-auto font-poppins">
        <section>
          <small className="text-md">My balance</small>
          <h2 className="text-4xl font-bold">{currencyFormatter(balance)}</h2>
        </section>
        <section className="flex items-center justify-between mt-6">
          <button onClick={() => setShowAddExpenseModal(true)} className="btn text-red-600">
            + Expenses
          </button>
          <button onClick={() => setShowAddIncomeModal(true)} className="btn text-lime-600">
            + Income
          </button>
        </section>

        {/* Chart Section */}
        <section className="mt-8 p-4 bg-slate-800 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Financial Overview</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveChart('expense')}
                className={`px-3 py-1 rounded-md ${activeChart === 'expense' ? 'bg-red-600' : 'bg-slate-700'}`}
              >
                Expenses
              </button>
              <button
                onClick={() => setActiveChart('income')}
                className={`px-3 py-1 rounded-md ${activeChart === 'income' ? 'bg-lime-600' : 'bg-slate-700'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setActiveChart('both')}
                className={`px-3 py-1 rounded-md ${activeChart === 'both' ? 'bg-blue-600' : 'bg-slate-700'}`}
              >
                Both
              </button>
            </div>
          </div>

          <div className={`chart-container ${activeChart === 'expense' || activeChart === 'both' ? 'block' : 'hidden'}`}>
            {expenses.length > 0 ? (
              <div className="h-64">
                <Doughnut data={prepareExpenseChartData()} options={doughnutOptions} />
              </div>
            ) : (
              <p className="text-center py-8">No expense data to display</p>
            )}
          </div>

          <div className={`chart-container mt-8 ${activeChart === 'income' || activeChart === 'both' ? 'block' : 'hidden'}`}>
            {(income.length > 0 || expenses.length > 0) ? (
              <div className="h-64">
                <Bar data={prepareMonthlyComparisonData()} options={barOptions} />
              </div>
            ) : (
              <p className="text-center py-8">No data to display</p>
            )}
          </div>
        </section>

        {/* Expenses List Section */}
        <section className="mt-6">
          <h3 className="text-xl font-bold">Expenses</h3>
          {expenses.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex justify-between items-center mt-2">
                  <div className="flex items-center">
                    <span
                      className="rounded-full w-8 h-8 flex items-center justify-center"
                      style={{ backgroundColor: expense.color }}
                    >
                      {getCategoryIcon(expense.icon)}
                    </span>
                    <span className="ml-2">{expense.description}</span>
                  </div>
                  <div className="flex items-center">
                    <span>{currencyFormatter(expense.amount)}</span>
                    <button
                      className="ml-2 text-red-600"
                      onClick={() => deleteExpenseEntryHandler(expense.id)}
                    >
                      <FaRegTrashAlt />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No expenses recorded.</p>
          )}
        </section>

        {/* Income List Section */}
        <section className="mt-6">
          <h3 className="text-xl font-bold">Income</h3>
          {income.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto">
              {income.map((inc) => (
                <li key={inc.id} className="flex justify-between items-center mt-2">
                  <span>{inc.description}</span>
                  <div className="flex items-center">
                    <span>{currencyFormatter(inc.amount)}</span>
                    <button
                      className="ml-2 text-red-600"
                      onClick={() => deleteIncomeEntryHandler(inc.id)}
                    >
                      <FaRegTrashAlt />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No income recorded.</p>
          )}
        </section>

        <span className="fixed bottom-4 flex justify-end p-6">
          <FinancialChatbot expenses={expenses} incomes={income} />
        </span>
      </main>
    </>
  );
}