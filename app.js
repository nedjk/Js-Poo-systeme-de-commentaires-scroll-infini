import { alertElement } from "./functions/alert.js"
import { fetchJSON } from "./functions/api.js"

class InfinitePagination {
    /** @type {string} */
    #endpoint
    /** @type {HTMLTemplateElement} */
    #template
    /** @type {HTMLElement} */
    #loader
    /** @type {HTMLElement} */
    #target
    /** @type {Object} */
    #elements
    /** @type {IntersectionObserver} */
    #observer
    /** @type {boolean} */
    #loading = false
    /** @type {number} */
    #page = 1

    /** @param {HTMLElement} element */
    constructor (element) {
        this.#loader = element
        this.#endpoint = element.dataset.endpoint
        this.#template = document.querySelector(element.dataset.template)
        this.#target = document.querySelector(element.dataset.target)
        this.#elements = JSON.parse(element.dataset.elements)
        this.#observer = new IntersectionObserver ((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    this.#loadMore()
                }
            }
        })
        this.#observer.observe(element)
    }

    async #loadMore() {
        if(this.#loading) {
            return
        }
        this.#loading = true
        try {
            const url = new URL(this.#endpoint)
            url.searchParams.set('_page', this.#page)
            const comments = await fetchJSON(url.toString())
            if(comments.length === 0){
                this.#observer.disconnect()
                this.#loader.remove()
                return
            }
            for (const comment of comments) {
                const cloneTemplate = this.#template.content.cloneNode(true)
                for (const [key,selector] of Object.entries(this.#elements)) {
                    cloneTemplate.querySelector(selector).innerText = comment[key]
                }
                this.#target.append(cloneTemplate)
            }
            this.#page++
            this.#loading = false
        } catch (e) {
            this.#loader.style.display = 'none'
            const error = alertElement('Impossible de charger le contenu')
            error.addEventListener('close', () => {
                this.#loader.style.removeProperty('display')
                this.#loading = false
            })
            this.#target.append(error)
        }

    }
}

class FetchFrom {

    /** @type {string} */
    #endpoint
    /** @type {HTMLTemplateElement} */
    #template
    /** @type {HTMLElement} */
    #loader
    /** @type {HTMLElement} */
    #target
    /** @type {Object} */
    #elements

    /**
     * 
     * @param {HTMLFormElement} form 
     */
    constructor (form) {
        this.#endpoint = form.dataset.endpoint
        this.#template = document.querySelector(form.dataset.template)
        this.#target = document.querySelector(form.dataset.target)
        this.#elements = JSON.parse(form.dataset.elements)
        form.addEventListener('submit', event => {
            event.preventDefault()
            this.#onSubmitForm(form)
        })
    }

    /**
     * @param {HTMLElement} form 
     */
    async #onSubmitForm(form) {
        const button = form.querySelector('button')
        button.setAttribute('disabled', '')
        try {
            const data = new FormData(form)

            const comment = await fetchJSON(this.#endpoint, {
                method : 'POST',
                body: JSON.stringify(Object.fromEntries(data))
            })

            const templateElement = this.#template.content.cloneNode(true)
            for (const [key,selector] of Object.entries(this.#elements)) {
                templateElement.querySelector(selector).innerText = comment[key]
                templateElement.querySelector(selector).parentElement.style.backgroundColor = 'bisque'
            }

            this.#target.prepend(templateElement)
            const success = alertElement('Merci pour votre commentaire','success')
            form.prepend(success)
            form.reset()
            button.removeAttribute('disabled')
        } catch (e) {
            const error = alertElement('Impossible de soumettre le formulaire')
            error.addEventListener('close', () => {
                button.removeAttribute('disabled')
            })
            form.prepend(error)
        }
    }
}
document
    .querySelectorAll('.js-infinite-pagination')
    .forEach( element => new InfinitePagination(element))
document
    .querySelectorAll('.js-form-fetch')
    .forEach( element => new FetchFrom(element))