const mn=require('mongoose')

const {Schema,model}=mn;
// mn.connect('mongodb://127.0.0.1:27017/blog-app')
// .then(()=>console.log('connection succesfull'))
// .catch((err)=> console.log(err))

const postschema=new Schema({
    title:String,
    summary:String,
    content:String,
    cover:String,
    author:{type:Schema.Types.ObjectId,ref:'User'}


},{
    timestamps:true
})

const PostModel =model('Post',postschema)

module.exports=PostModel