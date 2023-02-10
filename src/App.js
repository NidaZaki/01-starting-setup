import { useState, useEffect,useRef } from "react";
import Expense from "./Components/Expenses/Expense";
import { ExpenseChart } from "./Components/Expenses/ExpenseChart";
import { ExpensePieChart } from "./Components/Expenses/ExpensePieChart";
import NewExpense from "./Components/NewExpense/NewExpense";
import {CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from "chart.js";
import Chart from "chart.js/auto";
import jwt_decode from "jwt-decode";
import './Components/Expenses/ExpenseChart.css';
import "./Components/Authentication/SignOut.css";
import "./Components/Accordion.css";
import Chevron from "./Components/Chevron";
import { getExpenses } from "./Components/Expenses/ExpenseService";
import { expensebe } from "./environment";
import './Components/Expenses/Loader.css';

let expenses = [];
let yearSelectedByUser = '2022';
let monthSelectedByUser = '11';
let categorySelectedByUser = '';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const App  = () => {

const [refresh, setRefresh] = useState(false);
const [user, setUser] = useState({});
const [data, setData] = useState(expenses);
const [rawData, setRawData] = useState([]);
let amountByMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const monthLabels =  ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [filteredYear, setFilteredYear] = useState(yearSelectedByUser);
let [filteredMonth, setFilteredMonth] = useState(monthSelectedByUser);
const [filteredCategory, setFilteredCategory] = useState (categorySelectedByUser);
const [categoryList, setCategoryList] = useState([]); 
const [expenseByCategoryArray, setExpenseByCategoryArray] = useState([]);
const[refreshPieChart, setRefreshPieChart] = useState(false);
const[refreshCategoryAfterSignIn, setRefreshCategoryAfterSignIn] = useState(false)
const[loading, setLoading] = useState(false);
var colors = [];
let i = 0;
let email = user.email;

while (colors.length < 100) {     // Color Generating Array
    do {
     i++;
        var color = Math.floor((i*1000000)+1);
    } while (colors.indexOf(color) >= 0);
    colors.push("#" + ("000000" + color.toString(16)).slice(-6));
}

useEffect(() => {         // google sign in USE EFFECT
  /* global google */
  google.accounts.id.initialize({
    client_id:"944417705343-dgg89a2v8hkgmoq0j1mkplmitkuroob5.apps.googleusercontent.com",
    callback: handleCallBackResponse
  })

  google.accounts.id.renderButton(
    document.getElementById("signInDiv"),
    {theme: "outline", size: "large"}
  );
  
  google.accounts.id.prompt();
}, [refresh]);

useEffect(() => {             // get CATEGORIES LIST (DROPDOWN)
  let url = expensebe + "categories/";
  url += email ? email : "Generic";
  fetch(url)
  .then(response => response.json())
  .then(res => {
    setCategoryList([...res.categories])
  })
}, [refreshCategoryAfterSignIn]);

useEffect( () => {          // get EXPENSES
  setLoading(true);
  fetchExpenses() 
}, [refresh]);

useEffect(() => {              // get PIE CHART 
  let url = expensebe + "expense-categories/"; 
  url += email ? email + "?" : "Generic?";
  url += "year=" +filteredYear;
  if (filteredMonth !== "13"){
    url += "&month=" + filteredMonth;
  } 
  fetch(url)
  .then(response => response.json())
  .then(res => {
    setExpenseByCategoryArray([...res.expenseByCategory]);
    let customLabels = res.categoryList.map((label,index) =>`${label}: ${res.expenseByCategory[index]}`)
    setPieChartData(
      {
        labels: customLabels,
        datasets: [
            {
              backgroundColor: colors,
          borderColor: "black",
          borderWidth: 2,
          data: res.expenseByCategory
          }
        ] 
      }
    );
  })
}, [refreshPieChart]);

function handleSignOut(event){
  setUser({});
  document.getElementById("signInDiv").hidden = false;
};

function fetchExpenses() {
  getExpenses(filteredMonth, filteredYear, filteredCategory, email)
    .then(data => {       // argument
      expenses = [];
      let expensesChart = [];
      if (data) {
          data.expensesList.forEach(item => {
            const spilltedDate = item["date"].split('T')[0].split('-');
            const date = new Date(spilltedDate[0], spilltedDate[1] - 1, spilltedDate[2], 0, 0, 0);    
            item["date"] = date;
            expenses.push(item);
          });
          data.expensesListChart.forEach(item => {
            const spilltedDate = item["date"].split('T')[0].split('-');
            const date = new Date(spilltedDate[0], spilltedDate[1] - 1, spilltedDate[2], 0, 0, 0);    
            item["date"] = date;
            expensesChart.push(item);
          });
          setRawData(expenses.slice());
          expenses.sort(function(a,b){
              return new Date(b.date) - new Date(a.date)
          })
          if (expenses.length >= 0) {
            setData(expenses);
            updateChartData(expensesChart);
            refreshChart(amountByMonth);
          }
          if(!filteredCategory || filteredCategory === "All"){
            setRefreshPieChart(!refreshPieChart);    
          }
          else {
            updatePieChartForEachCategory(expenses, filteredCategory);
          }
          setLoading(false)
      }
    
    });
}

const filteredYearHandler = (selectedYear)  => {        // user selected year
  yearSelectedByUser = selectedYear;
  setFilteredYear(selectedYear);
  setRefresh(!refresh)
  if(!filteredCategory || filteredCategory === "All"){
   setRefreshPieChart(!refreshPieChart);
  }
  else{
   updatePieChartForEachCategory(rawData,filteredCategory);
  }
}

function handleCallBackResponse(response){       // GOOGLE SIGN IN
  var userObject = jwt_decode(response.credential);
  setUser(userObject);
  document.getElementById("signInDiv").hidden = true;
  setRefreshCategoryAfterSignIn(!refreshCategoryAfterSignIn);
  if(!filteredCategory || filteredCategory === "All") {
    setRefreshPieChart(!refreshPieChart);
  }
  else {
    updatePieChartForEachCategory(rawData, filteredCategory);
  }
  setRefresh(!refresh);
};

function updateChartData(expenseData) {     // argument
  for (const item of expenseData) {
    amountByMonth[item.date.getMonth()] += item.amount
  }
}

const [chartData, setChartData] = useState({
  labels: monthLabels,
  datasets: [
    {
      labels: "Expenses for All Category",
      backgroundColor: [
        "#a892ee"
      ],
      borderColor: "black",
      borderWidth: 2,
      data: amountByMonth
    }
  ],
  options: {
    scales: {
      x: {
        grid: {
          display:false
        }
      },
      y: {
        border:{
          display: false
        },
        grid: {
          display:false
        }
      }
    }
  }
});

const addExpenseHandler = expense => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
    };
    fetch(`${expensebe}expenses`, requestOptions)
        .then(response => response.json())
        .then(data => {
            // const spilltedDate = data["date"].split('T')[0].split('-');
            // const date = new Date(spilltedDate[0], spilltedDate[1] - 1, spilltedDate[2], 0, 0, 0);    
            // data["date"] = date;
            setRawData([data, ...rawData]);
            const combinedData = [data, ...rawData]
            // combinedData.sort(function(a,b){
            //   return new Date(b.date) - new Date(a.date)
            // })
          setRefresh(!refresh);
          if(!filteredCategory || filteredCategory === "All"){  
            setRefreshPieChart(!refreshPieChart); 
          } 
          else{
            updatePieChartForEachCategory(combinedData,filteredCategory)
          }
        });   
};

function updatePieChartForEachCategory(filteredData, category){
  let expenseByCategoryArray = [];
  let individualExpensesArray = [];
  let individualExpensesTitle = [];
  let sum = 0;
  
    filteredData.filter(item => {
      if(item.category === category)
      {
        sum += item.amount;
        expenseByCategoryArray[categoryList.indexOf(category)] = sum;
        individualExpensesArray.push(item.amount);
        individualExpensesTitle.push(item.title);
      }
    });
    refreshPieChartDataFunction(individualExpensesTitle,individualExpensesArray);
 
}

function refreshChart(passedData) {
  setChartData({
    labels: monthLabels,
    datasets: [
      {
        label: "Total expenses",
        backgroundColor: [
          "#a892ee"
        ],
        data: passedData,
        borderColor: "black",
        borderWidth: 2
      }
    ],
    options: {
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          grid: {
           display: false
          },
          grid: {
            drawBorder: false
          }
        },
      }
    }
});
}

function filteredMonthHandler(selectedMonth){
  monthSelectedByUser = selectedMonth;
  setFilteredMonth(selectedMonth);
  setRefresh(!refresh) 

  if(!filteredCategory || filteredCategory === "All"){
    setRefreshPieChart(!refreshPieChart);
  }
  else{
    updatePieChartForEachCategory(rawData, filteredCategory);
  } 
}

function filteredCategoryHandler(selectedCategory){
  categorySelectedByUser = selectedCategory;
  setFilteredCategory(selectedCategory);
  setRefresh(!refresh);
  if(!selectedCategory || selectedCategory === "All"){
   setRefreshPieChart(!refreshPieChart);  
  }
  else{
   updatePieChartForEachCategory(rawData, selectedCategory);
  } 
}

function refreshPieChartDataFunction(title, individualExpensesArray){
  let customLabels = title.map((label,index) =>`${label}: ${individualExpensesArray[index]}`)
    setPieChartData(
    {
      labels: customLabels,
      datasets: [
        {
          backgroundColor: colors, 
          borderColor: "black",
          borderWidth: 2,
          data: individualExpensesArray
        }
      ] 
    }
  );
}

const [pieChartData, setPieChartData] = useState({
  labels: categoryList.map(item => item),
  datasets: [
    {
      backgroundColor: [
        "red", "blue", "green", "yellow", "violet", "indigo", "orange", "pink", "white"
      ],
      borderColor: "black",
      borderWidth: 2,
      data: expenseByCategoryArray
    }
  ]  
});

const contentHeight = useRef(null);

function Panel({ title, children }) {
  const [isActive, setIsActive] = useState(true);
  const [height, setHeight] = useState('0px');
  const [rotate, setRotate] = useState("accordion__icon");
  return (
    <div className="wrapper">
      <div>
        <button className={`accordion ${isActive}`} onClick={() => {setIsActive(!isActive) 
                                                      setRotate(isActive ? "accordion__icon" : "accordion__icon rotate")
                                                      setHeight(isActive ? "0px": `${contentHeight.current.scrollHeight}px`)} }>
          <div className="accordion__title">{title}</div>
          <Chevron className={`${rotate}`} width = {10} fill = {"#777"}></Chevron>
        </button>
        <div ref = {contentHeight} style = {{ maxHeight: `${height}` }} className="accordion__content" ></div>
        <div>  
          {isActive && (<p>{children}</p>)}
        </div>
      </div>
    </div>
);
}

return ( 
    <div>
      <div className="nav-bar-ul">     
        <li className="nav-bar-li expense-tracker">Expense Tracker</li>
        <div className="nav-bar-li sign-in">
        <div id= "signInDiv"></div>
        </div> 
        <div className="navigation-sign-in">
          {Object.keys(user).length != 0 &&
          <a className = "button" href = "" >
            <img src = {user.picture} referrerPolicy="no-referrer"></img>
            <div onClick = { (e) => handleSignOut(e) } className="logout ">LOGOUT</div>
            </a>        
          }
        </div>
      </div>
    
      <div> <NewExpense onAddExpense = {addExpenseHandler} text = {user.email} category = {categoryList} onEmail = {email}></NewExpense></div>
      <div>
      { loading ? <div id = "loader-icon" className="loader"></div> : 
      <div>
        <div className="chart-side-by-side">
          <Panel title="Monthly Expenses">
            <ExpenseChart chartData={chartData}></ExpenseChart>
          </Panel>
          <Panel title="Expenses By Category">
            <div className="wrapper pie-chart">
            <ExpensePieChart category = {categorySelectedByUser} pieChartData={pieChartData}></ExpensePieChart>
            </div>
          </Panel>
          </div>
        <div>
          <Expense 
    items={data} onFilteredYear = {filteredYearHandler} year = {filteredYear} onFilteredMonth = {filteredMonthHandler} 
    refreshPieChart = {refreshPieChart}
    setRefreshPieChart = {setRefreshPieChart}
    month = {filteredMonth} setRefresh = {setRefresh} refresh = {refresh} categoryList = {categoryList} 
    onFilteredCategory = {filteredCategoryHandler} category = {filteredCategory}
            updatePieChart = {updatePieChartForEachCategory} rawData = {rawData} onEmail = {email}></Expense>
         </div>
        </div>
        }
      </div>
    </div>

);
}

export default App;
