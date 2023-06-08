import Papa from "papaparse"
import { useState } from "react";
import "./Home.css";

function Home() {

     // eslint-disable-next-line no-unused-vars
     const [data, setData] = useState([]);
     const [columnArray, setColumn] = useState([]);
     const [values, setValues] = useState([]);

  function handleFile(event){
     Papa.parse(event.target.files[0], {
          header: true,
          skipEmptyLines: true,
          complete: function(result){
               const columnArray = [];
               const valuesArray = [];

               result.data.map((d)=>{
                    columnArray.push(Object.keys(d));
                    valuesArray.push(Object.values(d));
               });
               setData(result.data);
               setColumn(columnArray[0]);
               setValues(valuesArray);
               console.log(values)
          }
     })
  }

  return (

      <main className="home">
        <div className="wrapper-elements">
          <h1>Home do Teste Técnico da Shooper</h1>
          <input type="file" accept='.csv' name="file" onChange={handleFile} />
          <button>Validar</button>
        </div>

        <br />

        <table>
          <thead>
               <tr>
                    {columnArray.map((col, i) => (
                         <th key={i}>{col}</th>
                    ))}
               </tr>
          </thead>
          <tbody>
               {values.map((v, i) => (
                    <tr key={i}>
                         {v.map((value, i) => (
                              <td key={i}>{value}</td>
                         ))}
                    </tr>
               ))}
          </tbody>
        </table>
        
        
      </main>
  );
}

export default Home;
