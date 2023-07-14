const mongoose=require('mongoose')
require('dotenv').config()
const DB=mongoose.connect(process.env.DB_URl)
.then(()=>{
    console.log("MongoDB Connected Successfully");
})
.catch((err)=>{
    console.log(err);
})

module.exports=DB