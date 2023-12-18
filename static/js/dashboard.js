document.addEventListener('DOMContentLoaded', (event)=>{
    window.cssuper = {};
    window.cssuper.intervalID = 0;

    //get buttons
    dashboard_menu_buttons = Array.from(document.querySelectorAll(".dashboard_menu_item"))

    //get the body for the initially selected tab
    const first_tab = document.querySelector('.dashboard_selected_menu')
    populate_dashboard_body(first_tab)

    //map buttons to get their contents
    dashboard_menu_buttons.map((btn)=>{
        btn.addEventListener('click', (event)=>{
            if (window.cssuper.intervalID != 0) {
                clearInterval(window.cssuper.intervalID);
            }

            const clicked_tab = event.target
            change_dashboard_active_tab(clicked_tab, dashboard_menu_buttons)
            populate_dashboard_body(clicked_tab)
        })
    })

    //clear window intervals on button press
    
})


//changes the active button, and sends a request to get the menu's contents
function change_dashboard_active_tab(clicked_tab, btns){
    //check if we clicked the already active tab
    if (clicked_tab.classList.contains("dashboard_selected_menu")){
        return
    }

    //otherwise, remove the selected class from all buttons
    btns.map((btn)=>{
        btn.classList.remove('dashboard_selected_menu')
    })

    //add the class to the event target
    clicked_tab.classList.add('dashboard_selected_menu')

    //make request to get the body and insert it
    //populate_dashboard_body(event)

}

async function populate_dashboard_body(clicked_tab){

    //get the dashboard body
    const body = document.getElementById("dashboard_body")
    //console.log(event.target.dataset.get_route)

    //set body to loader
    const loader = create_loader()
    loader.classList.add('fa-3x')
    body.innerHTML = ""
    body.appendChild(loader)

    //send the request to get the dashboard body
    const response = await fetch(clicked_tab.dataset.get_route)
    const body_content = await response.text()
    
    //place the body in the body div
    body.innerHTML = body_content

    //execute the appropriate scripts, based on the chosen tab
    if (clicked_tab.id == "dashboard_my_sites_tab"){
        console.log("execute scripts for my sites tab")
        fetch_user_sites()
    } else if (clicked_tab.id == "dashboard_shared_sites_tab"){
        console.log("execute scripts for shared sites tab")
        fetch_shared_sites()
    } else if (clicked_tab.id == "dashboard_account_details_tab") {
        console.log("execute scripts for account details tab")
        fetch_account_details()
    }

}

//functions for rendering the user's sites table
async function fetch_user_sites(){
    const user_websites_tbody = document.getElementById('user_sites_dashboard_container')
    const endpoint = `/sites_data`
    console.log(endpoint)

    //add loader
    user_websites_tbody.appendChild(create_loader())

    //get data
    const response = await fetch(endpoint)
    const websites = await validateJSON(response)
    console.log(websites)
    ////console.log("done")

    //clear current children, and add loader
    user_websites_tbody.innerHTML = ""  //clear all children

    if (websites.length == 0){
        user_websites_tbody.innerHTML = "<p>No sites yet.  Create one now!</p>"
    }

    //insert data into table
    websites.map((website)=>{
        //create card
        const card = document.createElement('div')
        card.classList.add('box')
        card.classList.add('p-2')
        card.classList.add('column')
        card.classList.add('is-one-quarter')
        card.classList.add('m-1')
        card.classList.add('has-shadow')
        card.classList.add('min-height-300')
        card.classList.add('is-flex')
        card.classList.add('is-flex-direction-column')
        card.classList.add('is-justify-content-space-between')

        //add site name col
        const site_name = document.createElement('h5')
        site_name.innerText = website.name_lbl
        site_name.classList.add('is-size-4')
        card.appendChild(site_name)

        //add hr
        //card.appendChild(document.createElement('hr'))

        //add card body
        const site_desc = document.createElement('p')
        site_desc.innerText = website.desc_lbl
        site_desc.classList.add('p-1')
        card.appendChild(site_desc)

        //add status text
        const status_text = document.createElement("div")
        status_text.classList.add('is-flex', 'is-flex-row', 'is-justify-content-flex-start', 'is-align-items-center', 'has-text-link')
        status_text.innerText = "Fetching Status..."
        status_text.id = `status_of_${website.id}`
        card.appendChild(status_text)

        //add action buttons
        const card_actions = document.createElement('div')
        card_actions.classList.add('is-flex')
        card_actions.classList.add('is-flex-row')
        card_actions.classList.add('is-justify-content-flex-end')
        card_actions.classList.add('is-align-items-center')
        card.appendChild(card_actions)

        //add visit link
        const visit_link = document.createElement('a')
        const visit_icon = document.createElement('i')
        visit_icon.classList.add('fa-eye')
        visit_icon.classList.add('fa-solid')
        visit_icon.classList.add('link_btn')
        visit_link.appendChild(visit_icon)
        visit_link.classList.add('ml-2')
        visit_link.href = "http://" + website.hostname
        visit_link.target = "_blank"
        card_actions.appendChild(visit_link)

        //Add file upload link
        const upload_icon = document.createElement('i')
        upload_icon.classList.add('fa-upload')
        upload_icon.classList.add('fa-solid')
        upload_icon.classList.add('link_btn')
        upload_icon.classList.add('ml-2')
        upload_icon.dataset.site_id = website.id
        upload_icon.addEventListener('click', async (event) => {
            await fetch_upload_form(event)
            update_uploaded_file_name()
        })
        card_actions.appendChild(upload_icon)

        //add terminal link
        const terminal_icon = document.createElement('i')
        terminal_icon.dataset.site_id = website.id
        terminal_icon.dataset.name_lbl = website.name_lbl    //for displaying in the terminal
        terminal_icon.classList.add('fa-terminal')
        terminal_icon.classList.add('fa-solid')
        terminal_icon.classList.add('link_btn')
        terminal_icon.classList.add('ml-2')
        terminal_icon.addEventListener('click', async (event)=>{
            await fetch_site_terminal(event)
            init_terminal_socketio(event)
        })
        card_actions.appendChild(terminal_icon)
        

        //Add share link
        const share_icon = document.createElement('i')
        share_icon.classList.add('fa-share')
        share_icon.classList.add('fa-solid')
        share_icon.classList.add('link_btn')
        share_icon.classList.add('ml-2')
        share_icon.dataset.site_id = website.id
        share_icon.addEventListener('click', async (event) => {
            await fetch_share_site_form(event)
            fill_shared_with_table()
        })
        card_actions.appendChild(share_icon)

        //Add plan link
        const plan_icon = document.createElement('i')
        plan_icon.classList.add('fa-dollar-sign')
        plan_icon.classList.add('fa-solid')
        plan_icon.classList.add('link_btn')
        plan_icon.classList.add('ml-2')
        plan_icon.dataset.site_id = website.id
        plan_icon.addEventListener('click', async (event) => {
            await fetch_plan_site_form(event)
            initialPlanSetup()
        })
        card_actions.appendChild(plan_icon)

        //add the delete button
        //onst del_btn = document.createElement('button')
        //.classList.add("button")
        //del_btn.classList.add("is-primary")
        const del_icon = document.createElement('i')
        del_icon.addEventListener('click', (event)=>{
            delete_site(website.id)
        })
        del_icon.classList.add('link_btn')
        del_icon.classList.add('fa-solid')
        del_icon.classList.add('fa-trash')
        del_icon.classList.add('ml-2')
        //del_btn.appendChild(icon)
        card_actions.appendChild(del_icon)

        //add tr to body
        user_websites_tbody.appendChild(card)
    })

    //Start interval for updating site status
    update_sites_status()
    window.cssuper.intervalID = setInterval(update_sites_status, 10000)
}

async function delete_site(id){
    console.log('deleting site!')

    //create and add loader
    const user_websites_tbody = document.getElementById('user_sites_dashboard_container')
    user_websites_tbody.innerHTML = ""
    user_websites_tbody.appendChild(create_loader())

    //delete record and get results
    fetch("/delete_site/" + id + '/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        //body: JSON.stringify(dataToSend),
        })
        .then(response => {
            //check if the request was successful (status code 2xx)
            if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
            }
            //if the response is ok, refresh the table
            console.log('refreshing table')
            fetch_user_sites()
        })
        .catch(error => {
            //handle errors during the fetch
            console.error('Fetch error:', error);
        });
}

//end functions for rendering the user's sites table
//functions for rendering the user's sites table

async function fetch_shared_sites(){
    const user_websites_tbody = document.getElementById('shared_sites_dashboard_container')
    const endpoint = `/shared_sites_data`
    console.log(endpoint)

    //add loader
    user_websites_tbody.appendChild(create_loader())

    //get data
    const response = await fetch(endpoint)
    const websites = await validateJSON(response)
    console.log(websites)
    //console.log("done")

    //clear current children, and add loader
    user_websites_tbody.innerHTML = ""  //clear all children

    if (websites.length == 0){
        user_websites_tbody.innerHTML = "<p>Nobody has shared a site with you.</p>"
    }

    //insert data into table
    websites.map((website)=>{
        //create card
        const card = document.createElement('div')
        card.classList.add('box')
        card.classList.add('p-2')
        card.classList.add('column')
        card.classList.add('is-one-quarter')
        card.classList.add('m-1')
        card.classList.add('has-shadow')
        card.classList.add('min-height-300')
        card.classList.add('is-flex')
        card.classList.add('is-flex-direction-column')
        card.classList.add('is-justify-content-space-between')

        //add site name col
        const site_name = document.createElement('h5')
        site_name.innerText = website.name_lbl
        site_name.classList.add('is-size-4')
        card.appendChild(site_name)

        //add hr
        //card.appendChild(document.createElement('hr'))

        //add card body
        const site_desc = document.createElement('p')
        site_desc.innerText = website.desc_lbl
        site_desc.classList.add('p-1')
        card.appendChild(site_desc)

        //add status text
        const status_text = document.createElement("div")
        status_text.classList.add('is-flex', 'is-flex-row', 'is-justify-content-flex-start', 'is-align-items-center', 'has-text-link')
        status_text.innerText = "Fetching Status..."
        status_text.id = `status_of_${website.id}`
        card.appendChild(status_text)

        //add action buttons
        const card_actions = document.createElement('div')
        card_actions.classList.add('is-flex')
        card_actions.classList.add('is-flex-row')
        card_actions.classList.add('is-justify-content-flex-end')
        card_actions.classList.add('is-align-items-center')
        card.appendChild(card_actions)

        //add visit link
        const visit_link = document.createElement('a')
        const visit_icon = document.createElement('i')
        visit_icon.classList.add('fa-eye')
        visit_icon.classList.add('fa-solid')
        visit_icon.classList.add('link_btn')
        visit_link.appendChild(visit_icon)
        visit_link.classList.add('ml-2')
        visit_link.href = "http://" + website.hostname
        visit_link.target = "_blank"
        card_actions.appendChild(visit_link)

        //Add file upload link
        const upload_icon = document.createElement('i')
        upload_icon.classList.add('fa-upload')
        upload_icon.classList.add('fa-solid')
        upload_icon.classList.add('link_btn')
        upload_icon.classList.add('ml-2')
        upload_icon.dataset.site_id = website.id
        upload_icon.addEventListener('click', async (event) => {
            await fetch_upload_form(event)
            update_uploaded_file_name()
        })
        card_actions.appendChild(upload_icon)

        //add terminal link
        const terminal_link = document.createElement('a')
        const terminal_icon = document.createElement('i')
        terminal_icon.classList.add('fa-terminal')
        terminal_icon.classList.add('fa-solid')
        terminal_icon.classList.add('link_btn')
        terminal_link.appendChild(terminal_icon)
        terminal_link.classList.add('ml-2')
        terminal_link.href = `/terminal/${website.id}/`
        card_actions.appendChild(terminal_link)

        //add tr to body
        user_websites_tbody.appendChild(card)
    })

    //Start interval for updating site status
    update_shared_sites_status()
    window.cssuper.intervalID = setInterval(update_shared_sites_status, 10000)
}

//end functions for rendering the user's sites table
//functions for showing the upload files to website body
async function fetch_upload_form(event){
    const dashboard_body = document.getElementById('dashboard_body')
    const endpoint = `/upload_files/` + event.target.dataset.site_id
    console.log(endpoint)

    //add loader
    dashboard_body.innerHTML = ""
    dashboard_body.appendChild(create_loader())

    //get data
    const response = await fetch(endpoint)
    const body_content = await response.text()
    console.log(body_content)
    //console.log("done")

    //set body innerhtml
    dashboard_body.innerHTML = body_content

}

function update_uploaded_file_name() {
    const fileInput = document.getElementById("file_upload_input");
    fileInput.onchange = () => {
        if (fileInput.files.length > 0) {
            const fileName = document.getElementById("uploaded_file_name");
            fileName.innerText = fileInput.files[0].name;
        }
    }
    console.log("Ready for upload");
}

//end functions for showing the upload files to website body
//functions for showing the share site access form in website body
async function fetch_share_site_form(event){
    const dashboard_body = document.getElementById('dashboard_body')
    const endpoint = `/share_site/` + event.target.dataset.site_id
    console.log(endpoint)

    //add loader
    dashboard_body.innerHTML = ""
    dashboard_body.appendChild(create_loader())

    //get data
    const response = await fetch(endpoint)
    const body_content = await response.text()
    console.log(body_content)
    //console.log("done")

    //set body innerhtml
    dashboard_body.innerHTML = body_content

}

async function fill_shared_with_table() {
    const site_id = document.getElementById('siteID').value

    const shared_body = document.getElementById('shared_body')
    const endpoint = `/shared_users_data/${site_id}/`
    console.log(endpoint)

    //add loader
    shared_body.appendChild(create_loader())

    //get data
    const response = await fetch(endpoint)
    const users = await validateJSON(response)
    console.log(users)
    //console.log("done")

    //clear current children, and add loader
    shared_body.innerHTML = ""  //clear all children

    //insert data into table
    users.map((user)=>{
        //create row
        const tr = document.createElement('tr')
        
        //add ID col
        const user_id = document.createElement('td')
        user_id.innerText = user.id
        tr.appendChild(user_id)

        //add name col
        const user_name = document.createElement('td')
        user_name.innerText = user.name
        tr.appendChild(user_name)

        //add email col
        const user_email = document.createElement('td')
        user_email.innerText = user.email
        tr.appendChild(user_email)

        //add the delete button
        const del_btn = document.createElement('i')
        del_btn.addEventListener('click', (event)=>{
            unshare_site(site_id, user.id)
        })
        del_btn.classList.add('fa-solid', 'fa-trash', 'link_btn')
        tr.appendChild(del_btn)

        //add tr to body
        shared_body.appendChild(tr)
    })
}

async function unshare_site(site_id, user_id) {
    console.log('Unsharing site')

    //create and add loader
    const shared_body = document.getElementById('shared_body')
    shared_body.innerHTML = ""
    shared_body.appendChild(create_loader())

    //delete record and get results
    fetch(`/unshare_site/${site_id}/${user_id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //body: JSON.stringify(dataToSend),
    })
        .then(response => {
            //check if the request was successful (status code 2xx)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            //if the response is ok, refresh the table
            console.log('refreshing table')
            fill_shared_with_table()
        })
        .catch(error => {
            //handle errors during the fetch
            console.error('Fetch error:', error);
        });
}

//end functions for showing the share site access form in website body
//functions for changing plans

async function fetch_plan_site_form(event){
    const dashboard_body = document.getElementById('dashboard_body')
    const endpoint = `/plan/` + event.target.dataset.site_id
    console.log(endpoint)

    //add loader
    dashboard_body.innerHTML = ""
    dashboard_body.appendChild(create_loader())

    //get data
    const response = await fetch(endpoint)
    const body_content = await response.text()
    console.log(body_content)
    //console.log("done")

    //set body innerhtml
    dashboard_body.innerHTML = body_content

}

const planNames = ["Basic", "Standard", "Pro"];

function initialPlanSetup() {
    const sitePlan = Number.parseInt(document.getElementById("sitePlan").value);
    setupPage(sitePlan);
}

function setupPage(sitePlan) {
    const currentPlanHeading = document.getElementById("current_plan_heading");
    currentPlanHeading.innerText = `Current Plan: ${planNames[sitePlan-1]}`;

    // Fill the plan divs
    const basicDiv = document.getElementById("basic_div");
    basicDiv.innerHTML = "";
    if (sitePlan == 1) {
        const btn = document.createElement("button");
        btn.classList.add("button");
        btn.innerText = "Selected";
        btn.disabled = true
        basicDiv.appendChild(btn);
    } else {
        const btn = document.createElement("button");
        btn.classList.add("button", "is-link");
        btn.innerText = "Select Basic Plan";
        basicDiv.appendChild(btn);
        btn.addEventListener("click", doBasicPlan);
    }

    const standardDiv = document.getElementById("standard_div");
    standardDiv.innerHTML = "";
    if (sitePlan == 2) {
        const btn = document.createElement("button");
        btn.classList.add("button");
        btn.innerText = "Selected";
        btn.disabled = true
        standardDiv.appendChild(btn);
    } else {
        const btn = document.createElement("button");
        btn.classList.add("button", "is-link");
        btn.innerText = "Select Standard Plan";
        standardDiv.appendChild(btn);
        btn.addEventListener("click", doStandardPlan);
    }

    const proDiv = document.getElementById("pro_div");
    proDiv.innerHTML = "";
    if (sitePlan == 3) {
        const btn = document.createElement("button");
        btn.classList.add("button");
        btn.innerText = "Selected";
        btn.disabled = true
        proDiv.appendChild(btn);
    } else {
        const btn = document.createElement("button");
        btn.classList.add("button", "is-link");
        btn.innerText = "Select Pro Plan";
        proDiv.appendChild(btn);
        btn.addEventListener("click", doProPlan);
    }
}

function doBasicPlan() { changePlan(1); }
function doStandardPlan() { changePlan(2); }
function doProPlan() { changePlan(3); }

function changePlan(newPlan) {
    const siteID = Number.parseInt(document.getElementById("siteID").value);

    fetch("/change_plan/" + siteID + "/" + newPlan + '/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    })
    .then(response => {
        //check if the request was successful (status code 2xx)
        if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
        }
        //if the response is ok, refresh the page contents
        console.log(`Set site ${siteID} to plan ${newPlan}`);
        setupPage(newPlan);
    })
    .catch(error => {
        //handle errors during the fetch
        console.error('Fetch error:', error);
    });
}

//end functions for changing plans
//functions for account details page

async function fetch_account_details() {
    const endpoint = `/user_info`;

    const response = await fetch(endpoint);
    const user = await validateJSON(response);

    const fname_p = document.getElementById("fname_p");
    fname_p.innerText = `First Name: ${user.fname}`;
    const lname_p = document.getElementById("lname_p");
    lname_p.innerText = `Last Name: ${user.lname}`;
    const email_p = document.getElementById("email_p");
    email_p.innerText = `Email: ${user.email}`;
    const billing_p = document.getElementById("billing_p");
    billing_p.innerText = `${user.billing_address}`;
}

//end functions for account details page
//functions for updating container status

async function update_sites_status() {
    const endpoint = `/sites_status`;

    const response = await fetch(endpoint);
    const data = await validateJSON(response);

    console.log("Updating status");

    if (data.error) {
        return;
    }

    for (const stub of data.sites_status) {
        const status_text = document.getElementById(`status_of_${stub.id}`);

        if (stub.success) {
            if (stub.online == "running") {
                status_text.innerText = `${stub.online} - ${stub.cores} core: ${stub.cpu}% - ${stub.mem}/${stub.mem_lim}`;
            } else {
                status_text.innerText = `${stub.online}`;
            }
        } else {
            status_text.innerText = "Couldn't get status";
        }
    }
}

async function update_shared_sites_status() {
    const endpoint = `/shared_sites_status`;

    const response = await fetch(endpoint);
    const data = await validateJSON(response);

    console.log("Updating status");

    if (data.error) {
        return;
    }

    for (const stub of data.sites_status) {
        const status_text = document.getElementById(`status_of_${stub.id}`);
        
        if (stub.success) {
            if (stub.online == "running") {
                status_text.innerText = `${stub.online} - ${stub.cores} core: ${stub.cpu}% - ${stub.mem}/${stub.mem_lim}`;
            } else {
                status_text.innerText = `${stub.online}`;
            }
        } else {
            status_text.innerText = "Couldn't get status";
        }
    }
}

//end functions for updating container status
//functions for displaying terminal in dashboard
async function fetch_site_terminal(event){
    const dashboard_body = document.getElementById('dashboard_body')
    const endpoint = `/terminal/` + event.target.dataset.site_id
    console.log(endpoint)

    //add loader
    dashboard_body.innerHTML = ""
    dashboard_body.appendChild(create_loader())

    //get data
    const response = await fetch(endpoint)
    const body_content = await response.text()
    console.log(body_content)

    //set body innerhtml
    dashboard_body.innerHTML = body_content
}

function init_terminal_socketio(event){
    //create terminal
    var term = new Terminal();
    term.open(document.getElementById('terminal'));

    //add prompt function
    //add function to prompt user for input
    term.prompt = function(){
        term.write("\r\n$ ")
    }

    //greet the user
    //term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
    term.write("Greetings from \x1B[1;3;32m" + event.target.dataset.name_lbl + "!\x1B[0m")
    term.prompt()

    //store terminal contents
    var entries = []
    var curr_line = ""
    var prev_cmd_idx = 1

    //respond to keys being pressed
    term.on('key', (key, event)=>{
        //index of prev command to get on up key pressed
        
        
        //enter key
        if (event.keyCode === 13){
            //save entries
            entries.push(curr_line)

            //send command to server
            send_command(curr_line)

            //clear out curr_line to prepare for next command
            curr_line = ""
            term.write("\r\n")
        }
        //backspace key
        else if (event.keyCode === 8){
            curr_line = curr_line.slice(0, curr_line.length-1)
            term.write("\b \b")
        }
        //up arrow key
        /*
        else if (event.keyCode === 38){
            const prev_entry = entries.length >= prev_cmd_idx ? entries[entries.length - prev_cmd_idx] : entries[0]
            prev_cmd_idx += 1
            term.write(prev_entry)
        }
        //down arrow key
        else if (event.keyCode === 40){}
        */
        //other keys
        else {
            curr_line += key
            term.write(key)
        }
    })


    //create window terminal object
    window.terminal = {}
    window.terminal.socket = io.connect("/");
    window.terminal.terminal = term
    window.terminal.site_id = event.target.dataset.site_id

    //do this when connection is successful
    window.terminal.socket.on("connect", join)

    //do this when output from a command is received
    window.terminal.socket.on('command', receive_results)

    //do this when auth failure is received
    window.terminal.socket.on("auth_failure", auth_failure)
}




//socketio functions
function join() {
    // log the successful connection and the socket's id
    console.log(`Connected: Socket ${window.terminal.socket.id}`);
}

//functions for sending and receiving terminal io
function send_command(command){
    //send message
    window.terminal.socket.emit('command',{
        'site_id': window.terminal.site_id,
        'command': command,
    })
}

function receive_results(data){
    //if command failed
    if (data.stderr){
        window.terminal.terminal.write("\x1B[1;3;31m" + data.stderr +"\x1B[0m".replace(/(\r|\n)/g, "\r\n"))
    }
    //if command succeeded
    else if (data.stdout){
        window.terminal.terminal.write(data.stdout.replace(/(\r|\n)/g, "\r\n"))
    }

    //prompt for next input
    window.terminal.terminal.prompt()
}

function auth_failure(data){
    window.terminal.terminal.write("\x1B[1;3;31m" + data.stderr +"\x1B[0m".replace(/(\r|\n)/g, "\r\n"))
}
//end functions for displaying terminal in dashboard