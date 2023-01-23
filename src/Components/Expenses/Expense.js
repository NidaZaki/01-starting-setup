import { useState } from 'react';
import ExpensesFilter from "./ExpensesFilter";
import Card from "../UI/Card";
import "./Expense.css"
import ExpenseList from './ExpenseList';


function Expense(props) {
  const [filteredYear, setFilteredYear] = useState(props.year);
  const [filteredMonth, setFilteredMonth] = useState(props.month);
  const [filteredCategory, setFilteredCategory] = useState (props.category);
 // const [category, setCategory] = useState(props.category);

  function yearPickedHandler(selectedYear){
    setFilteredYear(selectedYear); 
    props.onFilteredYear(selectedYear);
  }

  function monthPickedHandler(selectedMonth){
    setFilteredMonth(selectedMonth);
    props.onFilteredMonth(selectedMonth);
  }

  function deleteHandler(deleteId){
    fetch('http://localhost:8080/expenses/' + deleteId, {
            method: 'DELETE',
        }).then(res => {
          if (res.status === 200) {
            props.setRefresh(!props.refresh)
            props.setRefreshPieChartData(!props.refreshPieChartData)
          }
        });
  }

  function refreshHandler(){
      props.setRefresh(!props.refresh);
  }
  
  function categoryPickedHandler(selectedCategory){
    setFilteredCategory(selectedCategory);
    props.onFilteredCategory(selectedCategory);
  }

  return (
    <div>
    <Card className = "expense">
    <ExpensesFilter defaultYearOnDisplay = {filteredYear} 
    onYearPicked = {yearPickedHandler} onMonthPicked = {monthPickedHandler} defaultMonthOnDisplay = {filteredMonth} onSetCategoryList = {props.categoryList} 
    onCategorySelected = {categoryPickedHandler} defaultCategoryOnDisplay = {filteredCategory}> 
    </ExpensesFilter>
    <ExpenseList items = {props.items} onDeletingExpense = {deleteHandler} refresh = {refreshHandler} onSetCategoryList = {props.categoryList}> </ExpenseList>
    </Card>
    </div>
  );
}

export default Expense;
