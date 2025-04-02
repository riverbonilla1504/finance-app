

export type Expense = {
    id: string;
    amount: number;
    description: string;
    category: string;
    icon: string;
    color: string;
    createAt: Date;
    uid: string;
}

export type Income = {
    id: string;
    amount: number;
    description: string;
    createAt: Date;
    uid: string;
};
