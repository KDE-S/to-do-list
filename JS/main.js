
// localStorage.removeItem("stageItems");
// localStorage.removeItem("completedItems");


class Database {
    read(key) {
        return JSON.parse(localStorage.getItem(key));
    };
    wirte(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    remove(key) {
        localStorage.removeItem(key);
    }
}

class ModalHandler {
    constructor() {
        this.cancelModalBtns = document.querySelectorAll("button[data-dismiss='modal']");
        this.removePromptBox = document.getElementById("removePrompt");
        this.confirmDelete = document.getElementById("confirmDelete");

        //ready to trigger for cancel modal:
        for (let i = 0; i < this.cancelModalBtns.length; i++) {
            this.cancelModalBtns[i].addEventListener("click", () => {
                this.removePromptBox.classList.remove("show");
                this.removePromptBox.classList.add("hide");
                setTimeout(() => {
                    this.removePromptBox.classList.add("remove")
                }, 500);
            })
        };
    }
}

class NoteHandle {
    constructor() {
        this.addBtn = document.getElementById("add");
        this.inputText = document.getElementById("activity");
        this.completedItems = document.getElementById("todo-completed");
        this.stageItems = document.getElementById("todo-stage");
        this.completedItemsTitle = document.getElementById("completed-items-title");
        this.stageItemsStack = [];
        this.completedItemsStack = [];

        //Event for Enter key insted of Click:
        this.inputText.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.addBtn.click();
            }
        })
    }

    //Verify data in Database and Update data:
    initializeDatabase(){
        if(database.read("stageItems") && database.read("stageItems") !== null){
            this.stageItemsStack = database.read("stageItems");
            if(this.stageItemsStack.length > 0){
                this.initializeFirstShow("stageItems");
            }
        }else{
            this.stageItemsStack = [];
        }
        if(database.read("completedItems") && database.read("completedItems") !== null ){
            this.completedItemsStack = database.read("completedItems");
            if(this.completedItemsStack.length > 0){
                this.initializeFirstShow("completedItems");
            }
        }else{
            this.completedItemsStack = [];
        }
    }

    initializeFirstShow(panelName){
        if(panelName === "stageItems"){
            for(let item of this.stageItemsStack){
                this.createNewItem(item, "stageItems");
            }
        }else if(panelName === "completedItems"){
            console.log(this.completedItemsStack);
            for(let item of this.completedItemsStack){
                this.createNewItem(item, "completedItems");
            }
            this.completedItems.classList.remove("d-none");
            this.completedItemsTitle.classList.remove("d-none");
        }
    }

    //Listner for add new Item:
    addItemListener() {
        this.addBtn.addEventListener("click", () => {
            let activity = document.getElementById("activity");
            if (activity.value) {
                this.addNewItem(activity.value);
                activity.value = "";
            } else {
                console.log("Null!");
            }
        });
    }

    //Handle deletion proccess:
    deleteEval(e) {
        let _this = this;
        modalHandler.confirmDelete.onclick = deleteHandle;
        function deleteHandle() {
            let item = e.parentElement.parentElement;
            let itemId = e.parentElement.previousElementSibling.innerText;
            let parent = item.parentElement;
            
            item.style.animation = "itemFadeOut 0.5s ease";
            item.style.opacity = 1;
            item.addEventListener("animationend", () => {
                parent.removeChild(item);
                console.log(localStorage);
                _this.deleteItemFromStack(itemId, parent.id);
                console.log(localStorage);
                if (parent.id === "todo-completed") {
                    let items = document.querySelectorAll("#todo-completed li");
                    if (items.length == 0) {
                        parent.classList.add("d-none");
                        _this.completedItemsTitle.classList.add("d-none");
                    }
                }
            })
        }
    }

    deleteItemFromStack(itemId, panelName, doneStatus){
        if(panelName == "todo-completed"){
            for(let i=0; i < this.completedItemsStack.length; i++){
                if(this.completedItemsStack[i].id == itemId){
                    this.completedItemsStack.splice(i, 1);
                    // this.resetIds("compltedItems");
                    database.wirte("completedItems", this.completedItemsStack);
                }
            }
        }else if(panelName == "todo-stage"){
            console.log("DEL");
            console.log("Item:");
            console.log(itemId);
            for(let i=0; i < this.stageItemsStack.length; i++){
                if(this.stageItemsStack[i].id == itemId){
                    console.log("IF");
                    let removedItem = this.stageItemsStack[i];
                    this.stageItemsStack.splice(i, 1);
                    // this.resetIds("stageItems");
                    database.wirte("stageItems", this.stageItemsStack);
                    if(doneStatus == true){
                        console.log("TRUE");
                        this.completedItemsStack.push(removedItem);
                        // this.resetIds("completedItems");
                        database.wirte("completedItems", this.completedItemsStack);
                    }
                    break;
                }
            }
        }        
    }

    //store new Item:
    addNewItem(text){
        console.log(localStorage);
        let newItem = {
            id: uuidv4(),
            text: text
        };
        this.stageItemsStack.push(newItem);
        database.wirte("stageItems", this.stageItemsStack);
        this.createNewItem(newItem, "stageItems");
    }

    //add new Item:
    createNewItem(newItem, panelName) {
        let itemBox = document.createElement("li");
        itemBox.className = "activity bg-light rounded-3 align-content-center mb-1";

        if(panelName ==="completedItems"){
            itemBox.classList.add("activity-done")
        }
        
        //Text
        let itemText = document.createElement("div");
        itemText.className = "activity-text";
        itemText.innerHTML = newItem.text;

        //ID
        let itemID = document.createElement("span");
        itemID.setAttribute("id", "item-id");
        itemID.innerText = newItem.id;

        //buttons
        let buttons = document.createElement("div");
        buttons.className = "buttons";

        //remove button
        let removeBtn = document.createElement("button");
        let removeIcon = document.createElement("i");
        removeIcon.className = "bi bi-trash";
        removeBtn.appendChild(removeIcon);

        //listener for remove event:
        removeBtn.addEventListener("click", () => {
            modalHandler.removePromptBox.classList.remove("remove");
            modalHandler.removePromptBox.classList.remove("hide");
            modalHandler.removePromptBox.classList.add("show");
            this.deleteEval(removeBtn);
        })

        //done button
        let doneBtn = document.createElement("button");
        let doneIcon = document.createElement("i");
        doneIcon.className = "bi bi-check-circle";
        doneBtn.appendChild(doneIcon);

        if( panelName == "completedItems"){
            doneBtn.setAttribute("disabled", true);
            doneBtn.className = "done";
        }

        //listener for done event:
        doneBtn.addEventListener("click", () => {
            let item = doneBtn.parentElement.parentElement;
            let itemId = doneBtn.parentElement.previousElementSibling.innerText;
            this.deleteItemFromStack(itemId, "todo-stage", true);
            console.log("done log:");
            console.log(localStorage);
            let parent = item.parentElement;
            let removedItem = parent.removeChild(item);
            removedItem.classList.add("activity-done");
            removedItem.lastElementChild.lastElementChild.setAttribute("disabled", true);
            removedItem.lastElementChild.lastElementChild.className = "done"
            this.completedItems.classList.remove("d-none");
            this.completedItemsTitle.classList.remove("d-none");
            this.completedItems.insertBefore(removedItem, this.completedItems.childNodes[0]);
        })

        buttons.appendChild(removeBtn);
        buttons.appendChild(doneBtn);
        itemBox.appendChild(itemText);
        itemBox.appendChild(itemID);
        itemBox.appendChild(buttons);

        if(panelName == "stageItems"){
            this.stageItems.insertBefore(itemBox, this.stageItems.childNodes[0]);
        }else if (panelName ==="completedItems"){
            this.completedItems.insertBefore(itemBox, this.completedItems.childNodes[0]);
        }
    }

    //reset IDs after delete or send to completed panel:
    // resetIds(panelName){
    //     if(panelName === "stageItems"){
    //         let id = 0;
    //         this.stageItemsStack.forEach((item) => {
    //             item.id = id;
    //             id++;
    //         })
    //     }else if(panelName ==="completedItems"){
    //         let id = 0;
    //         this.completedItemsStack.forEach((item) => {
    //             item.id = id;
    //             id++;
    //         })
    //     }
    // }
}

let modalHandler = new ModalHandler();
let database = new Database();
let noteHandle = new NoteHandle();
noteHandle.addItemListener();
noteHandle.initializeDatabase();

console.log(localStorage);

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  





//////////////////////////////////////////////////////////////////////////////
///////////// Old Version With out Storage and Class System: /////////////////
//////////////////////////////////////////////////////////////////////////////


// let inputText = document.getElementById("activity");
// let addBtn = document.getElementById("add");
// let completedItems = document.getElementById("todo-completed");
// let stageItems = document.getElementById("todo-stage");
// let removePromptBox = document.getElementById("removePrompt");
// let cancelDelete = document.querySelectorAll("button[data-dismiss='modal']");
// let confirmDelete = document.getElementById("confirmDelete");
// let completedItemsTitle = document.getElementById("completed-items-title");


//Handle deletion proccess:
// function deleteEval(e) {
//     confirmDelete.onclick = deleteHandle;
//     function deleteHandle() {
//         let item = e.parentElement.parentElement;
//         let parent = item.parentElement;
//         item.style.animation = "itemFadeOut 0.5s ease";
//         item.style.opacity = 1;
//         item.addEventListener("animationend", function () {
//             parent.removeChild(item);
//             if (parent.id === "todo-completed") {
//                 let items = document.querySelectorAll("#todo-completed li");
//                 if (items.length == 0) {
//                     parent.classList.add("d-none");
//                     completedItemsTitle.classList.add("d-none");
//                 }
//             }
//         })
//     };
// }

// //ready to trigger for cancel modal:
// for (let i = 0; i < cancelDelete.length; i++) {
//     cancelDelete[i].addEventListener("click", function () {
//         removePromptBox.classList.remove("show");
//         removePromptBox.classList.add("hide");
//         setTimeout(function () {
//             removePromptBox.classList.add("remove")
//         }, 500);
//     })
// }

//Listner for add new Item:
// addBtn.addEventListener("click", function () {
//     let activity = document.getElementById("activity");
//     if (activity.value) {
//         addItem(activity.value);
//         activity.value = "";
//     } else {
//         console.log("Null!");
//     }
// })

//Event for Enter key insted of Click:
// inputText.addEventListener("keyup", function (e) {
//     if (e.key === "Enter") {
//         e.preventDefault();
//         addBtn.click();
//     }
// })

//add new Item:
// function addItem(text) {
//     let itemContainer = document.getElementById("todo-stage");
//     let itemBox = document.createElement("li");
//     itemBox.className = "activity bg-light rounded-3 align-content-center mb-1"

//     let itemText = document.createElement("div");
//     itemText.className = "activity-text";
//     itemText.innerHTML = text;

//     //buttons
//     let buttons = document.createElement("div");
//     buttons.className = "buttons";

//     //remove button
//     let removeBtn = document.createElement("button");
//     let removeIcon = document.createElement("i");
//     removeIcon.className = "bi bi-trash";

//     removeBtn.appendChild(removeIcon);

//     //listener for remove event:
//     removeBtn.addEventListener("click", function () {
//         removePromptBox.classList.remove("remove");
//         removePromptBox.classList.remove("hide");
//         removePromptBox.classList.add("show");
//         deleteEval(this);
//     })

//     //done button
//     let doneBtn = document.createElement("button");
//     let doneIcon = document.createElement("i");
//     doneIcon.className = "bi bi-check-circle";
//     doneBtn.appendChild(doneIcon);

//     //listener for done event:
//     doneBtn.addEventListener("click", function () {
//         let item = this.parentElement.parentElement;
//         let parent = item.parentElement;
//         let removedItem = parent.removeChild(itemBox);
//         removedItem.classList.add("activity-done");
//         removedItem.lastElementChild.lastElementChild.setAttribute("disabled", true);
//         removedItem.lastElementChild.lastElementChild.className = "done"
//         completedItems.classList.remove("d-none");
//         completedItemsTitle.classList.remove("d-none");
//         completedItems.insertBefore(removedItem, completedItems.childNodes[0]);
//     })

//     buttons.appendChild(removeBtn);
//     buttons.appendChild(doneBtn);
//     itemBox.appendChild(itemText);
//     itemBox.appendChild(buttons);

//     itemContainer.insertBefore(itemBox, itemContainer.childNodes[0]);
// }





