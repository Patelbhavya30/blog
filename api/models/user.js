const mn=require('mongoose')

// mn.connect('mongodb://127.0.0.1:27017/blog-app')
// .then(()=>console.log('connection succesfull'))
// .catch((err)=> console.log(err))

const userSchema=new mn.Schema({
    username:{
        type:String,
        required:true,
        min:4,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    }
})

const UserModel=mn.model('User',userSchema)

module.exports =UserModel;

