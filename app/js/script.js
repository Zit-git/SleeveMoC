ZOHO.embeddedApp.on("PageLoad",function(data){
var asynFun = async () =>{
if(data && data.Entity){
    let productFields = await ZOHO.CRM.META.getFields({"Entity":"Products"});
    let sleeveMocValue = productFields.fields.filter(field => field.api_name == "Sleeve_MoC");
    let sleeveOptions = sleeveMocValue[0].pick_list_values.map(val => val.display_value != "-None-" ? "<option value='"+val.display_value+"'>"+val.display_value+"</option>" : "").join("");
    let seriesRec = await ZOHO.CRM.API.getRecord({Entity:"Series",RecordID:data.EntityId[0]});
    let seriesMocList = seriesRec.data[0].Series_MoC;
    let htmlTxt = "";
    var sleeveMocData = [];
    let count = 0;
    seriesMocList.forEach(row => {
        let casingMap = {Casing_MoC:row.Casing_MoC};
        let impellerList = [];
        row.Impeller_MoC.forEach((impVal,impIndex) => {
            let impellerMap = {Impeller_MoC:impVal};
            impellerList.push(impellerMap);
            let casingMoc = impIndex === 0 ? row.Casing_MoC : "";
            htmlTxt += "<tr><td>"+casingMoc+"</td><td>"+impVal+"</td><td><select class='selectpicker' casing='"+row.Casing_MoC+"' impeller='"+impVal+"' name='sleeveMoC' id='sleeveMoC_"+count+"' required multiple>"+sleeveOptions+"</select></td></tr>";
            count++;
        });
        casingMap.Impeller_List = impellerList;
        sleeveMocData.push(casingMap);
    });
    console.log(sleeveMocData);
    document.getElementById("mocTabBody").innerHTML = htmlTxt;
    $('.selectpicker').selectpicker();
    if(seriesRec.data[0].SleeveMoC_Data){
    let crmSleeveMocData = JSON.parse(seriesRec.data[0].SleeveMoC_Data || {});
    // console.log(crmSleeveMocData);
    let sleeveMocList = document.getElementsByName("sleeveMoC");
        sleeveMocList.forEach(sleeve => {
            let sleeveId = sleeve.id;
            let casingVal = $("#"+sleeveId).attr("casing");
            let impellerVal = $("#"+sleeveId).attr("impeller");
            for(let i=0; i<crmSleeveMocData.length;i++){
                let sleeveData = crmSleeveMocData[i];
                if(sleeveData.Casing_MoC == casingVal){
                for(let q=0; q<sleeveData.Impeller_List.length;q++){
                    let impellerData = sleeveData.Impeller_List[q];
                    if(impellerData.Sleeve_MoC && impellerData.Impeller_MoC == impellerVal){
                        $.each(impellerData.Sleeve_MoC, function(idx, val) {
                            $("#"+sleeveId+" option[value='"+val+"']").attr("selected", "selected").change();
                        });
                    }
                }
                }
            }
        });
    }
    document.getElementById("sleeveForm").onsubmit = event => {
        let sleeveMocList = document.getElementsByName("sleeveMoC");
        sleeveMocList.forEach(sleeve => {
            let sleeveId = sleeve.id;
            let sleeveVal = $('#'+sleeveId).val();
            let casingVal = $("#"+sleeveId).attr("casing");
            let impellerVal = $("#"+sleeveId).attr("impeller");
            for(let i=0; i<sleeveMocData.length;i++){
                let sleeveData = sleeveMocData[i];
                if(sleeveData.Casing_MoC == casingVal){
                for(let q=0; q<sleeveData.Impeller_List.length;q++){
                    let impellerData = sleeveData.Impeller_List[q];
                    if(impellerData.Impeller_MoC == impellerVal){
                        impellerData.Sleeve_MoC = sleeveVal;
                    }
                }
                }
            }
        });
        console.log(sleeveMocData);
        var config={Entity:"Series",APIData:{id:data.EntityId[0],SleeveMoC_Data:sleeveMocData}};
          ZOHO.CRM.API.updateRecord(config).then(function(data){
             if(data.data[0].code == "SUCCESS"){
                ZOHO.CRM.UI.Popup.closeReload().then(function(data){console.log(data);});
             }
             else{
                alert("error - "+JSON.stringify(data.data));
             }
          });
        return false;
    }
}  
}
asynFun();
});
ZOHO.embeddedApp.init();