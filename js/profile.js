document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem("jwt");
    window.location.href = "index.html";
});

async function fetchUserData() {
    const jwt = localStorage.getItem("jwt");
    const query = `
    query {
        user{
            login
            firstName
            lastName
            auditRatio
            totalDown
            totalUp
            totalUpBonus
            skills: transactions(
                    where: {
                        type: { _like: "skill%" } 
                            }
                order_by : {amount :desc}
                ) {
            amount
            type
        }

        transactions (where :{_and : [
        {type : {_eq :"level"}}
        {object :{type :{_eq :"project"}}}
        ]}
        limit : 1
        order_by : {amount :desc}
        ){
            amount
        }

        totalXp: transactions_aggregate(
            where: {
            _and: [
            { type: { _eq: "xp" } }
            {event:{object:{name:{_eq:"Module"}}}}
        ]
        }
        ) {
        aggregate {
        sum {
            amount
            }
        }
        } 
        }
        
        transaction (where:{_and:[
            {type :{_eq :"xp"}}
            {event:{object:{name:{_eq:"Module"}}}}
        ]}
            order_by :{createdAt :asc}
        ){
            amount
            object{
                name
            }
            createdAt
        }
    }`;

    const response = await fetch("https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${jwt}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
    });

    const data = await response.json();

    if (data.errors) {
        localStorage.removeItem("jwt");
        window.location.href = "login.html";
    } else {
        renderProfile(formatData(data.data));
    }
}
fetchUserData();

function formatData(data) {
    let newData = {};
    newData.login = data.user[0].login ? data.user[0].login : "Unkonwn user";
    newData.firstName = data.user[0].firstName ? data.user[0].firstName : "Unkonwn";
    newData.lastName = data.user[0].lastName ? data.user[0].lastName : "Unkonwn";
    newData.auditRatio = data.user[0].auditRatio ? data.user[0].auditRatio : 0;
    newData.totalDown = data.user[0].totalDown ? data.user[0].totalDown : 0;
    newData.totalUp = data.user[0].totalUp ? data.user[0].totalUp : 0;
    newData.totalUpBonus = data.user[0].totalUpBonus ? data.user[0].totalUpBonus : 0;
    newData.totalXp = data.user[0].totalXp.aggregate.sum.amount ? data.user[0].totalXp.aggregate.sum.amount : 0;
    newData.level = data.user[0].transactions[0] ? data.user[0].transactions[0].amount : 0;
    let isData = false;
    data.user[0].skills.forEach(skill => {
        if (skill.type === "skill_prog" && !newData.skillProg) {
            newData.skillProg = skill.amount;
        }
        if (skill.type === "skill_algo" && !newData.skillAlgo) {
            newData.skillAlgo = skill.amount;
        }
        if (skill.type === "skill_sql" && !newData.skillSql) {
            newData.skillSql = skill.amount;
        }
        if (skill.type === "skill_back-end" && !newData.skillBackend) {
            newData.skillBackend = skill.amount;
        }
        if (skill.type === "skill_front-end" && !newData.skillFrontend) {
            newData.skillFrontend = skill.amount;
        }
        if (skill.type === "skill_go" && !newData.skillGo) {
            isData = true;
            newData.skillGo = skill.amount;
        }
    });

    if (!isData) {
        newData.skillGo = 0;
        newData.skillSql = 0;
        newData.skillFrontend = 0;
        newData.skillBackend = 0;
        newData.skillAlgo = 0;
        newData.skillProg = 0;
    }

    return newData;
}

function formatSize(value) {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(2)} <span style="color: #fdefef; font-size: 3rem;">MB</span>`;
    } else if (value >= 1000) {
        return `${parseInt(value / 1000)} <span style="color: #fdefef; font-size: 3rem;">KB</span>`;
    } else {
        return `${parseInt(value)} <span style="color: #fdefef; font-size: 3rem;">B</span>`;
    }
}

function renderProfile(data) {
    document.getElementById('userName').innerText = data.login;

    document.getElementById('container').innerHTML = `
    <div class="user-info">
        <h1>Welcome, ${data.firstName} ${data.lastName}!</h1>
        <h2>Level: ${data.level}</h2>
        <h1>Total xp: ${formatSize(data.totalXp)}</h1>
    </div>

    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <text x="100" y="30" class="title">Audits ratio: ${(data.auditRatio).toFixed(1)}</text>

        <text x="60" y="50" class="section" stroke="#75c778">Done</text>
        <text x="110" y="50" class="highlight"> ${(data.totalUp / 1000000).toFixed(2)} MB</text>
        <rect x="30" y="60" width="${data.totalUp / 5000}" height="10" fill="#75c778" />
        <text x="200" y="50" class="bonus">+ ${(data.totalUpBonus / 1000).toFixed(2)} kB ↑ </text>

        <text x="60" y="100" class="section" stroke="#f7a4a4">Received</text>
        <text x="120" y="100" class="highlight"> ${(data.totalDown / 1000000).toFixed(2)} MB</text>
        <rect x="30" y="110" width="${data.totalDown / 5000}" height="10" fill="#f7a4a4" />

    </svg>
    
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <line x1="40" y1="50" x2="40" y2="250" stroke="#888"/>
        <text x="20" y="250" class="section">0%</text>
        <text x="20" y="210" class="section">20%</text>
        <text x="20" y="170" class="section">40%</text>
        <text x="20" y="130" class="section">60%</text>
        <text x="20" y="90" class="section">80%</text>
        <text x="20" y="50" class="section">100%</text>
        <line x1="40" y1="250" x2="350" y2="250" stroke="#888"/>
        
        <rect x="50" y="${makeHeight(data.skillProg)[0]}" width="40" height="${makeHeight(data.skillProg)[1]}" fill="#fdefef" />
        <text x="70" y="245" class="section">Prog</text>
        <rect x="100" y="${makeHeight(data.skillAlgo)[0]}" width="40" height="${makeHeight(data.skillAlgo)[1]}" fill="#fdefef" />
        <text x="120" y="245" class="section">Algo</text>
        <rect x="150" y="${makeHeight(data.skillBackend)[0]}" width="40" height="${makeHeight(data.skillBackend)[1]}" fill="#fdefef" />
        <text x="170" y="245" class="section">Back</text>
        <rect x="200" y="${makeHeight(data.skillFrontend)[0]}" width="40" height="${makeHeight(data.skillFrontend)[1]}" fill="#fdefef" />
        <text x="220" y="245" class="section">Front</text>
        <rect x="250" y="${makeHeight(data.skillGo)[0]}" width="40" height="${makeHeight(data.skillGo)[1]}" fill="#fdefef" />
        <text x="270" y="245" class="section">Go</text>
        <rect x="300" y="${makeHeight(data.skillSql)[0]}" width="40" height="${makeHeight(data.skillSql)[1]}" fill="#fdefef" />
        <text x="320" y="245" class="section">SQL</text>
    </svg>
    `;
}

function makeHeight(value) {
    return [250 - (value * 2), value * 2];
}
