"use client";

import { useState, useRef, use, useEffect } from "react";

import { currencyFormatter } from "@/lib/utils";
import { ExpensesItems } from "@/components/ExpensesItems";
import { Modal } from "@/components/Modal";
import { classifyExpense } from "@/lib/classifyExpense";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FaRegTrashAlt } from "react-icons/fa";

import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';



ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [income, setIncome] = useState<{ id: string; createAt: Date;[key: string]: any }[]>([]);

  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const expenseAmountRef = useRef<HTMLInputElement>(null);
  const expenseDescriptionRef = useRef<HTMLInputElement>(null);
  const [expenses, setExpenses] = useState<{ id: string; amount: string; description: string; category: string; icon: string; color: string; createAt: Date }[]>([]);



  const addIncomeHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newIncome = {
      amount: amountRef.current?.value,
      description: descriptionRef.current?.value,
      createAt: new Date(),
    }

    const collectionRef = collection(db, "income")
    try {
      const docSnap = await addDoc(collectionRef, newIncome)


      setIncome((prevState) => {
        return [
          ...prevState,
          {
            id: docSnap.id,
            ...newIncome,
          },
        ];
      });
      descriptionRef.current!.value = "";
      amountRef.current!.value = "";
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred");
      }
    }

  }


  const deleteIncomeEntryHandler = async (id: string) => {
    const docRef = doc(db, "income", id);
    try {
      await deleteDoc(docRef);
      setIncome((prevState) => {
        return prevState.filter((income) => income.id !== id);
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred");
      }
    }
  }

  useEffect(() => {
    const getIncomeData = async () => {
      const collectionRef = collection(db, "income");
      const docSnap = await getDocs(collectionRef);
      const data = docSnap.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
          createAt: new Date(doc.data().createAt.toMillis()),
        };
      });
      setIncome(data);
    };
    getIncomeData();
  }, []);

  const addExpenseHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const description = expenseDescriptionRef.current?.value;
    const amount = expenseAmountRef.current?.value;
  
    if (!description || !amount) return;
  
    // Llamar a la API para clasificar la categoría del gasto
    const categoryData = await classifyExpense(description);
  
    const newExpense = {
      amount,
      description,
      category: categoryData.category,  // Guardamos solo el nombre de la categoría como string
      icon: String(categoryData.icon),  // Convertimos el icono a string para que coincida con el tipo esperado
      color: categoryData.color,
      createAt: new Date(),
    };
  
    try {
      const docRef = await addDoc(collection(db, "expenses"), newExpense);
  
      setExpenses((prev) => [
        ...prev,
        { id: docRef.id, ...newExpense },
      ]);
  
      expenseDescriptionRef.current!.value = "";
      expenseAmountRef.current!.value = "";
      setShowAddExpenseModal(false);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };
  
  return (
    <>
      <Modal show={showAddIncomeModal} onClose={setShowAddIncomeModal}>
        <form onSubmit={addIncomeHandler} className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <label htmlFor="amount">Income Amount</label>
            <input className="px-4 py-2 rounded-md bg-slate-700 text-slate-200"
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
            <input className="px-4 py-2 rounded-md bg-slate-700 text-slate-200"
              id="amount"
              type="string"
              name="description"
              ref={descriptionRef}
              placeholder="Enter a description"
              required
            />
          </section>
          <button type="submit" className="btn self-center text-lime-600">Add Income</button>
        </form>

        <section className="flex flex-col gap-4 mt-6">
          <h3 className="text-2xl font-bold">Income History</h3>
          {income.map((i) => {
            return (
              <section key={i.id} className="flex items-center justify-between px-4 py-2 bg-slate-700 rounded-md">
                <span>
                  <p className="font-semibold">{i.description}</p>
                  <small className="text-xs">{i.createAt.toISOString()}</small>
                </span>
                <p className="flex items-center gap-2">{currencyFormatter(i.amount)}</p>
                <button onClick={() => { deleteIncomeEntryHandler(i.id) }} className="text-red-600 hover:text-red-400 transition-colors duration-200">
                  <FaRegTrashAlt />
                </button>

              </section>
            );
          })}
        </section>
      </Modal>
      <Modal show={showAddExpenseModal} onClose={setShowAddExpenseModal}>
        <form onSubmit={addExpenseHandler} className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <label htmlFor="expenseAmount">Expense Amount</label>
            <input className="px-4 py-2 rounded-md bg-slate-700 text-slate-200"
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
            <input className="px-4 py-2 rounded-md bg-slate-700 text-slate-200"
              id="expenseDescription"
              type="string"
              name="expenseDescription"
              ref={expenseDescriptionRef}
              placeholder="Enter a description"
              required
            />
          </section>
          <button type="submit" className="btn self-center text-red-600">Add Expense</button>
        </form>
      </Modal>

      <main className=" container max-w-2xl p-6 mx-auto font-poppins">
        <section>
          <small className="text-md"> My balance </small>
          <h2 className="text-4xl font-bold">{currencyFormatter(10000)}</h2>
        </section>
        <section className="flex items-center justify-between mt-6">
          <button onClick={() => { setShowAddExpenseModal(true)}} className="btn text-lime-600"> + Expenses</button>
          <button onClick={() => { setShowAddIncomeModal(true)}} className="btn text-red-600"> + Income </button>
        </section>
        <section className="py-6">
          <h3 className="text-2xl">My expenses</h3>
          <span className="flex flex-col gap-4 mt-4">
          </span>
          {expenses.map((expense) => (
            <section key={expense.id} className="flex items-center justify-between px-4 py-2 bg-slate-700 rounded-md">
              <span className="flex items-center gap-2">
                <span style={{ color: expense.color }}>{expense.icon}</span>
                <p className="font-semibold">{expense.description}</p>
              </span>
              <span>{expense.category}</span>
              <p className="flex items-center gap-2">{currencyFormatter(expense.amount)}</p>
              <button className="text-red-600 hover:text-red-400 transition-colors duration-200">
                <FaRegTrashAlt />
              </button>
            </section>
          ))}
          <span className="mt-6 flex items-center justify-center w-2/3 mx-auto">
          </span>
        </section>
      </main>
    </>
  );
}
