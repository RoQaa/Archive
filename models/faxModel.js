const mongoose=require('mongoose')
const faxSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    about:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'About',
        required:true
    },
    comment:{
        type:String,
      //  required:true
    },
    faxNumber:{
        type:Number,
        required:true,
    },
    faxType:{
        type:String,
        required:true,
        enum:['صادر','وارد']
    },
    date:{
        type:Date,
        default:Date.now()
    },
    files:[{
        type:String,
        required:true
    }]
})

faxSchema.pre(/^find/,function(next){
    this.populate({path:'about'})
    next();
})
const Fax= mongoose.model('Fax',faxSchema)
module.exports=Fax;