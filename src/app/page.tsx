"use client";

import { useState, useRef, use, useEffect } from "react";

import { currencyFormatter } from "@/lib/utils";
import { ExpensesItems } from "@/components/ExpensesItems";
import { Modal } from "@/components/Modal";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FaRegTrashAlt } from "react-icons/fa";

import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";



ChartJS.register(ArcElement, Tooltip, Legend);


const expensesData = [
  { id: 1, color: "#000", title: "Food", total: 200 },
  { id: 2, color: "#ff0000", title: "Transport", total: 100 },
  { id: 3, color: "#00ff00", title: "Entertainment", total: 300 },
];



export default function Home() {
  const [income, setIncome] = useState<{ id: string; createAt: Date;[key: string]: any }[]>([]);

  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);



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
      <main className=" container max-w-2xl p-6 mx-auto font-poppins">
        <section>
          <small className="text-md"> My balance </small>
          <h2 className="text-4xl font-bold">{currencyFormatter(10000)}</h2>
        </section>
        <section className="flex items-center justify-between mt-6">
          <button onClick={() => { }} className="btn text-lime-600"> + Expenses</button>
          <button onClick={() => { setShowAddIncomeModal(true) }} className="btn text-red-600"> + Income </button>
        </section>
        <section className="py-6">
          <h3 className="text-2xl">My expenses</h3>
          <span className="flex flex-col gap-4 mt-4">
          </span>
          {expensesData.map((expense) => {
            return (
              <ExpensesItems
                key={expense.id}
                color={expense.color}
                title={expense.title}
                total={expense.total}
              />
            );
          })}
          <span className="mt-6 flex items-center justify-center w-2/3 mx-auto">
            <Doughnut data={{
              labels: expensesData.map(expense => expense.title),
              datasets: [{
                label: 'Expenses',
                data: expensesData.map(expense => expense.total),
                backgroundColor: expensesData.map(expense => expense.color),
                borderColor: ["#000", "#000", "#000"],
                borderWidth: 1,
                hoverOffset: 4,
                hoverBorderColor: "#000",
                hoverBorderWidth: 2,
                rotation: 0,
                circumference: 360,
              }]

            }} />
          </span>
        </section>
      </main>
    </>
  );
}
