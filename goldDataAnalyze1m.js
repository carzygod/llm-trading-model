const { json } = require('express');
var dateTime = require('node-datetime');
var events = require('../temp/mock.json');
events = events.reverse()
var rawTrade = require('../temp/trade.json');

const _long = 1;
const _short = 2;

var feeRate = 0
var baseTime = 0;
var baseInterval = 60;
baseTime = (rawTrade[0][0])/1000;
var timeLimit = 3600;
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
    var alarmRate = 0.5
    var influenceRate = 0;
    var long = (data.status.long)/(data.status.long+data.status.short);
    var short = (data.status.short)/(data.status.short+data.status.long);
    if(long > alarmRate&&(data.status.long+data.status.short) >influenceRate)
    {
        return  _long;
    }

    if(short > alarmRate&&(data.status.long+data.status.short) >influenceRate)
    {
        return _short;
    }

    return 0;
}

function buyLong(data,meta){
    trade.lock = true ; 
    trade.action = _long ;
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
    total.rate += trade.rate - feeRate;
    history.push(JSON.parse(JSON.stringify(trade)))
    return 0 ;
}
function buyShort(data,meta){
    trade.lock = true ; 
    trade.action = _short ;
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
    total.rate += trade.rate - feeRate;
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
            if(pre==0)
            {
                return 0 ;
            }


            if(trade.action==_long)
            {
                sellLong(data,
                    {
                        in:_in,
                        out:_in,
                    });
                    if(data.real)
                    {
                        return action(data)
                    }
                    
            }

            if(trade.action==_short)
            {
                sellShort(data,
                    {
                        in:_in,
                        out:_in,
                    });
                    if(data.real)
                    {
                        return action(data)
                    }
                    // return action(data)
            }
        }
        
    }else{
        if(pre==_long)
        {
            //make long
            return buyLong(data,
                {
                    in:_in,
                    out:_in,
                });
        }

        if(pre==_short)
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
        element.real = true;
        action(element)
        var temp = element.status.long
        element.status.long = element.status.short;
        element.status.short = temp;
        element.time+=14400;
        element.real = false;
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