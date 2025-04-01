import { JSX } from "react";
import { FaUtensils, FaBus, FaFilm, FaShoppingCart, FaQuestion } from "react-icons/fa";

const categoryIcons: Record<string, JSX.Element> = {
    "Food": <FaUtensils />,
    "Transport": <FaBus />,
    "Entertainment": <FaFilm />,
    "Shopping": <FaShoppingCart />,
    "Other": <FaQuestion />,
};

export function getCategoryIcon(category: string): JSX.Element {
    return categoryIcons[category] || <FaQuestion />;
}
