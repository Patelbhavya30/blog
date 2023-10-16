const exp=require('express')
const mn=require('mongoose')
const User=require('./models/user')
const app=exp();
const cors=require('cors')
const brc=require('bcryptjs')
const jwt=require('jsonwebtoken')
const cp=require('cookie-parser')
const multer=require('multer')
const uploadmiddleware=multer({dest:'uploads/'})
const fs=require('fs')
const Post =require('./models/post')
const secret='afj3535fhsd7hfs37as3sd773uesdf3d'
const salt=brc.genSaltSync(10);

 app.use(cors({credentials:true,origin:'http://localhost:3000'}))
 app.use(exp.json())
 app.use(cp())
 app.use('/uploads',exp.static(__dirname+'/uploads'))


 mn.connect('mongodb+srv://pbhavya3333:1vFtiLuQh9t5zGSJ@cluster0.ftckkji.mongodb.net/?retryWrites=true&w=majority')
.then(()=>console.log('connection succesfull'))
.catch((err)=> console.log(err))
app.post('/register',async (req,res)=>{
    const {username,password} =req.body
   try{

       const userDoc = await User.create({username,
        password:brc.hashSync(password,salt),
    })
       res.json(userDoc);
   }
   catch(e){
      res.status(400).json(e);
   }
})


app.post('/login',async (req,res)=>{
    const {username,password} = req.body;
    const userDoc=await User.findOne({username});
    const passOk= brc.compareSync(password,userDoc.password)
    if(passOk){

        jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
            if(err) throw err
            res.cookie('token',token).json({
                id:userDoc._id,
                username,
            })

        })

    }
    else{
        res.status(400).json('wrong credentials')
    }

})

app.get('/profile',(req,res)=>{
    const {token}=req.cookies
    jwt.verify(token,secret,{},(err,info)=>{
        if (err) throw err;
        res.json(info)
    })
    // res.json(req.cookies)
    
})

app.post('/logout',(req,res)=>{
    res.cookie('token','').json('ok')
})

app.post('/post',uploadmiddleware.single('file'),async (req,res)=>{
    const {originalname,path}=req.file
    const parts=originalname.split('.')
    const ext=parts[parts.length - 1]
    const newpath=path+'.'+ext
    fs.renameSync(path,newpath)
    

    const {token}=req.cookies
    jwt.verify(token,secret,{},async (err,info)=>{
        if (err) throw err;
        const {title,summary,content}=req.body
        const postDoc=await Post.create({
        title,
        summary,
        content,
        cover:newpath,
        author:info.id,
    })
    res.json(postDoc)
})   
})

app.put('/post',uploadmiddleware.single('file'),async (req,res)=>{
    let newpath=null
    if(req.file){
        const {originalname,path}=req.file
    const parts=originalname.split('.')
    const ext=parts[parts.length - 1]
    newpath=path+'.'+ext
    fs.renameSync(path,newpath)

    }
    const {token}=req.cookies
    jwt.verify(token,secret,{},async (err,info)=>{
        if (err) throw err;
        const {id,title,summary,content}=req.body
        const postDoc=await Post.findById(id)
        const isAuthor=JSON.stringify(postDoc.author)===JSON.stringify(info.id)
        if(!isAuthor){
            return res.status(400).json('you are not author')
        }
        await postDoc.updateOne({
            title,
            summary,
            content,
            cover:newpath?newpath:postDoc.cover,
        })

        res.json(postDoc)
    


})
})

app.get('/post',async (req,res)=>{
    res.json(await Post.find().populate('author',['username']).sort({createdAt:-1}).limit(20)
    )
})

app.get('/post/:id',async (req,res)=>{
    const {id}=req.params;
    postDoc=await Post.findById(id).populate('author',['username'])
    res.json(postDoc)
})





app.listen(5000);