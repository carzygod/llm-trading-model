var express = require('express');
const dotenv = require('dotenv');
dotenv.config();
var model = require("./model.json");
import { ChatGPTAPI } from 'chatgpt'
var app = express()
const api = new ChatGPTAPI(
    { 
        apiBaseUrl:"https://chat.swaper.fun",
        apiKey: process.env.OPENAI_API_KEY
    }
    )


async function doReq(conversationId,id,i,data) {
    var data = await api.sendMessage(data, {
        conversationId:conversationId,// res.conversationId,
        parentMessageId: id,//res.id
      });
    if(data.text)
    {
        return data;
    }else
    {
        // console.log("not exsit")
        return await doReq(conversationId,id,i,data);
    }
    
}
async function init ()
{
    for(var i = 0 ; i < model.length ; i++)
    {
        var element = model[i];
        let res = await api.sendMessage(element.initWords[0])
        console.log(res)
        console.log(res.text)
        console.log("------------------------------------")
        model[i].conversationId=res.conversationId;
        model[i].parentMessageId=res.id;
        for (var ii = 1 ; ii < element.initWords.length ; ii++) {
            await delay(5000);
            res = await doReq(model[i].conversationId,model[i].parentMessageId,i,element.initWords[ii])
            console.log(res.text)
            model[i].conversationId=res.conversationId;
            model[i].parentMessageId=res.id;
            console.log("------------------------------------")
        }   
    }
}
function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

app.get('/role',async function(req, res) {
    var role = req.query.role;
    var data = req.query.data;
    await response(200,
        (await router(role,data))
        ,res);
  })

async function response(code,data,res){
    await res.send({
        "code":code,
        "data":data
        });
    await res.end();
    return 0;
}

async function router(role,data)
    /**
     * Fetch the model data and confirm for what information it needs 
     */
    {
        for(var i = 0 ; i < model.length ; i++)
        {
            var element = model[i];
            if(element.name == role)
            {
                var res = await doReq(element.conversationId,element.parentMessageId,i,data)
                model[i].conversationId=res.conversationId;
                model[i].parentMessageId=res.id;
                return res.text;
            } 
        }
        return "Not Found";
    }

    app.listen(1907,async function() {
       
        await init()
        console.log('Init Finished');
      })