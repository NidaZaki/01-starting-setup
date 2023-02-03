import {useState} from "react";
import ExpenseItem from "./ExpenseItem";
import './ExpenseList.css';
import React from "react";
import './Loader.css';

const ExpenseList = (props) => {


    if(props.items.length === 0){
        return (<h2 className = "expenses-list__fallback"> Found no expenses.</h2>)             
    }

    function deleteExpenseHandler(deleteId){
        props.onDeletingExpense(deleteId);
    }

    function editExpenseHandler() {
        props.refresh();
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
            onCategory = {props.onCategory}
            onMonthSelected = {props.onMonthSelected}
            onEmail = {props.onEmail}
            />
        ))}
    </ul>
};

export default ExpenseList;