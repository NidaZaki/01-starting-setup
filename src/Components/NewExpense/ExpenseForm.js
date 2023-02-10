import { useEffect, useState } from 'react';
import "./ExpenseForm.css";
import { expensebe } from "../../environment";

const ExpenseForm = (props) => {

const [newCategory, setNewCategory] = useState('');  
const [enteredTitle, setEnteredTitle] = useState('');
const [enteredAmount, setEnteredAmount] = useState(0);
const [enteredDate, setEnteredDate] = useState(new Date());
const [selectedCategory, setSelectedCategory] = useState('');
const [customCategory, setCustomCategory] = useState(props.category);
const [buttonClicked, setButtonClicked] = useState(false);
const [buttonPresent, setButtonPresent] = useState(false);
const [customCategoryForUser, setCustomCategoryForUser] = useState(props.category);

function titleChangeHandler(event){
    setEnteredTitle(event.target.value);
}

function amountChangeHandler(event){
    setEnteredAmount(Number(event.target.value));
}

function dateChangeHandler(event){
    setEnteredDate(event.target.value);
}

function submitHandler(event){
    event.preventDefault();

    const spilltedDate = enteredDate.toString().split('-');
    const date = new Date(spilltedDate[0], spilltedDate[1] - 1, spilltedDate[2], 0, 0, 0);

    let finalCategory = selectedCategory;

    if (!selectedCategory) {
        finalCategory = "Miscellaneous";
    } else if (selectedCategory === "Custom") {
        finalCategory = newCategory;
    }

    const expenseData = {
        title: enteredTitle,
        amount: enteredAmount,
        date: date,
        category: finalCategory
    };

    props.onSaveExpenseData(expenseData);
    setEnteredTitle('');
    setEnteredAmount(0);
    setEnteredDate(new Date());
    setSelectedCategory('');
    if(newCategory){
        if(!props.onEmail){
            customCategory.push(newCategory);
            const currentCategory = [...customCategory];
            setCustomCategory(currentCategory);
            const categoryData = {
                userName : "Generic",
                categories : currentCategory
            }
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData)
              };
              fetch(`${expensebe}categories`, requestOptions)
                .then(response => response.json())
                .then(data => console.log(data));
        }
        else{

            customCategoryForUser.push(newCategory);
            const currentCategoryForUser = [...customCategoryForUser];
            setCustomCategoryForUser(currentCategoryForUser);
            const categoryDataForUser = {
                userName : props.onEmail,
                categories : currentCategoryForUser
            }
            const requestOptions1 = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryDataForUser)
              };
              fetch(`${expensebe}categories`, requestOptions1)
                .then(response => response.json())
                .then(data => console.log(data));
        }
      

    } 
}

function categoryHandler(event){
    setSelectedCategory(event.target.value);
    setButtonClicked(false);
    setButtonPresent(false);
    console.log("Custom Category in EF", customCategory);    
}

function customCategoryHandler(event){
    const customCategoryItemAdded = event.target.value;
    setNewCategory(customCategoryItemAdded); 
    console.log(newCategory);     
}


function crossButtonClickedHandler(event){
    setButtonClicked(!buttonClicked);
    setButtonPresent(true);   
}

    return (
        <form onSubmit = {submitHandler}>
            <div className="new-expense__controls">
                <div className="new-expense__control">
                    <label>Title</label>
                    <input type = "text" value={enteredTitle} onChange={titleChangeHandler}></input>
                </div>
                <div className="new-expense__control">
                    <label>Amount</label>
                    <input type = "number" min = "1" step = "1" value={enteredAmount} onChange={amountChangeHandler}></input>
                </div>
                <div className="new-expense__control">
                    <label>Date</label>
                    <input type = "date" min = "2019-01-01" max= "2022-12-31" value={enteredDate} onChange={dateChangeHandler}></input>
                </div>
                <div className="new-expense__control">
                    <label>Category</label>
                    { selectedCategory === "Custom"  
                    ? 
                        <div> 
                        {!buttonClicked ? <input type = "text" onChange = {customCategoryHandler} /> : <select value={""} onChange = {categoryHandler}>
                            <option className = "option-placeholder" value="" disabled selected>Select category</option>
                            {customCategory.map( (item) => (<option>{item}</option>)) }
                        </select>}
                        {!buttonPresent && <button type="button" className = "new-expense x-button" onClick = {crossButtonClickedHandler}><i className="bi bi-x"></i></button>}
                        </div> 

                    : 
                   <select value={selectedCategory} onChange = {categoryHandler}>
                            <option className = "option-placeholder" value="" disabled selected>Select category</option>
                            {customCategory.map( (item) => (<option>{item}</option>)) }
                        </select>
                    }
                </div>
            </div>  
            <div className = "new-expense__actions">
                <button type="button" onClick = {props.onCancel}>Cancel</button>
                <button type ="submit">Add Expense</button>
            </div>    
        </form>
    );
};

export default ExpenseForm;