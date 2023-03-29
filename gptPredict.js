//http://127.0.0.1:1907/role?role=trade&data=

const { json } = require('express');
var dateTime = require('node-datetime');
var events = require('../temp/gpt.json');
events = events.reverse()
var rawTrade = require('../temp/trade.json');

var baseTime = 0;
var baseInterval = 3600;
baseTime = (rawTrade[0][0])/1000;

var history = []
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
    var influenceRate = 0;

    if(data.status.direction == "利好" && Number(data.status.influence) > influenceRate)
    {
        return 1;
    }

    if(data.status.direction == "利空" && Number(data.status.influence) > influenceRate)
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
function init ()
{
    events.forEach(element => {
        action(element)
    });

    console.log(
        JSON.stringify(
            history
        )
    )

    console.log(total)
    console.log(history.length)
}

init()