import React, { useState, useEffect, useRef } from "react";
import { FaComment, FaTimes } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { Expense, Income } from "@/lib/types/financial";

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
                    description: i.description,
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
                <article className="max-w-2xl w-80 sm:w-96 bg-card rounded-lg shadow-lg overflow-hidden border border-border z-50">

                    <header className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
                        <span className="font-medium">Finance Asistance</span>
                        <button
                            onClick={() => setShowChatbot(false)}
                            className="text-primary-foreground hover:text-secondary transition-colors"
                            aria-label="Cerrar asistente"
                        >
                            <FaTimes />
                        </button>
                    </header>


                    <section
                        className="chatbot-messages h-80 overflow-y-auto p-3 bg-background/50
          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:h-2
          [&::-webkit-scrollbar-track]:bg-card [&::-webkit-scrollbar-thumb]:bg-primary
          hover:[&::-webkit-scrollbar-thumb]:bg-primary-hover"
                    >
                        {chatMessages.map((msg, index) => (
                            <article
                                key={index}
                                className={`p-3 rounded-lg mb-3 max-w-[85%] ${msg.type === 'user'
                                    ? 'bg-primary text-primary-foreground ml-auto'
                                    : 'bg-card text-primary-foreground border border-border'
                                    }`}
                            >
                                {msg.content}
                            </article>
                        ))}


                        {isLoading && (
                            <article className="bg-card text-primary-foreground p-3 rounded-lg mb-3 max-w-[85%] border border-border">
                                <span className="typing-indicator flex space-x-2 justify-center">
                                    <span className="dot w-2 h-2 rounded-full bg-primary-foreground animate-pulse" style={{ animationDelay: '0ms' }}></span>
                                    <span className="dot w-2 h-2 rounded-full bg-primary-foreground animate-pulse" style={{ animationDelay: '150ms' }}></span>
                                    <span className="dot w-2 h-2 rounded-full bg-primary-foreground animate-pulse" style={{ animationDelay: '300ms' }}></span>
                                </span>
                            </article>
                        )}
                        <span ref={messagesEndRef} />
                    </section>


                    <form onSubmit={handleChatSubmit} className="p-3 border-t border-border flex">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask about your finances..."
                            className="flex-1 p-2 border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-primary-foreground"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground p-2 rounded-r-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={isLoading}
                        >
                            <IoSend />
                        </button>
                    </form>
                </article>
            )}


            {!showChatbot && (
                <button
                    className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary z-50"
                    onClick={() => setShowChatbot(true)}
                    aria-label="Open chatbot"
                >
                    <FaComment className="text-xl" />
                </button>
            )}
        </>
    );
}

export default FinancialChatbot;