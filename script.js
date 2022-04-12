let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let modalTextArea = document.querySelector(".textarea-cont");
let Colors = ["lightpink", "lightblue", "lightgreen", "black"];
let setModalColor = Colors[Colors.length - 1];
let allPriorityColor = document.querySelectorAll(".priority-color");
let toolboxColors = document.querySelectorAll(".color");

//#️⃣ All Tickets Array
let ticketArr = [];

//#️⃣ Lock-Unlock classes
let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

// **************************************Fetching Data From Local Storage************************************ */
if (localStorage.getItem("jira_tickets")) {
    // Retrive and display tickets
    ticketArr = JSON.parse(localStorage.getItem("jira_tickets"));
    // Create the existing tickets
    ticketArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketColor, ticketObj.ticketId, ticketObj.ticketTask);
    })
}
//********************************************************************************************************** */

//#️⃣Change/toggle priority color while creating modal functionality
allPriorityColor.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) => {
        //step 1: remove border class from color Element
        allPriorityColor.forEach((defaultColor) => {
            defaultColor.classList.remove("border");
        })
        //step 2: add border class on clicked color Element
        colorElem.classList.add("border");
        //step 3: get color class name of the clicked color Element
        setModalColor = colorElem.classList[0];
    })
})


//#️⃣ Add & Remove Button Functionality
// If addflag -> true, Modal display:flex
// If addflag -> false, Modal display:none
let addFlag = false;
let removeFlag = false;

addBtn.addEventListener("click", (e) => {

    //Display Modal (On click: Toggle)
    addFlag = !addFlag;
    if (addFlag) {
        modalCont.style.display = "flex";
    }
    else {
        modalCont.style.display = "none";
    }
})

removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
})

//#️⃣Pressing Shift key to add ticket 
modalCont.addEventListener("keydown", (e) => {
    let key = e.key + e.location;
    if (key === "Shift2") {
        createTicket(setModalColor, shortid(), modalTextArea.value);
        addFlag = false;
        setModalToDefault();

    }
})

//#️⃣Make a function to create a ticket
function createTicket(ticketColor, ticketId, ticketTask) {

    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">#${ticketId}</div>
        <div class="ticket-task-area">${ticketTask}</div>
        <div class="ticket-lock-icon">
        <i class="fa-solid fa-lock"></i>
        </div>`
    
    //*️⃣*️⃣ Do Check if the ticket created above is already exist in (ticket array or database) Or Not.
    let ticketIdx = getTicketIdx(ticketId);
    if (ticketIdx === -1) {
        //*️⃣Creating an object of ticket and pushing in the ticket array
        ticketArr.push({ ticketColor, ticketId, ticketTask });
        //*️⃣Creating a local storage and adding array as a object
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
    }

    //step 1: Add created ticket to the main container
    mainCont.appendChild(ticketCont);
    //step 2: Handle remove: attach remove click event listiner on every created
    handleRemove(ticketCont, ticketId);
    // step 3:Handle lock-unlock: Lock-Unlock Functionality, attach click event listener on every created ticket
    handleLockUnlock(ticketCont, ticketId);
    // step 4: Handle toggle color functionality
    handleToggleColor(ticketCont, ticketId);
}

//#️⃣Handle Remove functionality
function handleRemove(ticket, id) {
    ticket.addEventListener("click", (e) => {
        // removeFlag -> True, remove the ticket
        if (removeFlag) {
            //*️⃣ Get ticket index from ticket array : so that we can update the data after deletion of some tickets in local storage
            let ticketIdx = getTicketIdx(id);
            ticket.remove();
            //*️⃣ Modify data in local storage and ticket array : (Some tickets Deleted)
            ticketArr.splice(ticketIdx, 1);
            localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
        }
    })
}

//#️⃣ Handle Lock-Unlock Icon Functionality : Edit task area(Using property contenteditable)
function handleLockUnlock(ticket, id) {
    let ticketLockIcon = ticket.querySelector(".ticket-lock-icon");
    let icon = ticketLockIcon.children[0];
    let ticketTaskArea = ticket.querySelector(".ticket-task-area");

    icon.addEventListener("click", (e) => {
        //*️⃣ Get ticket index from ticket array : so that we can update the value of TaskArea in local storage
        let ticketIdx = getTicketIdx(id);

        if (icon.classList.contains(lockClass)) {
            //unlocking
            icon.classList.remove(lockClass);
            icon.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        } else {
            //locking
            icon.classList.remove(unlockClass);
            icon.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        //*️⃣ Modify data in local storage and ticket array : (Task Area Change)
        ticketArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
    })
}

//#️⃣Handle change/toggle priority color of ticket functionality
function handleToggleColor(ticket, id) {

    let ticketColor = ticket.querySelector(".ticket-color");

    ticketColor.addEventListener("click", (e) => {
        //*️⃣ Get ticket index from ticket array : so that we can update the value of color in local storage
        let ticketIdx = getTicketIdx(id);

        //step 1: Get current color
        let currentColor = ticketColor.classList[1];
        // step 2: find index of current color in Colors array
        let currentColorIdx = Colors.findIndex((color) => {
            return color === currentColor;
        });
        //step 3: finally increanment index and toggle color
        currentColorIdx++;
        let newColorIdx = currentColorIdx % Colors.length;
        let newColor = Colors[newColorIdx];

        ticketColor.classList.remove(currentColor);
        ticketColor.classList.add(newColor);

        //*️⃣ Modify data in local storage and ticket array : (Priority Color Change)
        ticketArr[ticketIdx].ticketColor = newColor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
    })


}

//#️⃣Get ticket index using ticket id
function getTicketIdx(id) {
    let ticketIdx = ticketArr.findIndex((ticketObj) => {
        return ticketObj.ticketId === id;
    });
    return ticketIdx;
}

//#️⃣Handle ToolBox Priority color select and display only selected color tickets Functionality
for (let i = 0; i < toolboxColors.length; i++) {
    let selectedToolBoxColor = toolboxColors[i].classList[0];

    toolboxColors[i].addEventListener("click", (e) => {
        let allTickets = document.querySelectorAll(".ticket-cont");
        let allTicketsColor = document.querySelectorAll(".ticket-color");

        for (let j = 0; j < allTickets.length; j++) {
            if (selectedToolBoxColor !== allTicketsColor[j].classList[1]) {
                allTickets[j].style.display = "none";
            } else {
                allTickets[j].style.display = "block";
            }
        }
    })

    toolboxColors[i].addEventListener("dblclick", (e) => {
        let allTickets = document.querySelectorAll(".ticket-cont");
        let allTicketsColor = document.querySelectorAll(".ticket-color");

        for (let j = 0; j < allTickets.length; j++) {
            allTickets[j].style.display = "block";
        }
    })
}

//#️⃣Set Modal priority color, value and display property to default
function setModalToDefault() {

    // step 1: remove border class from modal priority colors
    allPriorityColor.forEach((colorElem) => {
        colorElem.classList.remove("border");
    })
    // step 2: add border class on the default Black color & also setModalColor to black
    allPriorityColor[allPriorityColor.length - 1].classList.add("border");
    setModalColor = Colors[Colors.length - 1];

    // step 3: display none & value of textarea empty
    modalCont.style.display = "none";
    modalTextArea.value = "";
}