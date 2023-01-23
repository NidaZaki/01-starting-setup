import "./NewExpense.css";
import ExpenseForm from "./ExpenseForm";
import { useState } from "react";

const NewExpense = (props) => {
   const [isEditing, setIsEditing] = useState(false);    // saves whether the form should be shown or not // form is hidden

   const startEditHandler = () => {
    setIsEditing(true);                     // form is visible
   }

   const stopEditHandler = () => {
    setIsEditing(false);
   }
   

    function saveExpenseDataHandler(enteredExpenseData){
        const expenseData = {
            ...enteredExpenseData,
            userName: props.text
        };
        props.onAddExpense(expenseData);

    }

    // function categoryHandler(selectedCategory){
    //     props.category(selectedCategory);   
    // }

    // function customCategoryHandler(customCategory){
    //     // console.log("Custom Component - New Expense - List of All Custom Category", customCategory);
    //     props.customCategory(customCategory);
    // }

    return (
    <div className="new-expense">
        {!isEditing && <button onClick = {startEditHandler}>Add New Expense</button>}
        {isEditing && <ExpenseForm onSaveExpenseData={saveExpenseDataHandler} onCancel = {stopEditHandler} 
        category = {props.category}></ExpenseForm>}
    </div>
    );
};

export default NewExpense;