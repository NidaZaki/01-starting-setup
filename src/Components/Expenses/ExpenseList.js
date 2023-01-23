import {useState} from "react";
import ExpenseItem from "./ExpenseItem";
import './ExpenseList.css';
import React from "react";

const ExpenseList = (props) => {


    if(props.items.length === 0){
        return <h2 className = "expenses-list__fallback"> Found no expenses.</h2>
    }

    function deleteExpenseHandler(deleteId){
        props.onDeletingExpense(deleteId);
    }

    function editExpenseHandler() {
        props.refresh();
        console.log("I'm in Expense List");
    }

    return <ul className="expenses-list">
        {props.items.map((data) => (
        <ExpenseItem 
            id = {data.id}
            title = {data.title} 
            amount = {data.amount} 
            date = {data.date}
            userName = {data.userName} 
            category = {data.category}
            onDelete = {deleteExpenseHandler}
            onRefresh = {editExpenseHandler}
            onCategorySelectedList = {props.onSetCategoryList}
            />
        ))}
    </ul>
};

export default ExpenseList;