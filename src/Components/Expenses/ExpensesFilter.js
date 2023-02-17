import React from 'react';
import './ExpensesFilter.css';

const ExpensesFilter = (props) => {

  function dropDownChangeHandler(event){
    const yearPicked = event.target.value;
    props.onYearPicked(yearPicked);
  }

  function dropDownMonthChangeHandler(event){
    const monthPicked = event.target.value;
    props.onMonthPicked(monthPicked);
  }

  function dropDownCategoryChangeHandler(event){
    const categoryPicked = event.target.value;
    props.onCategorySelected(categoryPicked);
  }

  return (
    <div className='expenses-filter'>
      <div className='expenses-filter__control'>
        <label>Filter</label>
        <select value = {props.defaultCategoryOnDisplay} onChange = {dropDownCategoryChangeHandler}>
        <option className = "option-placeholder" value="" disabled selected>Select category</option>
          {props.onSetCategoryList.map( (item) => (<option>{item}</option>)) }
          <option>All</option>
        </select>
        <select value = {props.defaultMonthOnDisplay} onChange={dropDownMonthChangeHandler}>
          <option value = '01'>January</option>
          <option value = '02'>February</option>
          <option value = '03'>March</option>
          <option value = '04'>April</option>
          <option value = '05'>May</option>
          <option value = '06'>June</option>
          <option value = '07'>July</option>
          <option value = '08'>August</option>
          <option value = '09'>September</option>
          <option value = '10'>October</option>
          <option value = '11'>November</option>
          <option value = '12'>December</option>
          <option value = '13'>All Months</option>
        </select>
        <select value = {props.defaultYearOnDisplay} onChange = {dropDownChangeHandler}>
          <option value='2023'>2023</option>
          <option value='2022'>2022</option>
          <option value='2021'>2021</option>
          <option value='2020'>2020</option>
          <option value='2019'>2019</option>
        </select>
      </div>
    </div>
  );
};

export default ExpensesFilter;