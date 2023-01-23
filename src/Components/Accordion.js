import "./Accordion.css";
import Chevron from "./Chevron";
import { useState, useRef } from "react";
import { ExpenseChart } from "./Expenses/ExpenseChart";


function Accordion(props) {
    const [active, setActive] = useState("");
    const [height, setHeight] = useState('0px');
    const[rotate, setRotate] = useState("accordion__icon")

    const contentHeight = useRef(null);

    function toggleAccordion(){
        setActive(active === "" ? "active" : "");
        setHeight(active === "active" ? "0px" : `${contentHeight.current.scrollHeight}px`);
        setRotate(
            active === "active" ? "accordion__icon" : "accordion__icon rotate"
          );
    }


 return (
   <div className="accordion__section">

     <button className={`accordion ${active}`} onClick = {toggleAccordion}>
       <p className="accordion__title">{props.title}</p>
       <Chevron className={`${rotate}`} width = {10} fill = {"#777"}></Chevron>
     </button>
     
     <div ref = {contentHeight} style = {{ maxHeight: `${height}` }} className="accordion__content" >
       <div className="accordion__text" dangerouslySetInnerHTML={{ __html: props.content }}> 
       </div>
     </div>

   </div>
 );
}

export default Accordion;