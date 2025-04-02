import React, { useState, useEffect, useRef } from "react";
import { FaComment, FaTimes } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { Expense, Income } from "@/lib/types/financial"; // Importa los tipos correctamente

interface ChatMessage {
    type: 'user' | 'bot';
    content: string;
}

interface FinancialChatbotProps {
    expenses: Expense[];
    incomes: Income[];
}

const FinancialChatbot: React.FC<FinancialChatbotProps> = ({ expenses, incomes }) => {
    const [showChatbot, setShowChatbot] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            type: 'bot',
            content: "¡Hola! Soy tu asistente financiero. Puedo ayudarte con información sobre tus gastos e ingresos. ¿En qué puedo ayudarte hoy?"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = { type: 'user' as const, content: chatInput };
        setChatMessages(prev => [...prev, userMessage]);
        setChatInput("");
        setIsLoading(true);

        try {
            const response = await getGeminiResponse(chatInput, expenses, incomes);

            setChatMessages(prev => [...prev, { type: 'bot', content: response }]);
        } catch (error) {
            console.error("Error getting response from Gemini:", error);
            setChatMessages(prev => [
                ...prev,
                {
                    type: 'bot',
                    content: "Lo siento, hubo un problema al procesar tu consulta. Por favor, intenta de nuevo."
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const getGeminiResponse = async (query: string, expenses: Expense[], incomes: Income[]): Promise<string> => {
        try {
            const financialContext = {
                expenses: expenses.map(e => ({
                    amount: e.amount,
                    description: e.description,
                    createAt: e.createAt,
                    category: e.category
                })),
                incomes: incomes.map(i => ({
                    amount: i.amount,
                    description: i.description,  // Cambié source a category para que coincida con el tipo
                    createAt: i.createAt
                })),
                totalExpenses: expenses.reduce((sum, expense) => sum + expense.amount, 0),
                totalIncomes: incomes.reduce((sum, income) => sum + income.amount, 0),
                balance: incomes.reduce((sum, income) => sum + income.amount, 0) -
                    expenses.reduce((sum, expense) => sum + expense.amount, 0)
            };

            const prompt = `
        Actúa como un asistente financiero personal.
        
        Datos financieros del usuario:
        ${JSON.stringify(financialContext, null, 2)}
        
        Consulta del usuario: "${query}"
        
        Responde a la consulta del usuario en español de manera amigable y concisa.
        Ofrece información relevante y útil basada en los datos financieros proporcionados.
        Si el usuario pide información que no está disponible, indícalo amablemente.
        Puedes proporcionar consejos financieros útiles cuando sea apropiado, se conciso con tus respuestas pero muy amigable.
      `;

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
                                parts: [{ text: prompt }],
                            },
                        ],
                    }),
                }
            );

            const data = await response.json();

            if (!data?.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
                console.error("Error en la respuesta de Gemini:", data);
                throw new Error("No se pudo obtener una respuesta válida de Gemini.");
            }

            return data.candidates[0].content.parts[0].text.trim();
        } catch (error) {
            console.error("Error en la llamada a Gemini:", error);
            return "Lo siento, no pude procesar tu consulta. Por favor, intenta de nuevo.";
        }
    };

    return (
        <>
            {showChatbot && (
                <div className="max-w-2xl  w-80 sm:w-96 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 z-50">
                    <div className="chatbot-header bg-blue-600 text-black p-3 flex justify-between items-center">
                        <span className="font-medium">Asistente Financiero</span>
                        <button
                            onClick={() => setShowChatbot(false)}
                            className="text-white hover:text-gray-200"
                            aria-label="Cerrar asistente"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="chatbot-messages h-80 overflow-y-auto p-3 bg-gray-50">
                        {chatMessages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message p-2 rounded-lg mb-2 max-w-[85%] ${msg.type === 'user'
                                    ? 'message-user bg-blue-500 text-white ml-auto'
                                    : 'message-bot bg-gray-200 text-gray-800'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message message-bot bg-gray-200 text-gray-800 p-2 rounded-lg mb-2 max-w-[85%]">
                                <div className="typing-indicator flex space-x-1">
                                    <span className="dot bg-gray-500 rounded-full w-2 h-2 animate-bounce"></span>
                                    <span className="dot bg-gray-500 rounded-full w-2 h-2 animate-bounce delay-75"></span>
                                    <span className="dot bg-gray-500 rounded-full w-2 h-2 animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleChatSubmit} className="chatbot-input p-3 border-t border-gray-200 flex">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Pregunta sobre tus finanzas..."
                            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        >
                            <IoSend />
                        </button>
                    </form>
                </div>
            )}

            {!showChatbot && (
                <button
                    className=" bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
                    onClick={() => setShowChatbot(true)}
                    aria-label="Abrir asistente financiero"
                >
                    <FaComment className="text-xl" />
                </button>
            )}
        </>
    );
};

export default FinancialChatbot;
