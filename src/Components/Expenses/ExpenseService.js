import { expensebe } from "../../environment";

export async function getExpenses(){
    const expenses = await fetch(`${expensebe}expenses`);
    return await expenses.json();
}

//if (data) {
    // data.forEach(item => {
    //     const spilltedDate = item["date"].split('T')[0].split('-');
    //     const date = new Date(spilltedDate[0], spilltedDate[1] - 1, spilltedDate[2], 0, 0, 0);    
    //     item["date"] = date;
    //     expenses.push(item);
    // });