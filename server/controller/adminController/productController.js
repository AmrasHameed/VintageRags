const productModel = require('../../model/productModel')
const categoryModel = require('../../model/categModel')
const path = require('path')
const fs = require('fs');
const { search } = require('../../routers/user');


const product = async (req, res) => {
    try {
        const productSuccess = req.flash('productSuccess');
        const updateSuccess = req.flash('updateSuccess');
        const products = await productModel.find().populate({
            path: 'category',
            select: 'name'
        });
        res.render('admin/products', { product: products, productSuccess, updateSuccess });
    } catch (error) {
        console.log(error);
        res.render("user/serverError");
    }
};

const addProduct = async (req, res) => {
    try {
        const categories = await categoryModel.find({})
        res.render('admin/addProduct', { category: categories })
    } catch (err) {
        console.log(err);
        res.render("user/serverError");
    }
}

const addProductPost = async (req, res) => {
    try {
        const product = new productModel({
            name: req.body.name,
            category: req.body.category,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            image: req.files.map(file => file.path),
        })
        await product.save()
        req.flash('productSuccess', "Product Added Successfully")
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error);
        res.render("user/serverError");
    }
}
const unlist = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productModel.findById(id);
        product.status = !product.status;
        await product.save();
        res.redirect('/admin/products')
    } catch (err) {
        console.log(err);
        res.render("user/serverError");
    }
}

const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productModel.findById(id);
        res.render('admin/updateProduct', { product })
    } catch (err) {
        console.log(err);
        res.render("user/serverError");
    }
}

const updateProductPost = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productModel.findOne({ _id: id })
        product.name = req.body.name
        product.description = req.body.description
        product.price = req.body.price
        product.stock = req.body.stock
        await product.save();
        req.flash('updateSuccess', "Product Updated Successfully")
        res.redirect('/admin/products')
    } catch (err) {
        console.log(err);
        res.render("user/serverError");
    }
}

const editImage = async (req, res) => {
    try {
        const id = req.params.id;
        const imageNotFound = req.flash('imageNotFound')
        const product = await productModel.findById(id)
        res.render('admin/editImage', { product: product, imageNotFound })
    } catch (err) {
        console.log(err);
        res.render("user/serverError");
    }
}

const deleteImage = async (req, res) => {
    try {
        const pid = req.query.pid;
        const filename = req.query.filename;
        const imagePath = path.join("uploads", filename);

        if (fs.existsSync(filename)) {
            try {
                fs.unlinkSync(filename);
                console.log("Image deleted");
                res.redirect("/admin/editImage/" + pid);

                await productModel.updateOne(
                    { _id: pid },
                    { $pull: { image: filename } }
                );
            } catch (err) {
                console.log("error deleting image:", err);
                res.status(500).send("Internal Server Error");
            }
        } else {
            console.log("Image not found");
            req.flash('imageNotFound', "Image not found")
            res.redirect("/admin/editImage/" + pid);
        }
    } catch (err) {
        console.log(err);
        res.render("user/serverError")
    }
};

const updateImage = async (req, res) => {
    try {
        const id = req.params.id;
        const newimg = req.files.map(file => file.path)
        const product = await productModel.findById(id)
        product.image.push(...newimg)
        product.save()
        res.redirect('/admin/updateProduct/' + id)
    } catch (err) {
        console.log(err);
        res.render("user/serverError")
    }
}

const searchProduct=async(req,res)=>{
    try{
        const searchName=req.body.search;
        const data=await productModel.find({
            name: { $regex: new RegExp(`^${searchName}`, `i`) },
          }).populate({
            path: 'category',
            select: 'name'
        });

        req.session.searchProduct=data;
        res.redirect('/admin/searchProductView')
    }catch(err){
        console.log(err);
        res.render("user/serverError")
    }
}

const searchProductView= async(req,res)=>{
    try{
        const productSuccess = req.flash('productSuccess');
        const updateSuccess = req.flash('updateSuccess');
        const product=req.session.searchProduct;
        res.render('admin/products', { product,productSuccess, updateSuccess})
    }catch(err){
        console.log(err);
        res.render("user/serverError")
    }
}

module.exports = { product, addProduct, addProductPost, unlist, updateProduct, updateProductPost, editImage, deleteImage, updateImage ,searchProduct,searchProductView}