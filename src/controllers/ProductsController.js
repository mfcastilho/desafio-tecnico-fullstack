const { validationResult } = require("express-validator");
const { Pack, Product, ProductPack } = require("../models");
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
