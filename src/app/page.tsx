"use client";

import { useState, useRef, useEffect } from "react";

import { currencyFormatter } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { classifyExpense } from "@/lib/classifyExpense";
import { getCategoryIcon } from "@/lib/Icons";
import FinancialChatbot from "@/components/FinancialChatBot";
import { Income, Expense } from "@/lib/types/financial";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
//import { Doughnut } from "react-chartjs-2";
import { FaRegTrashAlt } from "react-icons/fa";

import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";

ChartJS.register(ArcElement, Tooltip, Legend);

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
    } catch (error) {
      console.error("Error adding income:", error);
    }
  };

  //const deleteIncomeEntryHandler = async (id: string) => {
  //  try {
  //    await deleteDoc(doc(db, "income", id));
  //    setIncome((prevState) => prevState.filter((income) => income.id !== id));
  //  } catch (error) {
  //    console.error("Error deleting income:", error);
  //  }
  //};

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

          {/* Historial de ingresos */}
          {income.length > 0 && (
            <section className="mt-4">
              <h3 className="text-lg font-semibold">Income History</h3>
              <ul className="mt-2">
                {income.map((inc) => (
                  <li key={inc.id} className="flex justify-between items-center">
                    <span>{inc.description}</span>
                    <span>{currencyFormatter(inc.amount)}</span>
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
      <main className=" relative min-h-screen container max-w-2xl p-6 mx-auto font-poppins">
        <section>
          <small className="text-md">My balance</small>
          <h2 className="text-4xl font-bold">{currencyFormatter(balance)}</h2>
        </section>
        <section className="flex items-center justify-between mt-6">
          <button onClick={() => setShowAddExpenseModal(true)} className="btn text-lime-600">
            + Expenses
          </button>
          <button onClick={() => setShowAddIncomeModal(true)} className="btn text-red-600">
            + Income
          </button>
        </section>

        {/* Expenses List Section */}
        <section className="mt-6">
          <h3 className="text-xl font-bold">Expenses</h3>
          {expenses.length > 0 ? (
            <ul>
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
        <span className="fixed bottom-4 flex justify-end p-6 ">
          <FinancialChatbot expenses={expenses} incomes={income} />
        </span>
      </main>


    </>
  );
}

