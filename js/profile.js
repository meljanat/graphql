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
    newData.login = data.user[0].login;
    newData.firstName = data.user[0].firstName;
    newData.lastName = data.user[0].lastName;
    newData.auditRatio = data.user[0].auditRatio;
    newData.totalDown = data.user[0].totalDown;
    newData.totalUp = data.user[0].totalUp;
    newData.totalUpBonus = data.user[0].totalUpBonus;
    newData.totalXp = data.user[0].totalXp.aggregate.sum.amount;
    newData.level = data.user[0].transactions[0].amount;

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
            newData.skillGo = skill.amount;
        }
    });

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
    console.log(data);

    document.getElementById('userName').innerText = data.login;

    document.getElementById('container').innerHTML = `
    <div class="user-info">
        <h1>Welcome, ${data.firstName} ${data.lastName}!</h1>
        <h2>Level: ${data.level}</h2>
        <h1>Total xp: ${formatSize(data.totalXp)}</h1>
    </div>

    <svg width="200" height="230" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
        <style>
            .title { font: bold 18px sans-serif; fill: #FFF; text-anchor: middle; }
            .section { font: 14px sans-serif; fill: #AAA; text-anchor: middle; }
            .highlight { font: bold 14px sans-serif; fill: #FFF; text-anchor: middle; }
            .bonus { fill: #FFC107; font: 12px sans-serif; text-anchor: middle; }
            .received { fill: #BBB; font: 12px sans-serif; text-anchor: middle; }
        </style>
        
        <text x="100" y="20" class="title">Audits ratio: ${(data.auditRatio).toFixed(1)}</text>
        
        <circle cx="100" cy="120" r="85" fill="transparent" />
        
        <circle cx="100" cy="120" r="80" fill="none" stroke="#75c778" stroke-width="12" stroke-dasharray="${(data.totalUp / (data.totalUp + data.totalDown + data.totalUpBonus) * 502).toFixed(1)}, 502" transform="rotate(-90 100 120)" />
        <circle cx="100" cy="120" r="80" fill="none" stroke="#FFC107" stroke-width="12" stroke-dasharray="${(data.totalUpBonus / (data.totalUp + data.totalDown + data.totalUpBonus) * 502).toFixed(1)}, 502" transform="rotate(${(data.totalUp / (data.totalUp + data.totalDown + data.totalUpBonus) * 360 - 90).toFixed(1)} 100 120)" />
        <circle cx="100" cy="120" r="80" fill="none" stroke="#ffbab5" stroke-width="12" stroke-dasharray="${(data.totalDown / (data.totalUp + data.totalDown + data.totalUpBonus) * 502).toFixed(1)}, 502" transform="rotate(${((data.totalUp + data.totalUpBonus) / (data.totalUp + data.totalDown + data.totalUpBonus) * 360 - 90).toFixed(1)} 100 120)" />
        
        <text x="100" y="95" class="section" stroke="#75c778">Done</text>
        <text x="100" y="110" class="highlight">${(data.totalUp / 1000000).toFixed(2)} MB</text>
        <text x="100" y="125" class="bonus">+ ${(data.totalUpBonus / 1000).toFixed(2)} kB ↑</text>
        
        <text x="100" y="145" class="section" stroke="#ffbab5">Received</text>
        <text x="100" y="160" class="highlight">${(data.totalDown / 1000000).toFixed(2)} MB</text>
        <text x="100" y="175" class="received">↓</text>
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
