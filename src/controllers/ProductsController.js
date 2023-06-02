const { validationResult } = require("express-validator");
const { Pack, Product, ProductPack } = require("../models");

const ProductsController = {
     productsValidation: async (req, res) => {

          try {

               const { product_code, new_price } = req.body;

               const formValidation = validationResult(req);

               if (formValidation.errors.length > 0) {
                    return res.json({ errors: formValidation.mapped(), old: req.body });
               }

               const product = await Product.findByPk(product_code, {
                    include: {
                         model: Pack,
                         as: "pack"
                    }
               });

               if(!product) {
                    return res.status(404).send({message: "O código do produto não existe." });
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
