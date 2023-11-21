/**
 * Validate a response to ensure the HTTP status code indcates success.
 * 
 * @param {Response} response HTTP response to be checked
 * @returns {object} object encoded by JSON in the response
 */
function validateJSON(response) {
    if (response.ok) {
        return response.json();
    } else {
        return Promise.reject(response);
    }
}

function create_loader(){
    const loader = document.createElement('i')
    loader.classList.add('fa-solid')
    loader.classList.add('fa-gear')
    loader.classList.add('fa-spin')
    return loader
}