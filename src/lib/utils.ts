export const currencyFormatter = (amount: any) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return formatter.format(amount);
}


/*            <Doughnut data={{
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
             */