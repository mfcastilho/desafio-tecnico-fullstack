import Papa from "papaparse"
import { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";


const baseURL = "http://localhost:3000/api/v1/shopper/validation";

function Home() {

     // eslint-disable-next-line no-unused-vars
     const [data, setData] = useState([]);

     
     // eslint-disable-next-line no-unused-vars
     const [columnArray, setColumn] = useState([]);
     const [values, setValues] = useState([]);
     const [productCode, setProductCode] = useState("");
     const [newPrice, setNewPrice] = useState("");


     // eslint-disable-next-line no-unused-vars
     const [product, setProduct] = useState("");

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

               
          }
     })
  }

  useEffect(() => {
     getValues();
   }, [values]);
 
   function getValues() {
     if (values.length > 0) {
       setProductCode(values[0][0]);
       setNewPrice(values[0][1]);
     }
   }

  async function handleSubmit(event){
    console.log("entrou")
     try {
          event.preventDefault();
          const data = {
               product_code: Number(productCode),
               new_price: Number(newPrice)
          }
          console.log(data)
          const resp = await axios.post(`${baseURL}`,
               data
          );

          console.log(resp.data.data);

          setProduct(resp.data.data);

     } catch (error) {
          console.log(error);
     }
  }

  

  return (

      <main className="home">
        <div className="wrapper-elements">
          <h1>Home do Teste Técnico da Shooper</h1>
          <input type="file" accept='.csv' name="file" onChange={handleFile} />
          <button onClick={handleSubmit}>Validar</button>
        </div>

        {/* <br /> */}

        {product == null ? "" : <div className="product">
          <p>{product.codigo}</p>
          <p>{product.nome}</p>
          <p>{product.precoAtual}</p>
          <p>{product.novoPreco}</p>
        </div>}  
        

        {/* <table>
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
        </table> */}
         
      </main>
  );
}

export default Home;
