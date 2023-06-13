function findOverlap(employee1, employee2) { //take two periods of time and find how many days overlap
    start1 = new Date(employee1.DateFrom);
    end1 = employee1.DateTo === "NULL" ? new Date() : new Date(employee1.DateTo);
    start2 = new Date(employee2.DateFrom);
    end2 = employee2.DateTo === "NULL" ? new Date() : new Date(employee2.DateTo);
    if (start1 >= end2 || end1 <= start2) { //check if there even is overlap
        return 0;
    }

    const MILLISECONDS_IN_A_DAY = 86400000;
    const overlapStart = start1 < start2 ? start2 : start1;
    const overlapEnd = end1 < end2 ? end1 : end2;
    const overlapDurationDays = Math.ceil((overlapEnd - overlapStart) / MILLISECONDS_IN_A_DAY);
    
    return overlapDurationDays;
}

function toEmployeeCentered(employees) {
    let uniqueEmployees = [];
    let projects = [];
    for (let i = 0; i < employees.length; i++) {
        if (!uniqueEmployees.includes(employees[i].EmpID)) {
            uniqueEmployees.push(employees[i].EmpID);
            projects[employees[i].EmpID] = [{ProjectID: employees[i].ProjectID, DateFrom: employees[i].DateFrom, DateTo: employees[i].DateTo}]
        } else
            projects[employees[i].EmpID].push({ProjectID: employees[i].ProjectID, DateFrom: employees[i].DateFrom, DateTo: employees[i].DateTo});
    }
    
    let result = [];
    for (let i = 0; i < uniqueEmployees.length; i++) {
        result.push({EmpID: uniqueEmployees[i], Projects: projects[uniqueEmployees[i]]});
    }

    return result;
}

function findPair(input) {
    const employeesInitial = input.data;
    console.log(employeesInitial);

    let employees = toEmployeeCentered(employeesInitial);
    console.log("employees: ");
    console.log(employees);

    //pair with longest total time spent on a project together
    //EXAMPLE {EmployeeID1: 203, EmployeeID2: 392}
    let pair = {};

    //every project shared by the pair and the time they've been together on it
    //EXAMPLE [{ProjectID: 10, DaysWorked: 104}, {ProjectID: 10, DaysWorked: 104}]
    let projects = [];
    
    //total duration out of every project the pair has worked on
    let totalDuration = 0;
    
    for (let i = 0; i < employees.length - 1; i++) {//looking through our list of employees
        for (let j = i + 1; j < employees.length; j++) {//looking through the list again so we could pair up everyone. every iteration is practically a new pair of employees
            let currentProjects = [];
            let currentTotalDuration = 0;

            for (let k = 0; k < employees[i].Projects.length; k++) {//checking each project of every employee
                for (let l = 0; l < employees[j].Projects.length; l++) {//and if any of them match any of the projects of the paired employee
                    if (employees[i].Projects[k].ProjectID === employees[j].Projects[l].ProjectID) {
                        overlap = findOverlap(employees[i].Projects[k], employees[j].Projects[l]);
                        currentTotalDuration += overlap;
                        currentProjects.push({ProjectID: employees[i].Projects[k].ProjectID, DaysWorked: overlap});                        
                    }
                }
            }

            if (totalDuration < currentTotalDuration) {
                totalDuration = currentTotalDuration;
                projects = currentProjects;
                pair = {EmpID1: employees[i].EmpID, EmpID: employees[j].EmpID};
            }
        }
    }

    console.log("so guy. the pair that has worked the most on projects are those two:");
    console.log(pair);
    console.log("for a whopping " + totalDuration + " days! (don't quote me on that)");
    console.log(projects);
    
}

const uploadconfirm = document.getElementById("uploadconfirm").
addEventListener("click", () => {
    if (document.getElementById("uploadfile").files[0] === undefined) {
        //MAKE AN ERROR MESSAGE WHEN YOU CAN
        return;
    }
    Papa.parse(document.getElementById("uploadfile").files[0],
    {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {//EXAMPLE LINE {EmpID: '143', ProjectID: '12', DateFrom: '2021-04-08', DateTo: '2021-12-13'}
            findPair(results);
        }
    });
});