import { JSX } from "react";
import { FaUtensils, FaBus, FaFilm, FaShoppingCart, FaQuestion } from "react-icons/fa";


const categoryIcons: Record<string, JSX.Element> = {
  "Food": <FaUtensils />,
  "Transport": <FaBus />,
  "Entertainment": <FaFilm />,
  "Shopping": <FaShoppingCart />,
  "Other": <FaQuestion />,
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Food": "hsl(10, 50%, 55%)",      // Rojo terroso (--color-error)
    "Transport": "hsl(35, 40%, 50%)", // Dorado crema (--color-primary)
    "Entertainment": "hsl(200, 30%, 55%)", // Azul crema (--color-savings)
    "Shopping": "hsl(80, 30%, 50%)",   // Verde cremoso (--color-success)
    "Bills": "hsl(45, 60%, 50%)",     // Ámbar suave (--color-warning)
    "Other": "hsl(35, 15%, 65%)",      // Texto secundario
  };
  return colors[category] || "hsl(35, 15%, 65%)";
};

export const classifyExpense = async (description: string) => {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Clasifica el siguiente gasto en una de estas categorías: Food, Transport, Entertainment, Shopping, Other. Devuelve solo el nombre de la categoría sin explicaciones adicionales: "${description}"`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Respuesta completa de Gemini:", JSON.stringify(data, null, 2));


    if (!data?.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      console.error("Error en la respuesta de Gemini:", data);
      throw new Error("No se pudo obtener una respuesta válida de Gemini.");
    }


    const rawCategory = data.candidates[0].content.parts[0].text.trim();
    console.log("Categoría cruda:", rawCategory);
    const category = categoryIcons[rawCategory] ? rawCategory : "Other";
    console.log("Categoría final:", category);
    const test = "example string";
    console.log("sdad:", test);
    return {
      category,
      icon: category,
      color: getCategoryColor(category),
    };
  } catch (error) {
    console.error("Error clasificando el gasto:", error);
    return {
      category: "Other",
      icon: categoryIcons["Other"],
      color: getCategoryColor("Other"),
    };
  }
};
