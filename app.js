const Express = require("express")
const Mongoose = require("mongoose")
const Cors = require("cors")
const Bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const userModel = require("./models/users")
const postModel = require("./models/posts")


let app=Express()
app.use(Express.json())
app.use(Cors())

Mongoose.connect("mongodb+srv://sandras02:sandrasmenon@cluster0.3g103sn.mongodb.net/blogAppDb?retryWrites=true&w=majority&appName=Cluster0")
//create a post
app.post("/create",async(req,res)=>{
    let input=req.body
    let token =req.headers.token
   
    jwt.verify(token,"blogapp",async(error,decoded)=>{
        if (decoded && decoded.email) {
           let result= new postModel(input)
            await result.save()
            res.json({"status":"success"})
        } else {
            res.json({"status":"Invalid authentication"})
        }
    })
    })

    app.post("/viewall",(req,res)=>{
        let token=req.headers.token
        jwt.verify(token,"blogapp",(error,decoded)=>{
        if (decoded && decoded.email) {
            postModel.find().then(
                (items)=>{
                    res.json(items)
                }
            ).catch(
                (error)=>{
                    res.json({"status":"error"})
                }
            )
        } else {
            res.json({"status":"invalid authentication"})
        }
        })
        })
        
           


//Sign in
app.post("/signIn",async(req,res)=>{
    let input=req.body
    let result=userModel.find({email:req.body.email}).then(
        (items)=>{
            if(items.length>0){
                const passwordvalidator=Bcrypt.compareSync(req.body.password,items[0].password)
                if(passwordvalidator)
                {
                    jwt.sign({email:req.body.email},"blogapp"/*token name*/,{expiresIn:"1d"},
                        (error,token)=>{
                            if(error){
                                res.json({"status":"Error","errorMessage":error})
                            }
                            else{
                                res.json({"status":"SUCCESS","token":token,"userId":items[0]._id})
                            }
                        }
                    )
                }
                else{
                    res.json({"status":"INCORRECT PASSWORD"})
                }
            }
            else{
                res.json({"status":"INVALID EMAIL ID"})
            }
        }
    )
})



//Sign up

app.post("/signup",async(req,res)=>{


    let input=req.body
    let hashedPassword = Bcrypt.hashSync(req.body.password,10)
    console.log(hashedPassword)
    req.body.password=hashedPassword
  


    userModel.find({email:req.body.email}).then(
        (items)=>{
            if (items.length>0) {
                res.json({"status":"email id already exist"})
                
             } else {
                let result=new userModel(input)
                result.save()
                res.json({"status":"success"})
                
             }
        
        
        

        }
    ).catch(
        (error)=>{}
    )
       
})

app.listen(3030,()=>{
    console.log("server started")
})