const api = require("./utils/apis")
const tool = require("./utils/tools")

var db = [];
var current = 0;
async function init()
{
    var data = await api.rawReq(
        {
            id:current,
            limit:20,
            grade:5
        }
    )

    // console.log(data)
    current = data.bottom_id;
    analyze(data.list[0].lives)
}

function analyze(data)
{
    // console.log(data);
    data.forEach(element => {
        // console.log(element)
        var title = element.content.match(/(?<=【).*?(?=】)/);
        if(Array.isArray(title))
        {
            title = title[0]
            if((title.split("金色")).length > 1)
            {
    
            }else{
                if(title.split("破产").length > 1 ||title.split("加息").length > 1 || title.split("调查").length > 1 || title.split("交易所").length > 1||title.split("巨鲸").length > 1)
                {
                    db.push(
                        {
                            id:element.id,
                            content:title,
                            time:element.created_at,
                            status:{
                                long:element.up_counts,
                                short:element.down_counts
                            }
            
                        }
                    )
                }

            }
        }

    });
    // console.log(db)
}


async function loop(){
    await init();
    //current/20
    for(var i=0; i<(500);i++)
    {
        await init();
        await tool.sleep(3000)
    }
    console.log(
        JSON.stringify(db)
    );
}
// init()
loop()