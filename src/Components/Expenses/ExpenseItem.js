import React,{ startTransition, useState } from 'react';

import "./ExpenseItem.css";
import Card from "../UI/Card";
import ExpenseDate from "./ExpenseDate";
import { expensebe } from "../../environment";

function ExpenseItem(props) {
  const [editMode, setEditMode] = useState(false);
  let [editedInput, setEditedInput] = useState({...props});
  const [categoryList, setCategoryList] = useState(props.onCategorySelectedList);
  const [selectedCategory, setSelectedCategory] = useState(props.category);
  const [category, setCategory] = useState('');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [buttonPresent, setButtonPresent] = useState(false);
  const[filteredCategory, setFilteredCategory] = useState(props.onCategory);
  const [filteredMonth, setFileteredMonth] = useState(props.onMonthSelected);
  let [editedInputForCategory, setEditedInputForCategory] = useState({...props});

  function deleteHandler(event){
    const itemToBeDeleted = props.id;
    props.onDelete(itemToBeDeleted);
  }

  function editHandler(event){
    setEditMode(!editMode);
    if(props.onCategory){
      if(props.category === props.onCategory){
        setEditedInputForCategory({...props});
      }
      else if(props.onCategory === "All" && props.onMonthSelected){
        setEditedInputForCategory({...props});
      }
    } 
  }

  function fetchEditedExpenses(input){
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    };
    fetch(`${expensebe}expenses`, requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log(data)
      });
    setEditMode(!editMode);
    props.onRefresh();
  }

  function saveHandler(event) {
   if(props.onCategory && props.onCategory != "All"){
      fetchEditedExpenses(editedInputForCategory);
    }
    else if(props.onCategory === "All" && props.onMonthSelected){
      fetchEditedExpenses(editedInputForCategory);
    }
   else{
    fetchEditedExpenses(editedInput);
   }

    if(category){
      categoryList.push(category);
      const currentCategory = [...categoryList];
      setCategoryList(currentCategory);
    }
    const categoryData = {
      userName : "Generic",
      categories : categoryList
    }
    const requestOptions1 = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    };
    fetch(`${expensebe}categories`, requestOptions1)
      .then(response => response.json())
      .then(data => console.log(data));
  }

  function amountChangeHandler(event){
    const amountTyped = event.target.value;
    if(props.category === props.onCategory){
      editedInputForCategory.amount = amountTyped;
    }
    else if(props.onCategory === "All" && props.onMonthSelected){
      editedInputForCategory.amount = amountTyped;
    }
    else{
      editedInput.amount = amountTyped; 
    } 
  }

  function titleChangeHandler(event){
    const titleTyped = event.target.value;
    if(props.category == props.onCategory){
      editedInputForCategory.title = titleTyped;
    }
    else if(props.onCategory === "All" && props.onMonthSelected){
      editedInputForCategory.title = titleTyped;
    }
    else{
      editedInput.title = titleTyped; 
    }
  }

  function dateChangeHandler(event){
    const datePicked = event.target.value;
    if(props.category == props.onCategory){
      editedInputForCategory.date = datePicked;
    }
    else if(props.onCategory === "All" && props.onMonthSelected){
      editedInputForCategory.date = datePicked;
    }
    else{
      editedInput.date = datePicked; 
    }
  }

  function categoryChangeHandler(event){
    const categoryTyped = event.target.value;
    if(props.category == props.onCategory){
      editedInputForCategory.category = categoryTyped;
    }
    else if(props.onCategory === "All" && props.onMonthSelected){
      editedInputForCategory.category = categoryTyped;
    }
    else{
      editedInput.category = categoryTyped; 
    }
    setSelectedCategory(categoryTyped);
    setButtonClicked(false);
    setButtonPresent(false); 
  }

  function inputCategoryHandler(event){
    const categoryTyped = event.target.value;
     if(props.category == props.onCategory){
      editedInputForCategory.category = categoryTyped;
    }
    else if(props.onCategory === "All" && props.onMonthSelected){
      editedInputForCategory.category = categoryTyped;
    }
    else{
      editedInput.category = categoryTyped; 
    }
    setCategory(categoryTyped);
  }

  function crossButtonClickedHandler(event){
    setButtonClicked(!buttonClicked);
    setButtonPresent(true); 
  }
  
  return (
    <li>
      <Card className="expense-item">
        {editMode ? <div className="new-expense__control date-picker-small">
                    <input type = "date" min = "2019-01-01" max= "2022-12-31" defaultValue={props.date.toLocaleDateString('en-CA')} onChange = {dateChangeHandler}></input>
                </div> : <ExpenseDate date={props.date}></ExpenseDate>}
      <div className="expense-item__description">
         {editMode ? <div className="new-expense__control"> <input type = "text" defaultValue= {props.title} onChange = {titleChangeHandler}></input> </div> : <h2> {props.title} </h2>}
      </div>
      <div className="category">
      {editMode 
      ? 
              <div className="new-expense__control">
              { selectedCategory === "Custom" 
              ? 
                <div>
                  {!buttonClicked ? <input className='new-expense__control select-on-edit' type = "text" onChange={inputCategoryHandler}></input> : 
                    <select className='new-expense__control select-on-edit' defaultValue={props.category} onChange = {categoryChangeHandler}> 
                    <option className = "option-placeholder" value="" disabled selected>Select category</option>
                    {props.onCategorySelectedList.map( (item) => (<option>{item}</option>)) }</select> } 
                  {!buttonPresent && <button className='cross-button' type = "button" onClick = {crossButtonClickedHandler}><i className="bi bi-x"></i></button> }
                </div>

              : <select className='new-expense__control select-on-edit' defaultValue={props.category} onChange = {categoryChangeHandler}> 
                <option className = "option-placeholder" value="" disabled selected>Select category</option>
                {props.onCategorySelectedList.map( (item) => (<option>{item}</option>)) }</select> } 
              </div> 

      : <h2> {props.category} </h2>
      }
      </div>
        <div className="expense-item__price"> 
          {editMode  ? <div className= "new-expense__control amount-editer"> <input type="number" defaultValue={props.amount} name="amount" onChange={amountChangeHandler}></input> </div>
             :  props.amount } 
        </div>  
      <div className="buttons">
        <div className="edit-delete">
          <button onClick = {editHandler} type="button" className="btn-primary"><i className="bi bi-pencil-square"></i></button>
          <button onClick = {deleteHandler} type="button" className="btn-danger" ><i className="bi bi-trash-fill"></i></button>
        </div>
        {editMode && <button onClick = {saveHandler} className="btn-sucess"><i className="bi bi-check-square"></i>Save</button> }
      </div>
      
      </Card>
    </li> 
  );
}

export default ExpenseItem;
