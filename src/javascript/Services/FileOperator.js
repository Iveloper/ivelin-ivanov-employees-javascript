function FileOperator() {
    const input = document.querySelector('input[type="file"]');
    const reader = new FileReader();
    let resultArray;

    /** In this function we wait for change in our input in the index.html file,
     * when a file is uploaded we read it as text thanks to the instance of FileReader class
     * after that we split it by new line in an array.
     * resultArray contains every line in the txt file as new element.
     * Last,but not least, we pass the resultArray to the formatting function.
     * */
    this.readFileContent = function () {
        input.addEventListener('change', function (e) {
            reader.readAsText(input.files[0]);
            reader.onload = function () {
                resultArray = reader.result.split("\n");
                formatArrayOfObjects(resultArray);
            }
        });

    }

    /** We take the splitted by new line array and iterate through it to see if there are any spaces which
     * we will replace with empty strings,and after that we split every line by comma to store every element for an
     * employee in subarray.
     * And after that we store every element for the employee to a new array of objects.
     * Every object will contain the info for certain employee.
     * */
    let formatArrayOfObjects = function (array) {
        let arrayOfObjects = [];
        let dateFormat = new Date().toISOString().split('T')[0];

        for (let i = 0; i < array.length; i++) {
            let formatted = array[i].replace(/\s/g, '').split(",");
            if (formatted[3].toLowerCase() === "null") {
                formatted[3] = dateFormat;
            }

            if (!arrayOfObjects.hasOwnProperty(formatted[1])) {
                arrayOfObjects[formatted[1]] = [];
            }

            arrayOfObjects[formatted[1]].push({
                employeeId: formatted[0],
                projectId: formatted[1],
                startDate: formatted[2],
                endDate: formatted[3],
            })
        }
        allEmployeesWorkingForProject(arrayOfObjects);
    }

    /*Here we iterate through every projectId, which holds an array with all employees working for it.
      Then we iterate through every employee working for the current project and we compare them with
      each other to find out which pair has spend most time on the project together.*/
    let allEmployeesWorkingForProject = function (employeesPerProject) {
        let employeesArray = [];
        employeesPerProject.forEach((employeeIter) => {
            for (let i = 0; i < employeeIter.length; i++) {
                for (let j = i + 1; j < employeeIter.length; j++) {
                    let mostHours = employeesWithMostCommonHoursForProject(employeeIter[i], employeeIter[j]);
                    if (mostHours) {
                        employeesArray.push(mostHours);
                    }
                }
            }
        });
        removeDuplicates(employeesArray);
    }


    let employeesWithMostCommonHoursForProject = function (currentEmployee, nextEmployee) {
        const DIFFERENCE_IN_DAYS = 1000 * 60 * 60 * 24;
        let laterStartDate,
            earlierEndDate,
            employee1StartDate = new Date(currentEmployee.startDate),
            employee1EndDate = new Date(currentEmployee.endDate),
            employee2StartDate = new Date(nextEmployee.startDate),
            employee2EndDate = new Date(nextEmployee.endDate);


        //Check which one of the employees started working on the project second, and take his start date.
        if (employee1StartDate.getTime() >= employee2StartDate.getTime()) {
            laterStartDate = employee1StartDate;
        } else {
            laterStartDate = employee2StartDate;
        }

        //Check which employee stopped working on the project first, and take his end date.
        if (employee1EndDate.getTime() <= employee2EndDate.getTime()) {
            earlierEndDate = employee1EndDate;
        } else {
            earlierEndDate = employee2EndDate;
        }

        //The days employees worked on the project is the difference between the later start date and the earlier end date.
        let differenceInDays = (earlierEndDate.getTime() - laterStartDate.getTime()) / DIFFERENCE_IN_DAYS;

        //Here we check if the current two employees got to work together on the project at all,
        // and if the two employees are not the same person.
        if (employee1StartDate > employee2EndDate
            || employee2StartDate > employee1EndDate
            || currentEmployee.employeeId === nextEmployee.employeeId) {
            return;
        }

        //If the above statement does not execute, we return an object containing employees's IDs and their
        //the sum of their days working on the project, we add 1 day for the last day, because we count the days without it.
        return {
            employee1ID: currentEmployee.employeeId,
            employee2ID: nextEmployee.employeeId,
            commonDays: Math.abs(differenceInDays) + 1
        }
    }

    /* In this function we check if current employees were working for more than one project together,
    * if so - we sum the hours for both projects,save the new value for the common hours and delete
    * one of the two objects.*/
    let removeDuplicates = function (duplicatesArray) {
        for (let i = 0; i < duplicatesArray.length; i++) {
            for (let j = i + 1; j < duplicatesArray.length; j++) {
                if (duplicatesArray.hasOwnProperty(i) && duplicatesArray.hasOwnProperty(j)
                    && ((duplicatesArray[i].employee1ID === duplicatesArray[j].employee1ID
                        && duplicatesArray[i].employee2ID === duplicatesArray[j].employee2ID)
                        || (duplicatesArray[i].employee1ID === duplicatesArray[j].employee2ID
                            && duplicatesArray[i].employee2ID === duplicatesArray[j].employee1ID))) {

                    duplicatesArray.push({
                        employee1ID: duplicatesArray[i].employee1ID,
                        employee2ID: duplicatesArray[i].employee2ID,
                        commonDays: duplicatesArray[i].commonDays + duplicatesArray[j].commonDays
                    });
                    delete duplicatesArray[i];
                    delete duplicatesArray[j];
                }
            }

        }

        /*Here we reduce the array, so we can find which value of the 'commonDays' property is the highest
        * in other words - the solution to our problem. */
        let max = duplicatesArray.reduce(function (prev, current) {
            return (prev.commonDays > current.commonDays) ? prev : current
        });
        console.log(max);
        alert("Employee " + max.employee1ID + " and employee " + max.employee2ID + " have worked the most time together - " + max.commonDays + " days");
    }
}

let obj = new FileOperator();
obj.readFileContent();


