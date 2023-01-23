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
import Accordion from "./Components/Accordion";
import { ExpenseDonutChart } from "./Components/Expenses/ExpenseDonutChart";

// 1. Passing data from App into ExpenseItem
// 2. Expense Item is doing two things,
// 2.a. Rendering data from props passed by App
// 2.b. passing date(one of the props items from App component) into ExpenseDate component and returning it at the same time.

let expenses = [];
let yearSelectedByUser = '2022';
let monthSelectedByUser = '12';
let categorySelectedByUser = '';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const App  = () => {

const [refresh, setRefresh] = useState(false);
const [user, setUser] = useState({});
const [data, setData] = useState(expenses);
const [rawData, setRawData] = useState([]);
let amountByMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const [filteredYear, setFilteredYear] = useState(yearSelectedByUser);
const [filteredMonth, setFilteredMonth] = useState(monthSelectedByUser);
const [filteredCategory, setFilteredCategory] = useState (categorySelectedByUser);
const [categoryList, setCategoryList] = useState([]); 
const [expenseByCategoryArray, setExpenseByCategoryArray] = useState([]);
const[refreshPieChartData, setRefreshPieChartData] = useState(false);
var colors = [];
let i = 0;

while (colors.length < 100) {     // Color Generating Array
    do {
     i++;
        var color = Math.floor((i*1000000)+1);
    } while (colors.indexOf(color) >= 0);
    colors.push("#" + ("000000" + color.toString(16)).slice(-6));
}

useEffect(() => {
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
}, []);

useEffect(() => {
  fetch('http://localhost:8080/categories/Generic')
  .then(response => response.json())
  .then(res => {
    setCategoryList([...res.categories])
  })
}, []);

useEffect( () => {
  fetchExpenses() 
}, [refresh]);

useEffect(() => {
  fetch(`http://localhost:8080/expense-categories/Generic?month=${filteredMonth}&year=${filteredYear}`)
  .then(response => response.json())
  .then(res => {
    console.log(res)
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
}, [refreshPieChartData]);

function handleSignOut(event){
  setUser({});
  document.getElementById("signInDiv").hidden = false;
};

function fetchExpenses() {
  getExpenses()
    .then(data => {       // argument
      expenses = [];
      if (data) {
        data.forEach(item => {
          const spilltedDate = item["date"].split('T')[0].split('-');
          const date = new Date(spilltedDate[0], spilltedDate[1] - 1, spilltedDate[2], 0, 0, 0);    
          item["date"] = date;
          expenses.push(item);
        });
        // console.log("Date Processed Expenses", expenses);
        setRawData(expenses.slice());
        const filteredYearExpenses = expenses.filter(items =>
          items.date.getFullYear().toString() === filteredYear && items.date.getMonth()+1 == filteredMonth
        );
        // console.log("Filetred Expenses using Month and Year", filteredYearExpenses);
        filteredYearExpenses.sort(function(a,b){
          return new Date(b.date) - new Date(a.date)
        })
        if (filteredYearExpenses.length >= 0) {
          setData(filteredYearExpenses);
          updateChartData(filteredYearExpenses);
          refreshChart(amountByMonth);
          dataForDonutChart(filteredYearExpenses);
        }
      }
  });
}

const filteredYearHandler = (selectedYear)  => {        // user selected year
  yearSelectedByUser = selectedYear;
  setFilteredYear(selectedYear);
  // console.log("Changed YEar", selectedYear);
  // console.log("Year Selected By User VARIABLE", yearSelectedByUser);
  if(Object.keys(user).length != 0){
    const filteredData = expenses.filter(item => 
      item.date.getFullYear().toString() === selectedYear && item.userName == user.email && item.date.getMonth()+1 == filteredMonth
    );
    filteredData.sort(function(a,b){
      return new Date(b.date) - new Date(a.date)
    })
  // console.log("Filtered UserName Expenses" , filteredData);
  setData(filteredData);
  updateChartData(filteredData);
  refreshChart(amountByMonth);
  }
  else{
    const filteredData = rawData.filter(items =>
      items.date.getFullYear().toString() === selectedYear && items.date.getMonth()+1 == filteredMonth && items.category === filteredCategory
    );
    filteredData.sort(function(a,b){
      return new Date(b.date) - new Date(a.date)
    })
    setData(filteredData);
    updateChartData(filteredData);
    refreshChart(amountByMonth);
     
    let individualExpensesArray = [];
    let individualExpensesTitle = [];
    let expenseByCategoryArray = [];
    let sum = 0;
    if(filteredCategory){
      filteredData.filter(item => {
        sum += item.amount;
        expenseByCategoryArray[categoryList.indexOf(filteredCategory)] = sum;
        console.log(sum);
        individualExpensesArray.push(item.amount);
        individualExpensesTitle.push(item.title);
        console.log(individualExpensesTitle);

      });
    refreshPieChartDataFunction(individualExpensesTitle,individualExpensesArray);
    console.log("Hey You!");
    } 
  }

  if(filteredCategory === "All" && selectedYear){
    console.log("Hey there ALl");
    const filteredData = rawData.filter(items =>
      items.date.getMonth()+1 == filteredMonth && items.date.getFullYear().toString() === selectedYear   
    );
    filteredData.sort(function(a,b){
     return new Date(b.date) - new Date(a.date)
    })
   setData(filteredData);
   updateChartData(filteredData);
   refreshChart(amountByMonth); 
   setRefreshPieChartData(!refreshPieChartData);
  }
}

function handleCallBackResponse(response){       // GOOGLE SIGN IN
  amountByMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  console.log("User Selected Year", filteredYear);
  var userObject = jwt_decode(response.credential);
  console.log(userObject);
  setUser(userObject);
  document.getElementById("signInDiv").hidden = true;
  setRawData(expenses.slice());
  console.log("Inside sign in", expenses);
  console.log("Inside SIGN IN - YEAR SELECTED BY USER VARIABLE", yearSelectedByUser) 
  const filteredData = expenses.filter(item => 
    item.date.getFullYear().toString() === yearSelectedByUser && item.userName == userObject.email && item.date.getMonth()+1 == monthSelectedByUser
  );
  filteredData.sort(function(a,b){
    return new Date(b.date) - new Date(a.date)
  })
  console.log("Filtered Data - MEWWWWW", filteredData);
  setData(filteredData);
  updateChartData(filteredData);
  refreshChart(amountByMonth);



  // const filteredUserNameExpenses = expenses.filter(item =>
  //   item.userName == userObject.email
  // );
  // console.log("Filtered UserName Expenses" , filteredUserNameExpenses);
  // const filteredYearExpenses = filteredUserNameExpenses.filter(items =>
  //   items.date.getFullYear().toString() === filteredYear
  // );
  // console.log("Filtered Year Expenses", filteredYearExpenses);
  // // filteredUserNameExpenses.sort(function(a,b){
  // //   return new Date(b.date) - new Date(a.date)
  // // })
  // if (filteredYearExpenses.length > 0) {
  //   setData(filteredYearExpenses);
  //   updateChartData(filteredYearExpenses);
  // }
};

const monthLabels =  ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function updateChartData(expenseData) {     // argument
  for (const item of expenseData) {
    amountByMonth[item.date.getMonth()] += item.amount
  }
}

const [chartData, setChartData] = useState({
  labels: monthLabels,
  datasets: [
    {
      label: "Expenses ",
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
  const newData = [expense, ...rawData];
  setRawData(newData);
  const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
  };
  fetch('http://localhost:8080/expenses', requestOptions)
      .then(response => response.json())
      .then(data => console.log(data));

  const filteredData = newData.filter(item =>
    item.date.getFullYear().toString() === filteredYear && item.date.getMonth()+1 == filteredMonth && item.category === filteredCategory
    );  
    filteredData.sort(function(a,b){
      return new Date(b.date) - new Date(a.date)
    })
  setData(filteredData);
  updateChartData(filteredData);
  refreshChart(amountByMonth); 
  setRefreshPieChartData(!refreshPieChartData);
};

function refreshChart(passedData) {
  setChartData({
    labels: monthLabels,
    datasets: [
      {
        label: "Expenses Updated",
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
  console.log(selectedMonth);
  if(Object.keys(user).length != 0){
    const filteredData = rawData.filter(items =>
      items.date.getMonth()+1 == selectedMonth && items.date.getFullYear().toString() === filteredYear && items.userName == user.email
    );
    filteredData.sort(function(a,b){
      return new Date(b.date) - new Date(a.date)
    })
    setData(filteredData);
    updateChartData(filteredData);
    refreshChart(amountByMonth);
  }else{
    const filteredData = rawData.filter(items =>
      items.date.getMonth()+1 == selectedMonth && items.date.getFullYear().toString() === filteredYear || items.category === filteredCategory
    );
    filteredData.sort(function(a,b){
      return new Date(b.date) - new Date(a.date)
    })
    setData(filteredData);
    updateChartData(filteredData);
    refreshChart(amountByMonth);
   
    let individualExpensesArray = [];
    let individualExpensesTitle = [];
    let expenseByCategoryArray = [];
    let sum = 0;
    if(filteredCategory || selectedMonth){
      filteredData.filter(item => {
        sum += item.amount;
        expenseByCategoryArray[categoryList.indexOf(filteredCategory)] = sum;
        console.log(sum);
        individualExpensesArray.push(item.amount);
        individualExpensesTitle.push(item.title);
        console.log(individualExpensesTitle);

      });
    refreshPieChartDataFunction(individualExpensesTitle,individualExpensesArray);
    console.log("Hey You!");
    } 
  }

  if(filteredCategory === "All" && selectedMonth){
    console.log("Hey there ALl");
    const filteredData = rawData.filter(items =>
      items.date.getMonth()+1 == selectedMonth && items.date.getFullYear().toString() === filteredYear   
    );
    filteredData.sort(function(a,b){
     return new Date(b.date) - new Date(a.date)
    })
   setData(filteredData);
   updateChartData(filteredData);
   refreshChart(amountByMonth); 
    setRefreshPieChartData(!refreshPieChartData);
  }

}

let individualExpensesArrayGlobal = [];
let individualExpensesTitleGlobal = [];

function dataForDonutChart(data){
  data.filter(item =>{
    individualExpensesArrayGlobal.push(item.amount);
    individualExpensesTitleGlobal.push(item.title);
  })
}

function filteredCategoryHandler(selectedCategory){
  categorySelectedByUser = selectedCategory;
  setFilteredCategory(selectedCategory);
  console.log(selectedCategory);
  const filteredData = rawData.filter(items =>
     items.category === selectedCategory && items.date.getMonth()+1 == filteredMonth && items.date.getFullYear().toString() === filteredYear   
  );
  filteredData.sort(function(a,b){
    return new Date(b.date) - new Date(a.date)
  })
  setData(filteredData);
  updateChartData(filteredData);
  refreshChart(amountByMonth); 
  let expenseByCategoryArray = [];
  let individualExpensesArray = [];
  let individualExpensesTitle = [];
  let sum = 0;
  if(selectedCategory){
    filteredData.filter(item => {
      if(item.category === selectedCategory)
      {
        sum += item.amount;
        expenseByCategoryArray[categoryList.indexOf(selectedCategory)] = sum;
        console.log(sum);
        individualExpensesArray.push(item.amount);
        individualExpensesTitle.push(item.title);
        console.log(individualExpensesTitle);
      }
    });
    refreshPieChartDataFunction(individualExpensesTitle,individualExpensesArray);
  } 
  if(selectedCategory === "All"){
    console.log("Hey there ALl");
    const filteredData = rawData.filter(items =>
      items.date.getMonth()+1 == filteredMonth && items.date.getFullYear().toString() === filteredYear   
    );
    filteredData.sort(function(a,b){
     return new Date(b.date) - new Date(a.date)
    })
   setData(filteredData);
   updateChartData(filteredData);
   refreshChart(amountByMonth); 
  //  let expenseByCategoryArray = [];
  //  let individualExpensesArray = [];
  //  let individualExpensesTitle = [];
  //  let sum = 0;    
  //  filteredData.filter(item => {
  //     sum += item.amount;
  //     expenseByCategoryArray[categoryList.indexOf(selectedCategory)] = sum;
  //     console.log(sum);
  //     individualExpensesArray.push(item.amount);
  //     individualExpensesTitle.push(item.title);
  //     console.log(categoryList);
  //     console.log(expenseByCategoryArray);
  //   });
    // refreshPieChartDataFunction(categoryList,expenseByCategoryArray);
    setRefreshPieChartData(!refreshPieChartData);
  }
}

// function updatePieChartData(expense, categories){
//   let sumByCategory = 0;
//   let categoryArray = [0,0,0,0,0,0,0,0,0,0,0,0,0];
//   console.log("Inside Update Pir Chart *****", categories);
//   console.log("Exense insde Update", expense);
//   expense.forEach(expenseItem => {
//     categories.forEach(category => {
//       if(expenseItem.category == category){
//         sumByCategory = expenseItem.amount;
//         categoryArray[categories.indexOf(category)] = sumByCategory;    
//       }
//     })
//   });
//   setExpenseByCategoryArray(categoryArray);
// }

// let chartColor = ["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"];

function refreshPieChartDataFunction(title, individualExpensesArray){
  let customLabels = title.map((label,index) =>`${label}: ${individualExpensesArray[index]}`)
    setPieChartData(
    {
      labels: customLabels,
      datasets: [
        {
          // colors[categoryList.indexOf(categorySelectedByUser)],
          backgroundColor: colors, 
          // borderColor: "black",
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
console.log(pieChartData.datasets[0].data)
// const[donutChartData, setDonutChartData] = useState({
//   labels: individualExpensesTitleGlobal,
//   datasets: [
//     {
//       backgroundColor: [
//           "#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"
//         ],
//       borderColor: "black",
//       borderWidth: 2,
//       data: individualExpensesArrayGlobal
//     }]
// });

// function refreshDonutChartDataFunction(title, individualExpenses){
//   setDonutChartData({
//     labels: title,
//     datasets: [
//       {
//         backgroundColor: [ 
//             "#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"
//           ],
//         borderColor: "black",
//         borderWidth: 2,
//         data: individualExpenses
//       }]
//   })
// }

// const [active, setActive] = useState("");
// const [height, setHeight] = useState('0px');
// const [rotate, setRotate] = useState("accordion__icon")

// function toggleAccordion(){
//     setActive(active === "" ? "active" : "");
//     setHeight(active === "active" ? "0px": `${contentHeight.current.scrollHeight}px`);
//     setRotate(active === "active" ? "accordion__icon" : "accordion__icon rotate");
// }

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
    </div>
    <div className="navigation">
    { Object.keys(user).length != 0 &&
      <a className = "button" href = "" >
        <img src = {user.picture} referrerPolicy="no-referrer"></img>
        <div onClick = { (e) => handleSignOut(e) } className="logout ">LOGOUT</div>
        </a>        
    }
    </div>
    {user && 
    <div> 
      <h3>{user.name}</h3>
    </div>
    } 
    <div> <NewExpense onAddExpense = {addExpenseHandler} text = {user.email} category = {categoryList} ></NewExpense></div>

    {/* <div className="wrapper" >
      <button className={`accordion ${active}`} onClick = {toggleAccordion}>
        <p className="accordion__title">Bar Chart?</p>
        <Chevron className={`${rotate}`} width = {10} fill = {"#777"}></Chevron>
      </button>
      <div ref = {contentHeight} style = {{ maxHeight: `${height}` }} className="accordion__content" >
        <div id = "DisplayChart" className="wrapper"/>
          {/* // dangerouslySetInnerHTML={{ __html: ExpenseChart }}/> */}
         {/* <ExpenseChart chartData={chartData} />
      </div>  
    </div> */} 

    {/* // <div className="wrapper">
    //   <button className={`accordion ${active}`} onClick = {toggleAccordion}>
    //     <p className="accordion__title">Pie Chart?</p>
    //     <Chevron className={`${rotate}`} width = {10} fill = {"#777"}></Chevron>
    //   </button>
    //   <div ref = {contentHeight} style = {{ maxHeight: `${height}` }} className="accordion__content" >
    //     <div className="wrapper pie-chart">
    //     <ExpensePieChart pieChartData={pieChartData}></ExpensePieChart>
    //     </div>
    //     <div className="wrapper pie-chart">
    //     <ExpenseDonutChart category = {categorySelectedByUser} donutChartData = {donutChartData}></ExpenseDonutChart>
    //     </div> 
    //   </div> 
    // </div> */}
    <div className="chart-side-by-side">
      <Panel title="Monthly Expenses Chart">
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
        refreshPieChartData = {refreshPieChartData}
        setRefreshPieChartData = {setRefreshPieChartData}
        month = {filteredMonth} setRefresh = {setRefresh} refresh = {refresh} categoryList = {categoryList} 
        onFilteredCategory = {filteredCategoryHandler} category = {filteredCategory}></Expense>
    </div>
  
  </div>  
);
}

export default App;
