import { expensebe } from "../../environment";

export async function getExpenses(filteredMonth, filteredYear, filteredCategory, email){
    let url = expensebe + "expenses?year=" + filteredYear;
    if (filteredMonth !== "13"){
        url += "&month=" + filteredMonth;
    }
    if (filteredCategory && filteredCategory !== "All") {
        url += "&category=" + filteredCategory;
    }
    if(email){
        url += "&userName=" + email;
    }
    const expenses = await fetch(url);
    return await expenses.json();
    
}