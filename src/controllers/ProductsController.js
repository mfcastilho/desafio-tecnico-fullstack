const { validationResult } = require("express-validator");
const { Pack, Product } = require("../models");
const verificarReajuste = require("../utils/verificarReajuste");

const ProductsController = {

     productsValidation: async (req, res) => {

          try {

               const { product_code, new_price } = req.body;

               //validando campos dos formulários
               const formValidation = validationResult(req);
               if (formValidation.errors.length > 0) {
                    return res.json({ errors: formValidation.mapped(), old: req.body });
               }


               //buscando produto através do código enviado do frontend
               const product = await Product.findByPk(product_code, {
                    include: {
                         model: Pack,
                         as: "pack"
                    }
               });

               //verificando se o código do produto existe no banco de dados
               if(!product) {
                    return res.status(404).send({ message: "O código do produto não existe." });
               }


               //verificando se o preço de venda é menor que o preço de custo
               const costPrice = Number(product.cost_price);
               if( new_price < costPrice){
                    return res.status(400).send({ message: "O novo preço do produto não pode ser menor que o preço de custo." });
               }


               const salesPrice = Number(product.sales_price);
               const newPrice = Number(new_price);

               //Verificando se o reajuste é maior ou menor do que 10% do preço atual do produto.
               const resultado = verificarReajuste(salesPrice, newPrice);
               if(!resultado){
                    return res.status(400).send({ message: "o reajuste NÃO pode ser maior ou menor do que 10% do preço atual do produto." });
               }


               //Verificando se é um pacote
               if(product.pack.length === 0){

                    // return res.json({ message: "É um pacote." });

                    const packProductsInfos = await Pack.findAll({
                         where:{pack_id: product.code},
                         include:[{
                              model: Product,
                              as: "product"
                         }]
                    });


                    /*Verificando quantos porcentos cada produto representa no pacote e 
                      Verificando a representação do preço do conjunto de produtos no pacote*/
                    const productPorcentRepresentationInThePackArray = [];
                    for(let p of packProductsInfos){
                         const productSalesPrice = Number(p.product.sales_price);
                         const productPorcentRepresentationInThePack = ((productSalesPrice * p.qty) / Number(product.sales_price)) * 100;
                         

                         const productSetPriceRepresentaioninPack = (productPorcentRepresentationInThePack / 100) * Number(new_price);
                         
                         const packProductInfos = {
                              pack_name: product.name,
                              pack_code: product.code,
                              product_code: p.product.code,
                              product_name: p.product.name,
                              quantity_of_product_in_the_pack: p.qty,
                              product_cost_price: Number(p.product.cost_price),
                              product_sales_price: Number(p.product.sales_price),
                              product_porcent_representation_in_pack: Number(productPorcentRepresentationInThePack.toFixed(2)),
                              product_set_price_representation_in_pack: Number(productSetPriceRepresentaioninPack.toFixed(2))
                         }

                         productPorcentRepresentationInThePackArray.push(packProductInfos);    
                    }


               
                    //Atualizando os preços dos produtos inseridos dentro do pacote
                    for (let packProduct of productPorcentRepresentationInThePackArray) {
                         const newProductPrice = packProduct.product_set_price_representation_in_pack / packProduct.quantity_of_product_in_the_pack;
                         const productCode = packProduct.product_code;
                    
                         console.log(newProductPrice, productCode);
                    
                         await Product.update(
                              {
                                   sales_price: newProductPrice
                              },
                              {
                                   where: { code: productCode }
                              }
                         );
                    }

                    //atualizando o valor do pacote
                    await Product.update({sales_price: newPrice}, {where: {code: product_code}});
                    

                    return res.json(productPorcentRepresentationInThePackArray);




                    // const packProducts = [];
                    // async function getPackProducts(){
                    //      for(let product of packProductsInfos){
                    //           const packProduct = await Product.findOne({
                    //                where:{code: product.product_id}
                    //           });
                              
                    //           packProducts.push(packProduct);
                    //      }
                    // }                 
                    // await getPackProducts();

                    // return res.json({pack:product, pack_products:packProductsInfos});

                   

               }


               


               // const packs = await Pack.findAll({
               //      include:[
               //           { model: Product, as: 'product' },
               //           { model: Product, as: 'packProducts' },
               //      ]
               // });

               // const products = await Product.findAll({
               //      include:[{
               //           model: Pack,
               //           as: 'pack',
               //      }]
               // });

               // return res.json({ data: products});

               
               

               return res.json({ data: product });

          } catch (error) {

               if (error.name === "SequelizeConnectionRefusedError") {
                    return res.status(500).json({
                         error: true,
                         message: "Sistema indisponível, tente novamente mais tarde!",
                    });
               }
               if (error.name === "SequelizeUniqueConstraintError") {
                    return res.status(400).json(error.parent.sqlMessage);
                    }

               if (error.name === "SequelizeValidationError"){
                    return res.status(400).json({error: true, message: `${error.errors[0].type} at ${error.errors[0].path}`});
               }
          }
     },
};

module.exports = ProductsController;
