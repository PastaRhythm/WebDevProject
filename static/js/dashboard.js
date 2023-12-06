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
}