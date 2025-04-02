"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { currencyFormatter } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { classifyExpense } from "@/lib/classifyExpense";
import { getCategoryIcon } from "@/lib/Icons";
import FinancialChatbot from "@/components/FinancialChatBot";
import { Income, Expense } from "@/lib/types/financial";
import { AuthContext } from "@/lib/store/auth-context";
import SignIn from "@/components/SignIn";
import { useToast } from "@/lib/useToast";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { FaRegTrashAlt } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, where, query } from "firebase/firestore";

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
  const { showToast, ToastContainer } = useToast();
  const [isLoading, setIsLoading] = useState({
    income: false,
    expense: false,
    deleteIncome: false,
    deleteExpense: false
  });

  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const balance = totalIncome - totalExpenses;
  const [activeChart, setActiveChart] = useState<'expense' | 'income' | 'both'>('both');

  const authContext = useContext(AuthContext);
  if (!authContext) {
    return null;
  }
  const { user } = authContext;

  const addIncomeHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading({ ...isLoading, income: true });
    const amount = Number(amountRef.current?.value);
    const description = descriptionRef.current?.value;

    if (!amount || !description) {
      setIsLoading({ ...isLoading, income: false });
      return;
    }

    const newIncome: Omit<Income, "id"> = {
      amount,
      description,
      createAt: new Date(),
      uid: user.uid
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
      showToast('Income added successfully!', 'success');
    } catch (error) {
      console.error("Error adding income:", error);
      showToast('Failed to add income', 'error');
    } finally {
      setIsLoading({ ...isLoading, income: false });
    }
  };

  const deleteIncomeEntryHandler = async (id: string) => {
    setIsLoading({ ...isLoading, deleteIncome: true });
    try {
      await deleteDoc(doc(db, "income", id));
      setIncome((prevState) => prevState.filter((income) => income.id !== id));
      showToast('Income deleted successfully!', 'success');
    } catch (error) {
      console.error("Error deleting income:", error);
      showToast('Failed to delete income', 'error');
    } finally {
      setIsLoading({ ...isLoading, deleteIncome: false });
    }
  };

  useEffect(() => {
    const getIncomeData = async () => {
      if (!user) return;

      try {
        const collectionRef = collection(db, "income");
        const q = query(collectionRef, where("uid", "==", user.uid));
        const docSnap = await getDocs(q);
        const data = docSnap.docs.map((doc) => ({
          id: doc.id,
          amount: doc.data().amount as number,
          description: doc.data().description as string,
          createAt: new Date(doc.data().createAt.toMillis()),
          uid: doc.data().uid as string
        }));
        setIncome(data);
        showToast('Income data loaded', 'info');
      } catch (error) {
        console.error("Error loading income data:", error);
        showToast('Failed to load income data', 'error');
      }
    };
    getIncomeData();
  }, [user]);

  const addExpenseHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading({ ...isLoading, expense: true });
    const amount = Number(expenseAmountRef.current?.value);
    const description = expenseDescriptionRef.current?.value;

    if (!description || !amount) {
      setIsLoading({ ...isLoading, expense: false });
      return;
    }

    try {
      const categoryData = await classifyExpense(description);
      const newExpense: Omit<Expense, "id"> = {
        amount,
        description,
        category: categoryData.category,
        icon: String(categoryData.icon),
        color: categoryData.color,
        createAt: new Date(),
        uid: user.uid
      };

      const docRef = await addDoc(collection(db, "expenses"), newExpense);
      setExpenses((prev) => [...prev, { id: docRef.id, ...newExpense }]);
      expenseDescriptionRef.current!.value = "";
      expenseAmountRef.current!.value = "";
      setShowAddExpenseModal(false);
      showToast('Expense added successfully!', 'success');
    } catch (error) {
      console.error("Error adding expense:", error);
      showToast('Failed to add expense', 'error');
    } finally {
      setIsLoading({ ...isLoading, expense: false });
    }
  };

  const deleteExpenseEntryHandler = async (id: string) => {
    setIsLoading({ ...isLoading, deleteExpense: true });
    try {
      await deleteDoc(doc(db, "expenses", id));
      setExpenses((prevState) => prevState.filter((expense) => expense.id !== id));
      showToast('Expense deleted successfully!', 'success');
    } catch (error) {
      console.error("Error deleting expense:", error);
      showToast('Failed to delete expense', 'error');
    } finally {
      setIsLoading({ ...isLoading, deleteExpense: false });
    }
  };

  useEffect(() => {
    const getExpenseData = async () => {
      if (!user) return;

      try {
        const collectionRef = collection(db, "expenses");
        const q = query(collectionRef, where("uid", "==", user.uid));
        const docSnap = await getDocs(q);
        const data = docSnap.docs.map((doc) => ({
          id: doc.id,
          amount: doc.data().amount as number,
          description: doc.data().description as string,
          category: doc.data().category as string,
          icon: doc.data().icon as string,
          color: doc.data().color as string,
          createAt: new Date(doc.data().createAt.toMillis()),
          uid: doc.data().uid as string
        }));
        setExpenses(data);
        showToast('Expenses data loaded', 'info');
      } catch (error) {
        console.error("Error loading expenses data:", error);
        showToast('Failed to load expenses data', 'error');
      }
    };
    getExpenseData();
  }, [user]);


  const prepareExpenseChartData = () => {
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

  const prepareMonthlyComparisonData = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const monthlyData = monthNames.reduce((acc, month, index) => {
      acc[index] = { income: 0, expense: 0 };
      return acc;
    }, {} as Record<number, { income: number, expense: number }>);

    income.forEach(inc => {
      const month = inc.createAt.getMonth();
      if (inc.createAt.getFullYear() === currentYear) {
        monthlyData[month].income += inc.amount;
      }
    });

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


  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-background">
        <SignIn />
      </main>
    );
  }

  return (
    <>
      <ToastContainer />
      <Modal show={showAddIncomeModal} onClose={setShowAddIncomeModal}>
        <form onSubmit={addIncomeHandler} className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <label htmlFor="amount" className="text-primary-foreground">Income Amount</label>
            <input
              className="px-4 py-2 font-poppins rounded-md bg-card text-primary-foreground border border-border"
              id="amount"
              name="amount"
              type="number"
              ref={amountRef}
              placeholder="Enter income amount"
              required
            />
          </section>
          <section className="flex flex-col gap-4">
            <label htmlFor="description" className="text-primary-foreground">Description</label>
            <input
              className="px-4 py-2 rounded-md bg-card text-primary-foreground border border-border"
              id="description"
              type="text"
              name="description"
              ref={descriptionRef}
              placeholder="Enter a description"
              required
            />
          </section>
          <button
            type="submit"
            className="px-3 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg self-center rounded-2xl p-1 bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            Add Income
          </button>

          {income.length > 0 && (
            <section className="mt-4">
              <h3 className="text-lg font-semibold text-primary-foreground">Income History</h3>
              <ul className="mt-2 max-h-40 overflow-y-auto">
                {income.map((inc) => (
                  <li key={inc.id} className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-secondary">{inc.description}</span>
                    <section className="flex items-center">
                      <span className="text-success">{currencyFormatter(inc.amount)}</span>
                      <button
                        className="ml-2 text-error transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                        onClick={() => deleteIncomeEntryHandler(inc.id)}
                      >
                        <FaRegTrashAlt />
                      </button>
                    </section>
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
            <label htmlFor="expenseAmount" className="text-primary-foreground">Expense Amount</label>
            <input
              className="px-4 py-2 rounded-md font-poppins bg-card text-primary-foreground border border-border"
              id="expenseAmount"
              name="expenseAmount"
              type="number"
              ref={expenseAmountRef}
              placeholder="Enter expense amount"
              required
            />
          </section>
          <section className="flex flex-col gap-4">
            <label htmlFor="expenseDescription" className="text-primary-foreground">Description</label>
            <input
              className="px-4 py-2 rounded-md bg-card text-primary-foreground border border-border"
              id="expenseDescription"
              type="text"
              name="expenseDescription"
              ref={expenseDescriptionRef}
              placeholder="Enter a description"
              required
            />
          </section>
          <button
            type="submit"
            className="px-3 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg self-center rounded-2xl p-1 bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            Add Expense
          </button>
        </form>
      </Modal>

      <main className="relative min-h-screen container max-w-2xl p-6 mx-auto font-poppins bg-background text-primary-foreground">
        <section>
          <small className="text-secondary">My balance</small>
          <h2 className="text-4xl font-bold">{currencyFormatter(balance)}</h2>
        </section>

        <section className="flex items-center justify-end gap-4 mt-6">
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className=" text-red-200 px-3 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg p-1 bg-primary rounded-2xl hover:bg-primary-hover"
          >
            + Expense
          </button>
          <button
            onClick={() => setShowAddIncomeModal(true)}
            className=" text-green-200 px-3 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg bg-primary rounded-2xl p-1 hover:bg-primary-hover"
          >
            + Income
          </button>
        </section>

        <section className="card-glass mt-8 p-4 rounded-lg">
          <section className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Financial Overview</h3>
            <section className="flex flex-wrap gap-2 gap-y-2">
              <button
                onClick={() => setActiveChart('expense')}
                className={` transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg px-3 py-1 rounded-md ${activeChart === 'expense' ? 'bg-error' : 'bg-card'}`}
              >
                Expenses
              </button>
              <button
                onClick={() => setActiveChart('income')}
                className={`transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg px-3 py-1 rounded-md ${activeChart === 'income' ? 'bg-success' : 'bg-card'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setActiveChart('both')}
                className={`transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg px-3 py-1 rounded-md ${activeChart === 'both' ? 'bg-savings' : 'bg-card'}`}
              >
                Both
              </button>
            </section>
          </section>

          <section className={`${activeChart === 'expense' || activeChart === 'both' ? 'block' : 'hidden'}`}>
            {expenses.length > 0 ? (
              <section className="h-64">
                <Doughnut data={prepareExpenseChartData()} options={doughnutOptions} />
              </section>
            ) : (
              <p className="text-center py-8 text-secondary">No expense data to display</p>
            )}
          </section>

          <section className={`mt-8 ${activeChart === 'income' || activeChart === 'both' ? 'block' : 'hidden'}`}>
            {(income.length > 0 || expenses.length > 0) ? (
              <section className="h-64">
                <Bar data={prepareMonthlyComparisonData()} options={barOptions} />
              </section>
            ) : (
              <p className="text-center py-8 text-secondary">No data to display</p>
            )}
          </section>
        </section>

        <section className="mt-6">
          <h3 className="text-xl font-bold  ">Expenses</h3>
          {expenses.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:h-2
          [&::-webkit-scrollbar-track]:bg-card [&::-webkit-scrollbar-thumb]:bg-primary
          hover:[&::-webkit-scrollbar-thumb]:bg-primary-hover">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex justify-between items-center mt-2 py-2 border-b border-border">
                  <section className="flex items-center ">
                    <span
                      className="rounded-full w-8 h-8 flex items-center justify-center "
                      style={{ backgroundColor: expense.color }}
                    >
                      {getCategoryIcon(expense.icon)}
                    </span>
                    <span className="ml-2">{expense.description}</span>
                  </section>
                  <section className="flex items-center">
                    <span className="text-error">{currencyFormatter(expense.amount)}</span>
                    <button
                      className="ml-2 text-error transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                      onClick={() => deleteExpenseEntryHandler(expense.id)}
                    >
                      <FaRegTrashAlt />
                    </button>
                  </section>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary">No expenses recorded.</p>
          )}
        </section>

        <section className="mt-6">
          <h3 className="text-xl font-bold ">Income</h3>
          {income.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto">
              {income.map((inc) => (
                <li key={inc.id} className="flex justify-between items-center mt-2 py-2 border-b border-border">
                  <span>{inc.description}</span>
                  <section className="flex items-center">
                    <span className="text-success">{currencyFormatter(inc.amount)}</span>
                    <button
                      className="ml-2 text-error transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                      onClick={() => deleteIncomeEntryHandler(inc.id)}
                    >
                      <FaRegTrashAlt />
                    </button>
                  </section>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary">No income recorded.</p>
          )}
        </section>

        <span className="fixed bottom-4 flex justify-center p-6">
          <FinancialChatbot expenses={expenses} incomes={income} />
        </span>
      </main>
    </>
  );
}