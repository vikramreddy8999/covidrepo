const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const InitialDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
InitialDbAndServer();


const convertObjectStateResponse=(dbO)=>{
    stateId:dbo.state_id,
    stateName:dbo.state_name,
    population:dbo.population,
}

const convertObjectDistrictResponse=(dbO)=>{
    districtId:dbo.district_id,
    districtName:dbo.district_name,
    stateId:dbo.state_id,
    cases:dbo.cases,
    cured:dbo.cured,
    active:dbo.active,
    deaths:dbo.deaths,
}

app.get("/states/",async(request,response)=>{
    const states=`
    SELECT *
    FROM state`;
    const stateArray=await db.all(states)
    response.send(stateArray.map((each)=>convertObjectStateResponse(each)));
});

app.get("/states/:stateId/",async(request,response)=>{
    const{stateId}=request.params;
    const getState=`
    SELECT *
    FROM state
    WHERE state_id=${stateId};`;
    const details=await db.get(getState);
    response.send(convertObjectStateResponse.details);
});

app.post("/districts/",async(request,response)=>{
    const detailsDistrict=request.body;
    const {districtName,stateId,cured,active,deaths}=districts;
    const addDistrict=`
    INSERT INTO district(district_name,state_id,cured,active,deaths)
    VALUES(
        `${districtName}`,${stateId},${cured},${active},${deaths}
    );`;
    const detailedDistrict=await db.run(addDistrict);
    response.send("District successfully Added");
});

app.get("/districts/:districtId/",async(request,response)=>{
    const {districtId}=request.body;
    const getDistrict=`
    SELECT * 
    FROM district
    where district_id=${districtId};`;
    const district=await db.get(getDistrict);
    response.send(district.map((each)=>convertObjectDistrictResponse(each)));
})

app.delete("/districts/:districtId/",async(request,response)=>{
    const{districtId}=request.params;
    const deleteDistrict=`
    DELETE FROM
    district 
    WHERE
    district_id=${districtId};`;
    await db.get(deleteDistrict);
    response.send("District Removed")
});

app.put("/districts/:districtId/",async(request,response)=>{
    const {districtId}=request.params;
    const districtDetails=request.body;
    const{districtName,stateId,cases,cured,active,deaths}=districtDetails;
    const updateDistrict=`
    UPDATE
    district
    SET
    district_name=`${districtName}`,
    state_id=${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths}
    WHERE district_id=${districtId};`;
    await db.run(updateDistrict);
    response.send("District Details Updated");    

})


app.get("/districts/:districtId/",(request,response)=>{
    const {stateId}=request.params;
    const getDetails=`
    SELECT 
    SUM(cases) as TotalCases,
    SUM(cured) as TotalCured,
    SUM(active) as TotalActive,
    SUM(deaths) as TotalDeaths 
    FROM district
    WHERE state_id=${stateId};`;
    const districtDetails=await db.get(getDetails);
    response.send(districtDetails.map((each)=>convertObjectDistrictResponse(each)));
});


app.get("/districts/:districtId/details/",async(request,response)=>{
    const {districtId}=request.params;
    const getDistrictName=`
    SELECT stateName
    FROM district NATURAL JOIN state
    WHERE district_id=${districtId}`
    const state=await db.get(getDistrictName);
    response.send(`stateName:state.state_name`);

});
module.exports=app;