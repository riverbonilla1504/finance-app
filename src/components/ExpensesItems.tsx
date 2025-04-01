import { currencyFormatter } from "@/lib/utils";

export function ExpensesItems({ color, title, total }: { color: string; title: string; total: number }) {
    return (
        <span className="flex items-center justify-between p-4 mt-4 bg-gray-900 rounded-lg shadow-md hover:scale-105 transition-transform duration-200 ease-in-out">
            <figure className="flex items-center gap-2">
                <small className={`w-6 h-6 rounded-full`} style={{ backgroundColor: color }} />
                <small className="text-sm">{title}</small>
            </figure>
            <small className="text-sm text-gray-400"> 12/10/2023</small>
            <p className="text-sm text-gray-400"> 12:00 PM</p>

            <p className="text-sm font-bold">{currencyFormatter(total)}</p>
        </span>
    );
}