

export type Expense = {
    id: string;
    amount: number;
    description: string;
    category: string;
    icon: string;
    color: string;
    createAt: Date;
}

export type Income = {
    id: string;
    amount: number;
    description: string;
    createAt: Date;
};
