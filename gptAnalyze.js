//http://127.0.0.1:1907/role?role=trade&data=

const { json } = require('express');
var dateTime = require('node-datetime');
var events = require('../temp/mock.json');
events = events
var rawTrade = require('../temp/trade.json');
var api = require('./utils/apis.js');
var baseTime = 0;
var baseInterval = 3600;
baseTime = (rawTrade[0][0])/1000;
var fs = require("fs")
var history = []
const tool = require("./utils/tools")
var total =
{
    reward : 0 ,
    rate : 0 ,
}

var trade = 
{
    lock:false,
    action : 0,
    in:0 ,
    inTime:0 , 
    inEvent:0,
    out:0 ,
    outTime:0,
    outEvent:0,
    reward : 0 ,
    rate : 0 ,

}

function matchEvent(data)
{
    return ((data-baseTime)/baseInterval).toFixed(0);
}

function oldPredict(data)
{
    var alarmRate = 0.5;
    var influenceRate = 700;
    var long = (data.status.long)/(data.status.long+data.status.short);
    var short = (data.status.short)/(data.status.short+data.status.long);
    if(long > alarmRate&&(data.status.long+data.status.short) >influenceRate)
    {
        return 1;
    }

    if(short > alarmRate&&(data.status.long+data.status.short) >influenceRate)
    {
        return 2;
    }

    return 0;
}

function buyLong(data,meta){
    trade.lock = true ; 
    trade.action = 1 ;
    trade.in = meta.in;
    trade.inTime = data.time;
    trade.inEvent = data.content;
    return 0 ;
}

function sellLong(data,meta){
    trade.lock = false ; 
    trade.out = meta.out;
    trade.outTime = data.time;
    trade.outEvent = data.content;
    trade.reward = trade.in - trade.out;
    trade.rate = (trade.in - trade.out)/trade.in
    total.reward+=trade.reward;
    total.rate += trade.rate;
    history.push(JSON.parse(JSON.stringify(trade)))
    return 0 ;
}
function buyShort(data,meta){
    trade.lock = true ; 
    trade.action = 2 ;
    trade.in = meta.in;
    trade.inTime = data.time;
    trade.inEvent = data.content;
    return 0 ;
}
function sellShort(data,meta){
    trade.lock = false ; 
    trade.out = meta.out;
    trade.outTime = data.time;
    trade.outEvent = data.content;
    trade.reward = trade.out-trade.in ;
    trade.rate = (trade.out-trade.in)/trade.in
    total.reward+=trade.reward;
    total.rate += trade.rate;
    history.push(JSON.parse(JSON.stringify(trade)))
        return 0 ;
}

function action(data)
{
    var _in = Number(matchEvent(data.time))
    var _out = _in+1;
    if(_out > rawTrade.length-3)
    {
        return false;
    }
    _out = rawTrade[_out][4];
    _in = rawTrade[_in][4];
    var pre = oldPredict(data)
    if(trade.lock)
    {
        if(pre!=trade.action){
            if(trade.action==1)
            {
                sellLong(data,
                    {
                        in:_in,
                        out:_in,
                    });
                    return action(data)
            }

            if(trade.action==2)
            {
                sellShort(data,
                    {
                        in:_in,
                        out:_in,
                    });
                    return action(data)
            }
        }
        
    }else{
        if(pre==1)
        {
            //make long
            return buyLong(data,
                {
                    in:_in,
                    out:_in,
                });
        }

        if(pre==2)
        {
            //make short 
            return buyShort(data,
                {
                    in:_in,
                    out:_in,
                });
        }
    }

}

async function appendData(data)
{
    await fs.appendFileSync('../temp/gpt.json',data, 'utf8'); 
    return true
}
async function init ()
{
    //events.length
    for(var i = 1082 ; i < events.length ; i ++)
    {
        var element = events[i];
        var meta = element.content;
        // console.log(meta)
        var status = await api.gpt(meta)
        element.status = JSON.parse(status.data);
        console.log(element)
        await appendData(
            JSON.stringify(
                element
            )+","
        )
        await tool.sleep(5000)
    }
}

init()