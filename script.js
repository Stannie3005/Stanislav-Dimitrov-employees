function findOverlap(employee1, employee2) { //take two periods of time and find how many days overlap
    //if value isn't a real date, the calculations will simply not work and it'll get skipped
    start1 = new Date(employee1.DateFrom);
    end1 = employee1.DateTo === "NULL" ? new Date() : new Date(employee1.DateTo);
    start2 = new Date(employee2.DateFrom);
    end2 = employee2.DateTo === "NULL" ? new Date() : new Date(employee2.DateTo);

    if (start1 >= end2 || end1 <= start2) { //check if there even is overlap
        return 0;
    }

    const MILLISECONDS_IN_A_DAY = 86400000;

    //finding the period of time where the two dates overlap
    const overlapStart = start1 < start2 ? start2 : start1;
    const overlapEnd = end1 < end2 ? end1 : end2;
    const overlapDurationDays = Math.ceil((overlapEnd - overlapStart) / MILLISECONDS_IN_A_DAY);
    
    return overlapDurationDays;
}

/*function to convert the data we read from the file so that employee IDs dont repeat 
and we have information about projects for each employee*/
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

//function to create the datagrid with needed information and append it to the page
function appendData(pair, projects) {
    let table = document.createElement("table");
    table.classList = "tbl";

    let headers = document.createElement("tr");

    let header1 = document.createElement("th");
    header1.innerText = "Employee ID #1";
    headers.append(header1);
    let header2 = document.createElement("th");
    header2.innerText = "Employee ID #2";
    headers.append(header2);
    let header3 = document.createElement("th");
    header3.innerText = "Project ID";
    headers.append(header3);
    let header4 = document.createElement("th");
    header4.innerText = "Days worked";
    headers.append(header4);

    table.append(headers);

    for (let i = 0; i < projects.length; i++) {
        let row = document.createElement("tr");

        emp1 = document.createElement("th");
        emp1.innerText = pair.EmpID1;
        row.append(emp1);
        emp2 = document.createElement("th");
        emp2.innerText = pair.EmpID2;
        row.append(emp2);

        proj = document.createElement("th");
        proj.innerText = projects[i].ProjectID;
        row.append(proj);
        days = document.createElement("th");
        days.innerText = projects[i].DaysWorked;
        row.append(days);

        table.append(row);
    }

    document.querySelector(".container").append(table);
}

/*function to take the information we parsed from the csv file,
convert it to a friendlier structure for this algorithm
which then gets parsed, effectively checking every possible pair of employees
and seeing which pair has the largest number of days they both worked at the same time on mutual projects*/
function findPair(input) {
    if (input.data.length <= 1) { //catches if the user uploaded an empty csv file or a file with only one
        alert("You need at least two records in the CSV file. Please review the contents of the file.");
        return;
    }

    const employeesInitial = input.data;

    let employees = toEmployeeCentered(employeesInitial);

    //pair with longest total time spent on a project together
    //EXAMPLE {EmpID1: 203, EmpID2: 392}
    let pair = {};

    //every project shared by the pair and the time they've been together on it
    //EXAMPLE [{ProjectID: 10, DaysWorked: 104}, {ProjectID: 10, DaysWorked: 104}]
    let projects = [];
    
    //total duration out of every project the pair has worked on
    let totalDuration = 0;
    
    for (let i = 0; i < employees.length - 1; i++) {//looking through our list of employees
        for (let j = i + 1; j < employees.length; j++) {//looking through the list again so we could pair up everyone. every iteration is practically a new pair of employees
            //temporary variables
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
            
            //if the current pair has worked together more days than the current max, they become the official winners for now
            if (totalDuration < currentTotalDuration) {
                totalDuration = currentTotalDuration;
                projects = currentProjects;
                pair = {EmpID1: employees[i].EmpID, EmpID2: employees[j].EmpID};
            }
        }
    }
    
    document.querySelector("table").remove();//removing the existing table if a user had already run this before
    appendData(pair, projects);
}

const uploadconfirm = document.getElementById("uploadconfirm").
addEventListener("click", () => {
    if (document.getElementById("uploadfile").files[0] === undefined) { //using PapaParse 5.4.1 to parse the CSV file into an array of objects
        return;
    }
    Papa.parse(document.getElementById("uploadfile").files[0],
    {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {//EXAMPLE OBJECT IN THE ARRAY {EmpID: '143', ProjectID: '12', DateFrom: '2021-04-08', DateTo: '2021-12-13'}
            findPair(results);
        }
    });
});