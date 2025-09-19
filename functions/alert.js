/**
 * Renvoie un element html représentant une alerte
 * @param {message} message 
 * @returns {HTMLElement}
 */
export function alertElement(message,type = 'danger') {
    /** @type {HTMLElement} */
    const templateAlert = document.querySelector('#alert').content.cloneNode(true)

    const alertDiv = templateAlert.firstElementChild
    alertDiv.classList.add(`alert-${type}`)

    templateAlert.querySelector('.js-text').innerText = message
    templateAlert.querySelector('button').addEventListener('click', (event) => {
        event.preventDefault()
        event.target.parentElement.remove()
        templateAlert.dispatchEvent(new CustomEvent('close'))
    })
    return templateAlert
}