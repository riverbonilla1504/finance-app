import { JSX } from "react";
import { FaUtensils, FaBus, FaFilm, FaShoppingCart, FaQuestion } from "react-icons/fa";


const categoryIcons: Record<string, JSX.Element> = {
  "Food": <FaUtensils />,
  "Transport": <FaBus />,
  "Entertainment": <FaFilm />,
  "Shopping": <FaShoppingCart />,
  "Other": <FaQuestion />,
};

// 🔹 Asocia cada categoría con un color
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Food": "#ff5733",
    "Transport": "#ffbd33",
    "Entertainment": "#3380ff",
    "Shopping": "#33ff57",
    "Other": "#777",
  };
  return colors[category] || "#777";
};

// 🔹 Función para clasificar gastos usando Gemini 2.0 Flash
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

    // 🔹 Verifica que la estructura de la respuesta sea válida
    if (!data?.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      console.error("Error en la respuesta de Gemini:", data);
      throw new Error("No se pudo obtener una respuesta válida de Gemini.");
    }

    // 🔹 Extrae y limpia la categoría (elimina espacios al principio y final)
    const rawCategory = data.candidates[0].content.parts[0].text.trim(); // ⬅️ Eliminamos espacios al principio y al final
    // 🔹 Verifica si la categoría es válid
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
