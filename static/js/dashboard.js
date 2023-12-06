document.addEventListener('DOMContentLoaded', (event)=>{
    //get buttons
    dashboard_menu_buttons = Array.from(document.querySelectorAll(".dashboard_menu_item"))

    //get the body for the initially selected tab
    const first_tab = document.querySelector('.dashboard_selected_menu')
    populate_dashboard_body(first_tab)

    //map buttons to get their contents
    dashboard_menu_buttons.map((btn)=>{
        btn.addEventListener('click', (event)=>{
            const clicked_tab = event.target
            change_dashboard_active_tab(clicked_tab, dashboard_menu_buttons)
            populate_dashboard_body(clicked_tab)
        })
    })
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
    }
}

//functions for rendering the user's sites table
async function fetch_user_sites(){
    const user_websites_tbody = document.getElementById('user_websites_tbody')
    const endpoint = `/sites_data`
    console.log(endpoint)

    //add loader
    user_websites_tbody.appendChild(create_loader())

    //get data
    const response = await fetch(endpoint)
    const websites = await validateJSON(response)
    console.log(websites)
    console.log("done")

    //clear current children, and add loader
    user_websites_tbody.innerHTML = ""  //clear all children

    //insert data into table
    websites.map((website)=>{
        //create row
        const tr = document.createElement('tr')
        
        //add site name col
        const site_name = document.createElement('td')
        site_name.innerText = website.name
        tr.appendChild(site_name)

        //add site id col
        const site_id = document.createElement('td')
        site_id.innerText = website.id
        tr.appendChild(site_id)

        //add image col
        const site_image = document.createElement('td')
        site_image.innerText = website.image
        tr.appendChild(site_image)

        //add visit link col
        const site_visit = document.createElement('td')
        const site_link = document.createElement('a')
        site_link.innerText = "Visit"
        site_link.href = "http://" + website.hostname
        site_visit.append(site_link)
        tr.appendChild(site_visit)

        //Add file upload link col
        const site_upload = document.createElement('td')
        const upload_link = document.createElement('a')
        upload_link.innerText = "Upload"
        upload_link.href = "/upload_files/" + website.id + "/"
        site_upload.append(upload_link)
        tr.appendChild(site_upload)

        //Add share link col
        const site_share = document.createElement('td')
        const share_link = document.createElement('a')
        share_link.innerText = "Share"
        share_link.href = "/share_site/" + website.id + "/"
        site_share.append(share_link)
        tr.appendChild(site_share)

        //add the delete button
        const del_btn = document.createElement('button')
        del_btn.addEventListener('click', (event)=>{
            delete_site(website.id)
        })
        const icon = document.createElement('i')
        icon.classList.add('fa-solid')
        icon.classList.add('fa-trash')
        del_btn.appendChild(icon)
        tr.appendChild(del_btn)

        //add tr to body
        user_websites_tbody.appendChild(tr)
    })
}

async function delete_site(id){
    console.log('deleting site!')

    //create and add loader
    const user_websites_tbody = document.getElementById('user_websites_tbody')
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
    const user_websites_tbody = document.getElementById('shared_websites_tbody')
    const endpoint = `/shared_sites_data`
    console.log(endpoint)

    //add loader
    user_websites_tbody.appendChild(create_loader())

    //get data
    const response = await fetch(endpoint)
    const websites = await validateJSON(response)
    console.log(websites)
    console.log("done")

    //clear current children, and add loader
    user_websites_tbody.innerHTML = ""  //clear all children

    //insert data into table
    websites.map((website)=>{
        //create row
        const tr = document.createElement('tr')
        
        //add site name col
        const site_name = document.createElement('td')
        site_name.innerText = website.name
        tr.appendChild(site_name)

        //add site id col
        const site_id = document.createElement('td')
        site_id.innerText = website.id
        tr.appendChild(site_id)

        //add image col
        const site_image = document.createElement('td')
        site_image.innerText = website.image
        tr.appendChild(site_image)

        //add visit link col
        const site_visit = document.createElement('td')
        const site_link = document.createElement('a')
        site_link.innerText = "Visit"
        //site_link.target = "_blank" //open in new tab
        site_link.href = "http://" + website.hostname
        site_visit.append(site_link)
        tr.appendChild(site_visit)

        //Add file upload link col
        const site_upload = document.createElement('td')
        const upload_link = document.createElement('a')
        upload_link.innerText = "Upload"
        upload_link.href = "/upload_files/" + website.id + "/"
        site_upload.append(upload_link)
        tr.appendChild(site_upload)

        //add owner col
        const site_owner = document.createElement('td')
        site_owner.innerText = website.owner_name
        tr.appendChild(site_owner)

        //add tr to body
        user_websites_tbody.appendChild(tr)
    })
}

//end functions for rendering the user's sites table