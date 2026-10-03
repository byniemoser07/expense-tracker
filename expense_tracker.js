let expenses = [];
let editing_expense_id = null;
console.log(expenses);
const form = document.querySelector('#expense_tracker_form');
console.log(form);

form.addEventListener('submit',function(event){
    event.preventDefault();
    console.log("Form processing handled by js");
    const formData = new FormData(form);
    let title = formData.get('expense_name');
    if (title == ""){
        alert("Username is needed.");
        return;
    }
    console.log(title);
    let amount = formData.get('expense_amount');
    amount = Number(amount);
    if (amount<=0){
        alert("Enter a positive amount value ");
        return;
    }
    console.log(amount);
    let category = formData.get("expense_category");
    if(category == ""){
        alert("choose one category atleast");
        return;
    }
    console.log(category);
    let date = formData.get("expense_date");
    let current_date = new Date();
    let year = current_date.getFullYear();
    let month = String(current_date.getMonth() + 1). padStart(2, "0");
    let for_date = String(current_date.getDate()). padStart(2, "0");
    let formatted_date = `${year}-${month}-${for_date}`;
    if (date == ""){
        alert("date is mandatory");
        return;
    }
    else if( date > formatted_date){
        alert("enter valid date");
        return;
    }
    console.log(date);
    
    if(editing_expense_id === null){
    let expense = {
    id : crypto.randomUUID(),
    title : title,
    amount : amount,
    category : category,
    date : date
    };
    console.log(expense);
    expenses.push(expense);
    save_expenses_to_local_storage();
    }
    else{
    let found = expenses.find(expense => expense.id === editing_expense_id);
    found.title = title;
    found.amount = amount;
    found.category = category;
    found.date = date;
    save_expenses_to_local_storage();
    console.log(found);
    editing_expense_id = null;
    }
    render_expenses(expenses);
    update_summary();
    form.reset();
})

function save_expenses_to_local_storage(){
let expenses_serialized = JSON.stringify(expenses);
localStorage.setItem("expenses",expenses_serialized);
console.log(expenses_serialized);}

function load_expenses_from_local_storage(){
if (localStorage.getItem("expenses")){
let expenses_deserialized = JSON.parse(localStorage.getItem("expenses"));
console.log(expenses_deserialized);
expenses = expenses_deserialized;
}
}

function render_expenses(expenses_to_display){
    const expense_list = document.querySelector("#expense_list");
    const empty_state = document.querySelector("#empty_state");
    expense_list.innerText = "";
    if (expenses_to_display.length === 0){
        empty_state.style.display = "block";
    }
    else {
        empty_state.style.display = "none";
    }
    for(const expense of expenses_to_display){
    const expense_card =document.createElement('div');
    expense_card.classList.add("expense_card");

    const top_row = document.createElement('div');
    top_row.classList.add("expense_top_row");

    const bottom_row = document.createElement("div");
    bottom_row.classList.add("expense_bottom_row");

    const expense_card_title = document.createElement('h3');
    expense_card_title.textContent = expense.title;
    top_row.appendChild(expense_card_title);
    
    const expense_card_amount = document.createElement('strong');
    expense_card_amount.textContent = `₹${expense.amount}`;
    top_row.appendChild(expense_card_amount);

    expense_card.appendChild(top_row);

    const expense_card_category = document.createElement('h4');
    expense_card_category.textContent = expense.category;
    expense_card.appendChild(expense_card_category);

    const expense_card_date = document.createElement('h4');
    expense_card_date.textContent = expense.date;
    bottom_row.appendChild(expense_card_date);
    
    const delete_button = document.createElement('button');
    delete_button.textContent = "Delete";
    bottom_row.appendChild(delete_button);

    const edit_button = document.createElement('button');
    edit_button.textContent = "Edit";
    bottom_row.appendChild(edit_button);

    delete_button.addEventListener('click',function(event){
    const delete_function = confirm("do you really want to delete this expense?");
    if (delete_function){
    const remaining_expenses = expenses.filter((current_expense)=>{
    return current_expense.id !== expense.id;
    })
    expenses = remaining_expenses;
    save_expenses_to_local_storage();
    render_expenses(expenses);
    update_summary();
    }
    if (!delete_function) {
    return;
    }
    })

    edit_button.addEventListener('click',function(event){
        console.log(expense);
        let edited_expense_name = document.querySelector("#expense_name");
        edited_expense_name.value = expense.title;
        let edited_amount = document.querySelector("#expense_amount");
        edited_amount.value = expense.amount;
        let edited_category = document.querySelector("#expense_category");
        edited_category.value = expense.category;
        let edited_date = document.querySelector("#expense_date");
        edited_date.value = expense.date;
        editing_expense_id = expense.id;
    })
    expense_card.appendChild(bottom_row);

    expense_list.appendChild(expense_card);
    }
}
//separate category filter 
const filter_category = document.querySelector("#filter_category");
filter_category.addEventListener('change',function(event){
let category_selected = filter_category.value;
console.log(category_selected);
if (filter_category.value === "all_category"){
    render_expenses(expenses);
}
else{
const category_selected_expenses = expenses.filter(expense => expense.category === category_selected);
render_expenses(category_selected_expenses);
}
})
// separate month filter 
const filter_month = document.querySelector("#filter_month");
filter_month.addEventListener('change',function(event){
    let month_selected = filter_month.value;
    console.log(month_selected);
    
    if(filter_month.value === "all_months"){
        render_expenses(expenses);
    }
    else{
     const month_selected_expenses = expenses.filter(expense => expense.date.split("-")[1] === month_selected);
     render_expenses(month_selected_expenses);
    }
})

// Combined category + month filtering
/*function apply_filter(){
   let category_selected = filter_category.value;
   let month_selected = filter_month.value;
   const universal_filter = expenses.filter(expense => (category_selected === "all_category" || expense.category === category_selected) && (month_selected === "all_months" || expense.date.split("-")[1] === month_selected));
   render_expenses(universal_filter);
}
can directly write apply_filter() in the event blocks for month and category filtering instead of that big ass logic.
*/

const total_spent = document.querySelector("#total_spent_summary strong");
const this_month = document.querySelector("#this_month_summary strong");
const transactions = document.querySelector("#transactions_summary strong");

function update_summary() {
    transactions.textContent = expenses.length;
    let total_spent_expense = expenses.reduce((running_total,current_object)=>{
    return running_total + current_object.amount;
    },0
    )
    let formatted_total_expense = "₹"+total_spent_expense.toLocaleString();
    total_spent.textContent = formatted_total_expense;
    let current_date_forMonth = new Date();
    let current_month = String(current_date_forMonth.getMonth() + 1). padStart(2, "0");
    let current_month_expenses = expenses.filter(expense => expense.date.split("-")[1] === current_month) ;
    let this_month_expense = current_month_expenses.reduce((months_total,current_month_objects)=>{
    return months_total+current_month_objects.amount;
    },0
    )
    let formatted_expense_month = "₹"+this_month_expense.toLocaleString();
    this_month.textContent = formatted_expense_month;
}

load_expenses_from_local_storage();
render_expenses(expenses);
update_summary();